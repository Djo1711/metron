from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import numpy as np
from scipy.stats import norm

router = APIRouter()

# ===== Models =====
class ReverseConvertibleInput(BaseModel):
    ticker: str
    principal: float
    coupon_rate: float  # Annual coupon in %
    barrier_level: float  # As % (e.g., 60 means 60% of initial price)
    maturity_years: float
    spot_price: Optional[float] = None  # If None, fetch from yfinance
    volatility: Optional[float] = None  # If None, calculate historical
    risk_free_rate: float = 0.04  # Default 4%

class ReverseConvertibleOutput(BaseModel):
    fair_value: float
    coupon_value: float
    embedded_put_value: float
    break_even_price: float
    delta: float
    gamma: float
    vega: float
    theta: float

# ===== Pricing Functions =====
def black_scholes_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """
    Black-Scholes formula for European put option
    S: Spot price
    K: Strike price
    T: Time to maturity (years)
    r: Risk-free rate
    sigma: Volatility
    """
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    put_price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    return put_price

def calculate_greeks(S: float, K: float, T: float, r: float, sigma: float):
    """Calculate option Greeks"""
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    # Delta (put)
    delta = -norm.cdf(-d1)
    
    # Gamma
    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    
    # Vega
    vega = S * norm.pdf(d1) * np.sqrt(T) / 100  # Per 1% change in volatility
    
    # Theta (put, per day)
    theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) 
             + r * K * np.exp(-r * T) * norm.cdf(-d2)) / 365
    
    return {
        "delta": delta,
        "gamma": gamma,
        "vega": vega,
        "theta": theta
    }

# ===== Endpoints =====
@router.post("/reverse-convertible", response_model=ReverseConvertibleOutput)
async def price_reverse_convertible(input_data: ReverseConvertibleInput):
    """
    Price a Reverse Convertible structured product
    
    Structure:
    - Investor receives coupon payments
    - At maturity:
      - If stock >= barrier: receive principal
      - If stock < barrier: receive shares (lose principal)
    """
    try:
        # Get spot price if not provided
        spot = input_data.spot_price
        if spot is None:
            # TODO: Fetch from yfinance
            raise HTTPException(
                status_code=400,
                detail="spot_price required (yfinance integration coming soon)"
            )
        
        # Get volatility if not provided
        sigma = input_data.volatility
        if sigma is None:
            # TODO: Calculate historical volatility
            raise HTTPException(
                status_code=400,
                detail="volatility required (auto-calculation coming soon)"
            )
        
        # Calculate barrier strike price
        barrier_strike = spot * (input_data.barrier_level / 100)
        
        # Value of coupon payments (annuity)
        coupon_payment = input_data.principal * (input_data.coupon_rate / 100)
        pv_coupons = sum([
            coupon_payment * np.exp(-input_data.risk_free_rate * t)
            for t in range(1, int(input_data.maturity_years) + 1)
        ])
        
        # Value of embedded put option (what investor is SHORT)
        put_value = black_scholes_put(
            S=spot,
            K=barrier_strike,
            T=input_data.maturity_years,
            r=input_data.risk_free_rate,
            sigma=sigma
        )
        
        # Number of shares if converted
        n_shares = input_data.principal / spot
        embedded_put_value = n_shares * put_value
        
        # Fair value = Principal + PV(Coupons) - Embedded Put
        fair_value = (
            input_data.principal + 
            pv_coupons - 
            embedded_put_value
        )
        
        # Calculate Greeks
        greeks = calculate_greeks(
            S=spot,
            K=barrier_strike,
            T=input_data.maturity_years,
            r=input_data.risk_free_rate,
            sigma=sigma
        )
        
        # Break-even: price where total return = 0
        total_coupons = coupon_payment * input_data.maturity_years
        break_even = spot * (1 - (total_coupons / input_data.principal))
        
        return ReverseConvertibleOutput(
            fair_value=round(fair_value, 2),
            coupon_value=round(pv_coupons, 2),
            embedded_put_value=round(embedded_put_value, 2),
            break_even_price=round(break_even, 2),
            delta=round(greeks["delta"] * n_shares, 4),
            gamma=round(greeks["gamma"] * n_shares, 6),
            vega=round(greeks["vega"] * n_shares, 2),
            theta=round(greeks["theta"] * n_shares, 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def pricing_info():
    return {
        "available_products": ["reverse-convertible"],
        "coming_soon": ["autocall", "barrier-option"]
    }

"""
AJOUTER CES 3 ENDPOINTS À TON pricing.py EXISTANT
(Garde ton Reverse Convertible, ajoute juste ceux-ci)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import numpy as np
from scipy.stats import norm

# ===== Nouveaux Models =====

class AutocallInput(BaseModel):
    ticker: str
    principal: float
    autocall_barrier: float  # % (e.g., 100 = 100% of initial price)
    coupon_rate: float  # Annual coupon in %
    barrier_level: float  # % (e.g., 60 = 60% of initial price)
    maturity_years: float
    autocall_frequency: float = 0.25  # Quarterly observations
    spot_price: Optional[float] = None
    volatility: Optional[float] = None
    risk_free_rate: float = 0.04

class AutocallOutput(BaseModel):
    product: str
    fair_value: float
    coupon_value: float
    autocall_barrier_price: float
    protection_barrier_price: float
    max_gain: float
    max_loss: float
    risk_level: int
    probability_profit: float
    delta: float
    gamma: float
    vega: float
    theta: float

class CapitalProtectedInput(BaseModel):
    ticker: str
    principal: float
    protection_level: float  # % (usually 100 = 100% protected)
    participation_rate: float  # %
    maturity_years: float
    spot_price: Optional[float] = None
    volatility: Optional[float] = None
    risk_free_rate: float = 0.04

class CapitalProtectedOutput(BaseModel):
    product: str
    fair_value: float
    guaranteed_capital: float
    call_budget: float
    participation_rate: float
    max_gain: float
    max_loss: float
    risk_level: int
    probability_profit: float
    delta: float
    gamma: float
    vega: float
    theta: float
    break_even_price: float

class WarrantInput(BaseModel):
    ticker: str
    strike_price: float
    warrant_type: str = "call"  # "call" or "put"
    leverage: float = 5
    maturity_years: float
    spot_price: Optional[float] = None
    volatility: Optional[float] = None
    risk_free_rate: float = 0.04

class WarrantOutput(BaseModel):
    product: str
    fair_value: float
    option_value: float
    leverage: float
    strike_price: float
    intrinsic_value: float
    time_value: float
    max_gain: float
    max_loss: float
    risk_level: int
    probability_profit: float
    delta: float
    gamma: float
    vega: float
    theta: float
    break_even_price: float

# ===== Helper Functions (si pas déjà dans ton fichier) =====

def black_scholes_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call option pricing"""
    if T <= 0:
        return max(S - K, 0)
    
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

def calculate_greeks(S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call"):
    """Calculate Greeks"""
    if T <= 0:
        return {"delta": 0, "gamma": 0, "vega": 0, "theta": 0}
    
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    pdf_d1 = np.exp(-0.5 * d1**2) / np.sqrt(2 * np.pi)
    
    if option_type == "call":
        delta = norm.cdf(d1)
        theta = (-(S * pdf_d1 * sigma) / (2 * np.sqrt(T)) - r * K * np.exp(-r * T) * norm.cdf(d2))
    else:
        delta = -norm.cdf(-d1)
        theta = (-(S * pdf_d1 * sigma) / (2 * np.sqrt(T)) + r * K * np.exp(-r * T) * norm.cdf(-d2))
    
    gamma = pdf_d1 / (S * sigma * np.sqrt(T))
    vega = S * pdf_d1 * np.sqrt(T) / 100
    
    return {
        "delta": delta,
        "gamma": gamma,
        "vega": vega,
        "theta": theta / 365
    }

def monte_carlo_autocall(S0, K_autocall, K_barrier, T, r, sigma, coupon, principal, frequency, n_sims=10000):
    """Monte Carlo simulation for Autocall"""
    np.random.seed(42)
    dt = frequency
    n_steps = int(T / dt)
    payoffs = []
    
    for _ in range(n_sims):
        S = S0
        autocalled = False
        
        for step in range(1, n_steps + 1):
            dW = np.random.normal(0, 1)
            S = S * np.exp((r - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * dW)
            
            if S >= K_autocall:
                time_elapsed = step * dt
                payoff = principal * (1 + coupon * time_elapsed)
                payoffs.append(payoff)
                autocalled = True
                break
        
        if not autocalled:
            if S >= K_barrier:
                payoff = principal * (1 + coupon * T)
            else:
                payoff = principal * (S / S0)
            payoffs.append(payoff)
    
    return np.mean(payoffs) * np.exp(-r * T)

# ===== AJOUTE CES 3 ENDPOINTS =====

@router.post("/autocall", response_model=AutocallOutput)
async def price_autocall(input_data: AutocallInput):
    """
    Price Autocall / Phoenix structured product
    Uses Monte Carlo simulation
    """
    try:
        spot = input_data.spot_price
        if spot is None:
            raise HTTPException(status_code=400, detail="spot_price required")
        
        sigma = input_data.volatility
        if sigma is None:
            raise HTTPException(status_code=400, detail="volatility required")
        
        K_autocall = spot * (input_data.autocall_barrier / 100)
        K_barrier = spot * (input_data.barrier_level / 100)
        
        # Monte Carlo pricing
        fair_value = monte_carlo_autocall(
            S0=spot,
            K_autocall=K_autocall,
            K_barrier=K_barrier,
            T=input_data.maturity_years,
            r=input_data.risk_free_rate,
            sigma=sigma,
            coupon=input_data.coupon_rate / 100,
            principal=input_data.principal,
            frequency=input_data.autocall_frequency
        )
        
        coupon_value = input_data.principal * (input_data.coupon_rate / 100) * input_data.maturity_years
        
        # Greeks (approximation via embedded put)
        greeks = calculate_greeks(spot, K_barrier, input_data.maturity_years, input_data.risk_free_rate, sigma, "put")
        
        # Probability of profit
        d1 = (np.log(spot / K_barrier) + (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / (sigma * np.sqrt(input_data.maturity_years))
        prob_profit = norm.cdf(d1) * 100
        
        return AutocallOutput(
            product="Autocall/Phoenix",
            fair_value=round(fair_value, 2),
            coupon_value=round(coupon_value, 2),
            autocall_barrier_price=round(K_autocall, 2),
            protection_barrier_price=round(K_barrier, 2),
            max_gain=round(coupon_value, 2),
            max_loss=round(input_data.principal * 0.4, 2),
            risk_level=35,
            probability_profit=round(prob_profit, 2),
            delta=round(greeks["delta"], 4),
            gamma=round(greeks["gamma"], 6),
            vega=round(greeks["vega"], 2),
            theta=round(greeks["theta"], 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/capital-protected", response_model=CapitalProtectedOutput)
async def price_capital_protected(input_data: CapitalProtectedInput):
    """
    Price Capital Protected structured product
    Uses Zero-Coupon Bond + Call Options
    """
    try:
        spot = input_data.spot_price
        if spot is None:
            raise HTTPException(status_code=400, detail="spot_price required")
        
        sigma = input_data.volatility
        if sigma is None:
            raise HTTPException(status_code=400, detail="volatility required")
        
        # Zero-coupon bond to guarantee capital
        protection_amount = input_data.principal * (input_data.protection_level / 100)
        bond_cost = protection_amount * np.exp(-input_data.risk_free_rate * input_data.maturity_years)
        
        # Budget for calls
        call_budget = input_data.principal - bond_cost
        
        # Call option price (ATM)
        call_price = black_scholes_call(spot, spot, input_data.maturity_years, input_data.risk_free_rate, sigma)
        
        # Effective participation
        n_calls = call_budget / call_price
        effective_participation = n_calls * (input_data.participation_rate / 100)
        
        fair_value = protection_amount + call_budget * (input_data.participation_rate / 100)
        
        # Greeks
        greeks = calculate_greeks(spot, spot, input_data.maturity_years, input_data.risk_free_rate, sigma, "call")
        
        # Probability
        d1 = (np.log(spot / spot) + (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / (sigma * np.sqrt(input_data.maturity_years))
        prob_profit = norm.cdf(d1) * 100
        
        max_gain = input_data.principal * effective_participation * 0.5
        
        return CapitalProtectedOutput(
            product="Capital Garanti/Protégé",
            fair_value=round(fair_value, 2),
            guaranteed_capital=round(protection_amount, 2),
            call_budget=round(call_budget, 2),
            participation_rate=round(effective_participation * 100, 2),
            max_gain=round(max_gain, 2),
            max_loss=0.0,
            risk_level=15,
            probability_profit=round(prob_profit, 2),
            delta=round(greeks["delta"] * effective_participation, 4),
            gamma=round(greeks["gamma"] * effective_participation, 6),
            vega=round(greeks["vega"] * effective_participation, 2),
            theta=round(greeks["theta"] * effective_participation, 2),
            break_even_price=round(spot, 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/warrant", response_model=WarrantOutput)
async def price_warrant(input_data: WarrantInput):
    """
    Price Warrant / Turbo with leverage
    Uses Black-Scholes with leverage multiplier
    """
    try:
        spot = input_data.spot_price
        if spot is None:
            raise HTTPException(status_code=400, detail="spot_price required")
        
        sigma = input_data.volatility
        if sigma is None:
            raise HTTPException(status_code=400, detail="volatility required")
        
        # Option price
        if input_data.warrant_type.lower() == "call":
            option_price = black_scholes_call(spot, input_data.strike_price, input_data.maturity_years, input_data.risk_free_rate, sigma)
            option_type = "call"
            intrinsic = max(spot - input_data.strike_price, 0)
        else:
            K = input_data.strike_price
            T = input_data.maturity_years
            r = input_data.risk_free_rate
            d1 = (np.log(spot / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
            d2 = d1 - sigma * np.sqrt(T)
            option_price = K * np.exp(-r * T) * norm.cdf(-d2) - spot * norm.cdf(-d1)
            option_type = "put"
            intrinsic = max(input_data.strike_price - spot, 0)
        
        warrant_price = option_price * input_data.leverage
        
        # Greeks
        greeks = calculate_greeks(spot, input_data.strike_price, input_data.maturity_years, input_data.risk_free_rate, sigma, option_type)
        
        # Probability
        if input_data.warrant_type.lower() == "call":
            d1 = (np.log(spot / input_data.strike_price) + (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / (sigma * np.sqrt(input_data.maturity_years))
        else:
            d1 = (np.log(input_data.strike_price / spot) + (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / (sigma * np.sqrt(input_data.maturity_years))
        prob_profit = norm.cdf(d1) * 100
        
        max_gain = intrinsic * input_data.leverage * 100 if intrinsic > 0 else warrant_price * 3
        max_loss = warrant_price * 100
        
        break_even = input_data.strike_price + option_price if input_data.warrant_type.lower() == "call" else input_data.strike_price - option_price
        
        return WarrantOutput(
            product=f"Warrant {input_data.warrant_type.upper()}",
            fair_value=round(warrant_price * 100, 2),
            option_value=round(option_price, 2),
            leverage=input_data.leverage,
            strike_price=round(input_data.strike_price, 2),
            intrinsic_value=round(intrinsic * input_data.leverage, 2),
            time_value=round((option_price - intrinsic) * input_data.leverage, 2),
            max_gain=round(max_gain, 2),
            max_loss=round(max_loss, 2),
            risk_level=85,
            probability_profit=round(prob_profit, 2),
            delta=round(greeks["delta"] * input_data.leverage, 4),
            gamma=round(greeks["gamma"] * input_data.leverage, 6),
            vega=round(greeks["vega"] * input_data.leverage, 2),
            theta=round(greeks["theta"] * input_data.leverage, 2),
            break_even_price=round(break_even, 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# N'OUBLIE PAS d'ajouter un endpoint santé si tu ne l'as pas déjà
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "products_available": ["autocall", "reverse_convertible", "capital_protected", "warrant"]
    }