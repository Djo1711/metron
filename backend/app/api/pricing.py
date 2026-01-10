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
