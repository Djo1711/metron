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
    coupon_rate: float
    barrier_level: float
    maturity_years: float
    spot_price: Optional[float] = None
    volatility: Optional[float] = None
    risk_free_rate: float = 0.04

class ReverseConvertibleOutput(BaseModel):
    product: str
    fair_value: float
    coupon_value: float
    embedded_put_value: float
    break_even_price: float
    max_gain: float
    max_loss: float
    risk_level: int
    probability_profit: float
    delta: float
    gamma: float
    vega: float
    theta: float

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
    principal: Optional[float] = None  # 🆕 AJOUT
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

# ===== Helper Functions =====

def black_scholes_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes call option pricing"""
    if T <= 0:
        return max(S - K, 0)
    
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

def black_scholes_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-Scholes put option pricing"""
    if T <= 0:
        return max(K - S, 0)
    
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

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
            
            # Check autocall condition
            if S >= K_autocall:
                time_elapsed = step * dt
                payoff = principal * (1 + coupon * time_elapsed)
                payoffs.append(payoff)
                autocalled = True
                break
        
        # If not autocalled, check final payoff
        if not autocalled:
            if S >= K_barrier:
                payoff = principal * (1 + coupon * T)
            else:
                payoff = principal * (S / S0)
            payoffs.append(payoff)
    
    return np.mean(payoffs) * np.exp(-r * T)

# ===== REVERSE CONVERTIBLE =====
@router.post("/reverse-convertible", response_model=ReverseConvertibleOutput)
async def price_reverse_convertible(input_data: ReverseConvertibleInput):
    """Price a Reverse Convertible structured product"""
    try:
        spot = input_data.spot_price
        if spot is None:
            raise HTTPException(status_code=400, detail="spot_price required")
        
        sigma = input_data.volatility
        if sigma is None:
            raise HTTPException(status_code=400, detail="volatility required")
        
        barrier_strike = spot * (input_data.barrier_level / 100)
        
        coupon_payment = input_data.principal * (input_data.coupon_rate / 100)
        n_payments = max(1, int(input_data.maturity_years))
        
        pv_coupons = sum([
            coupon_payment * np.exp(-input_data.risk_free_rate * t)
            for t in range(1, n_payments + 1)
        ])
        
        put_value = black_scholes_put(
            S=spot,
            K=barrier_strike,
            T=input_data.maturity_years,
            r=input_data.risk_free_rate,
            sigma=sigma
        )
        
        n_shares = input_data.principal / spot
        embedded_put_value = n_shares * put_value
        
        fair_value = input_data.principal + pv_coupons - embedded_put_value
        
        greeks = calculate_greeks(spot, barrier_strike, input_data.maturity_years, 
                                 input_data.risk_free_rate, sigma, "put")
        
        total_coupons = coupon_payment * input_data.maturity_years
        max_gain = total_coupons
        max_loss = input_data.principal - total_coupons
        
        distance_to_barrier = (spot - barrier_strike) / spot
        risk_level = min(100, max(0, int((1 - distance_to_barrier) * 50 + sigma * 100)))
        
        d1 = (np.log(spot / barrier_strike) + 
              (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / \
             (sigma * np.sqrt(input_data.maturity_years))
        probability_profit = norm.cdf(d1) * 100
        
        break_even = spot * (1 - (total_coupons / input_data.principal))
        
        return ReverseConvertibleOutput(
            product="Reverse Convertible",
            fair_value=round(fair_value, 2),
            coupon_value=round(pv_coupons, 2),
            embedded_put_value=round(embedded_put_value, 2),
            break_even_price=round(break_even, 2),
            max_gain=round(max_gain, 2),
            max_loss=round(max_loss, 2),
            risk_level=risk_level,
            probability_profit=round(probability_profit, 2),
            delta=round(greeks["delta"] * n_shares, 4),
            gamma=round(greeks["gamma"] * n_shares, 6),
            vega=round(greeks["vega"] * n_shares, 2),
            theta=round(greeks["theta"] * n_shares, 2)
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ===== AUTOCALL =====
@router.post("/autocall", response_model=AutocallOutput)
async def price_autocall(input_data: AutocallInput):
    """Price Autocall / Phoenix structured product"""
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
        greeks = calculate_greeks(spot, K_barrier, input_data.maturity_years, 
                                 input_data.risk_free_rate, sigma, "put")
        
        # Max gain: coupon full term
        max_gain = coupon_value
        
        # Max loss: lose below barrier
        max_loss = input_data.principal * (1 - input_data.barrier_level / 100)
        
        # Risk level
        distance_to_barrier = (spot - K_barrier) / spot
        risk_level = min(100, max(0, int((1 - distance_to_barrier) * 40 + sigma * 80)))
        
        # Probability of profit (stay above barrier)
        d1 = (np.log(spot / K_barrier) + 
              (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / \
             (sigma * np.sqrt(input_data.maturity_years))
        probability_profit = norm.cdf(d1) * 100
        
        return AutocallOutput(
            product="Autocall/Phoenix",
            fair_value=round(fair_value, 2),
            coupon_value=round(coupon_value, 2),
            autocall_barrier_price=round(K_autocall, 2),
            protection_barrier_price=round(K_barrier, 2),
            max_gain=round(max_gain, 2),
            max_loss=round(max_loss, 2),
            risk_level=risk_level,
            probability_profit=round(probability_profit, 2),
            delta=round(greeks["delta"], 4),
            gamma=round(greeks["gamma"], 6),
            vega=round(greeks["vega"], 2),
            theta=round(greeks["theta"], 2)
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ===== CAPITAL PROTECTED =====
@router.post("/capital-protected", response_model=CapitalProtectedOutput)
async def price_capital_protected(input_data: CapitalProtectedInput):
    """Price Capital Protected structured product"""
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
        call_price = black_scholes_call(spot, spot, input_data.maturity_years, 
                                       input_data.risk_free_rate, sigma)
        
        # Number of call options we can buy
        n_calls = call_budget / call_price if call_price > 0 else 0
        
        # Effective participation (adjusted)
        effective_participation = n_calls * (input_data.participation_rate / 100) / (input_data.principal / spot)
        
        # Fair value
        fair_value = protection_amount + call_budget
        
        # Greeks
        greeks = calculate_greeks(spot, spot, input_data.maturity_years, 
                                 input_data.risk_free_rate, sigma, "call")
        
        # Max gain: si le sous-jacent double
        max_gain = input_data.principal * effective_participation * 1.0  # Assume 100% upside
        
        # Max loss: 0 si 100% protected
        max_loss = input_data.principal * (1 - input_data.protection_level / 100)
        
        # Risk level: très bas car capital protégé
        risk_level = int(max_loss / input_data.principal * 100) if input_data.principal > 0 else 0
        
        # Probability: toujours élevée car capital garanti
        d1 = (np.log(spot / spot) + 
              (input_data.risk_free_rate + 0.5 * sigma**2) * input_data.maturity_years) / \
             (sigma * np.sqrt(input_data.maturity_years))
        probability_profit = 50 + norm.cdf(d1) * 50  # Au moins 50% car capital garanti
        
        return CapitalProtectedOutput(
            product="Capital Garanti",
            fair_value=round(fair_value, 2),
            guaranteed_capital=round(protection_amount, 2),
            call_budget=round(call_budget, 2),
            participation_rate=round(effective_participation * 100, 2),
            max_gain=round(max_gain, 2),
            max_loss=round(max_loss, 2),
            risk_level=risk_level,
            probability_profit=round(probability_profit, 2),
            delta=round(greeks["delta"] * n_calls, 4),
            gamma=round(greeks["gamma"] * n_calls, 6),
            vega=round(greeks["vega"] * n_calls, 2),
            theta=round(greeks["theta"] * n_calls, 2),
            break_even_price=round(spot, 2)
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ===== WARRANT ===== 🆕 CORRECTION COMPLÈTE
@router.post("/warrant", response_model=WarrantOutput)
async def price_warrant(input_data: WarrantInput):
    """Price Warrant / Turbo with leverage"""
    try:
        spot = input_data.spot_price
        if spot is None:
            raise HTTPException(status_code=400, detail="spot_price required")
        
        sigma = input_data.volatility
        if sigma is None:
            raise HTTPException(status_code=400, detail="volatility required")
        
        # Option price (pour 1 warrant)
        if input_data.warrant_type.lower() == "call":
            option_price = black_scholes_call(spot, input_data.strike_price, 
                                             input_data.maturity_years, 
                                             input_data.risk_free_rate, sigma)
            option_type = "call"
            intrinsic = max(spot - input_data.strike_price, 0)
        else:
            option_price = black_scholes_put(spot, input_data.strike_price, 
                                            input_data.maturity_years, 
                                            input_data.risk_free_rate, sigma)
            option_type = "put"
            intrinsic = max(input_data.strike_price - spot, 0)
        
        # Prix unitaire du warrant (avec levier)
        warrant_unit_price = option_price * input_data.leverage
        
        # 🆕 Si un principal est fourni, calculer combien de warrants on peut acheter
        if input_data.principal and input_data.principal > 0:
            n_warrants = input_data.principal / warrant_unit_price if warrant_unit_price > 0 else 0
            total_investment = input_data.principal
        else:
            # Sinon, on price 100 warrants par défaut
            n_warrants = 100
            total_investment = warrant_unit_price * 100
        
        # Greeks
        greeks = calculate_greeks(spot, input_data.strike_price, input_data.maturity_years, 
                                 input_data.risk_free_rate, sigma, option_type)
        
        # Time value
        time_value = option_price - intrinsic
        
        # 🆕 Max gain basé sur le nombre de warrants
        if input_data.warrant_type.lower() == "call":
            # Gain si l'action monte de 50%
            upside_price = spot * 1.5
            gain_per_warrant = max(upside_price - input_data.strike_price, 0) * input_data.leverage
            max_gain = gain_per_warrant * n_warrants
        else:
            # Put: max gain si l'action tombe à 0
            gain_per_warrant = input_data.strike_price * input_data.leverage
            max_gain = gain_per_warrant * n_warrants
        
        # 🆕 Max loss = montant total investi (tous les warrants expirent sans valeur)
        max_loss = total_investment
        
        # Risk level: très élevé (leverage)
        risk_level = min(100, int(50 + input_data.leverage * 8))
        
        # Probability ITM
        if input_data.warrant_type.lower() == "call":
            d2 = (np.log(spot / input_data.strike_price) + 
                  (input_data.risk_free_rate - 0.5 * sigma**2) * input_data.maturity_years) / \
                 (sigma * np.sqrt(input_data.maturity_years))
        else:
            d2 = (np.log(input_data.strike_price / spot) + 
                  (input_data.risk_free_rate - 0.5 * sigma**2) * input_data.maturity_years) / \
                 (sigma * np.sqrt(input_data.maturity_years))
        
        probability_profit = norm.cdf(d2) * 100
        
        # Break-even
        if input_data.warrant_type.lower() == "call":
            break_even = input_data.strike_price + option_price
        else:
            break_even = input_data.strike_price - option_price
        
        return WarrantOutput(
            product=f"Warrant {input_data.warrant_type.upper()}",
            fair_value=round(total_investment, 2),  # 🆕 Montant total investi
            option_value=round(option_price, 2),
            leverage=input_data.leverage,
            strike_price=round(input_data.strike_price, 2),
            intrinsic_value=round(intrinsic * input_data.leverage * n_warrants, 2),  # 🆕
            time_value=round(time_value * input_data.leverage * n_warrants, 2),  # 🆕
            max_gain=round(max_gain, 2),  # 🆕 Basé sur n_warrants
            max_loss=round(max_loss, 2),  # 🆕 = montant investi
            risk_level=risk_level,
            probability_profit=round(probability_profit, 2),
            delta=round(greeks["delta"] * input_data.leverage * n_warrants, 4),  # 🆕
            gamma=round(greeks["gamma"] * input_data.leverage * n_warrants, 6),  # 🆕
            vega=round(greeks["vega"] * input_data.leverage * n_warrants, 2),  # 🆕
            theta=round(greeks["theta"] * input_data.leverage * n_warrants, 2),  # 🆕
            break_even_price=round(break_even, 2)
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ===== INFO ENDPOINTS =====
@router.get("/")
async def pricing_info():
    return {
        "available_products": ["reverse-convertible", "autocall", "capital-protected", "warrant"],
        "status": "operational"
    }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "products_available": ["autocall", "reverse_convertible", "capital_protected", "warrant"]
    }