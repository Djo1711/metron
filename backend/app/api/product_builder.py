"""
Product Builder API Router
Propose des produits structurés basés sur les objectifs de l'investisseur
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from scipy.stats import norm

router = APIRouter()

# ==================== MODELS ====================

class InvestorObjectives(BaseModel):
    """Objectifs de l'investisseur"""
    ticker: str
    principal: float
    min_gain_pct: float  # Gain minimum souhaité en %
    max_loss_pct: float  # Perte maximum acceptable en %
    risk_tolerance: int  # 0-100 (0=très conservateur, 100=très agressif)
    time_horizon_years: float  # Horizon d'investissement
    spot_price: float
    volatility: float
    risk_free_rate: float = 0.04
    prefer_income: bool = False  # Préférence pour revenus réguliers (coupons)

class ProductProposal(BaseModel):
    """Proposition de produit structuré"""
    product_type: str
    product_name: str
    description: str
    match_score: int  # 0-100, score de correspondance aux objectifs
    parameters: dict
    expected_results: dict
    pros: List[str]
    cons: List[str]
    icon: str

class ProductBuilderResponse(BaseModel):
    """Réponse du Product Builder"""
    objectives_summary: dict
    proposed_products: List[ProductProposal]
    recommendation: str

# ==================== HELPER FUNCTIONS ====================

def black_scholes_call(S, K, T, r, sigma):
    """Black-Scholes Call"""
    if T <= 0:
        return max(S - K, 0)
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

def black_scholes_put(S, K, T, r, sigma):
    """Black-Scholes Put"""
    if T <= 0:
        return max(K - S, 0)
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

# ==================== PRODUCT BUILDERS ====================

def build_capital_protected(objectives: InvestorObjectives):
    """Construire un Capital Protégé optimal"""
    S = objectives.spot_price
    T = objectives.time_horizon_years
    r = objectives.risk_free_rate
    sigma = objectives.volatility
    principal = objectives.principal
    
    # Protection level basé sur la tolérance au risque
    protection_level = 100 - (objectives.risk_tolerance / 100) * 10
    
    # Calculer le budget disponible pour les calls
    protected_amount = principal * (protection_level / 100)
    bond_cost = protected_amount * np.exp(-r * T)
    call_budget = principal - bond_cost
    
    # Prix d'un call ATM
    call_price = black_scholes_call(S, S, T, r, sigma)
    
    # Nombre de calls qu'on peut acheter
    n_calls = call_budget / call_price if call_price > 0 else 0
    
    # Taux de participation effectif
    participation_rate = (n_calls / (principal / S)) * 100
    
    # Résultats attendus
    expected_upside = objectives.min_gain_pct / 100
    max_gain = principal * participation_rate / 100 * expected_upside
    max_loss = principal * (1 - protection_level / 100)
    
    # Probabilité de profit
    d1 = (0 + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    prob_profit = 50 + norm.cdf(d1) * 50
    
    # Score de match
    gain_match = min(100, (max_gain / (principal * objectives.min_gain_pct / 100)) * 100) if objectives.min_gain_pct > 0 else 50
    loss_match = 100 if max_loss <= (principal * objectives.max_loss_pct / 100) else 50
    risk_match = 100 - abs(10 - objectives.risk_tolerance)
    match_score = int((gain_match + loss_match + risk_match) / 3)
    
    return ProductProposal(
        product_type="capital_protected",
        product_name="Capital Garanti Optimisé",
        description=f"Protection à {protection_level:.0f}% avec participation de {participation_rate:.1f}%",
        match_score=match_score,
        parameters={
            "principal": principal,
            "protection_level": round(protection_level, 2),
            "participation_rate": round(participation_rate, 2),
            "maturity_years": T,
            "spot_price": S,
            "volatility": sigma,
            "risk_free_rate": r,
            "ticker": objectives.ticker
        },
        expected_results={
            "fair_value": round(principal, 2),
            "max_gain": round(max_gain, 2),
            "max_loss": round(max_loss, 2),
            "risk_level": int(10 + objectives.risk_tolerance / 10),
            "probability_profit": round(prob_profit, 2)
        },
        pros=[
            f"Capital protégé à {protection_level:.0f}%",
            "Risque très faible",
            f"Participation à la hausse de {participation_rate:.1f}%"
        ],
        cons=[
            "Gain plafonné" if participation_rate < 100 else "Participation partielle",
            "Pas de revenus réguliers",
            "Performance liée à une seule action"
        ],
        icon="🛡️"
    )

def build_autocall(objectives: InvestorObjectives):
    """Construire un Autocall optimal"""
    S = objectives.spot_price
    T = objectives.time_horizon_years
    sigma = objectives.volatility
    principal = objectives.principal
    
    # Barrière autocall basée sur le gain souhaité
    autocall_barrier = 95 + min(5, objectives.min_gain_pct / 3)
    
    # Barrière de protection basée sur la perte max acceptable
    barrier_level = max(50, 100 - objectives.max_loss_pct)
    
    # Coupon basé sur le risque et la volatilité
    base_coupon = 6 + (objectives.risk_tolerance / 100) * 8
    volatility_premium = sigma * 10
    coupon_rate = base_coupon + volatility_premium
    
    # Résultats attendus
    total_coupon = principal * (coupon_rate / 100) * T
    max_gain = total_coupon
    max_loss = principal * (objectives.max_loss_pct / 100)
    
    # Probabilité de profit
    K_barrier = S * (barrier_level / 100)
    d1 = (np.log(S / K_barrier) + (objectives.risk_free_rate + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    prob_profit = norm.cdf(d1) * 100
    
    # Score de match
    gain_match = min(100, (max_gain / (principal * objectives.min_gain_pct / 100)) * 100) if objectives.min_gain_pct > 0 else 50
    loss_match = 100 if max_loss <= (principal * objectives.max_loss_pct / 100) else 70
    income_bonus = 20 if objectives.prefer_income else 0
    match_score = int((gain_match + loss_match + income_bonus) / 2.2)
    
    return ProductProposal(
        product_type="autocall",
        product_name="Autocall sur-mesure",
        description=f"Coupon {coupon_rate:.1f}% avec barrière à {barrier_level}%",
        match_score=match_score,
        parameters={
            "principal": principal,
            "autocall_barrier": round(autocall_barrier, 2),
            "coupon_rate": round(coupon_rate, 2),
            "barrier_level": round(barrier_level, 2),
            "maturity_years": T,
            "autocall_frequency": 0.25,
            "spot_price": S,
            "volatility": sigma,
            "risk_free_rate": objectives.risk_free_rate,
            "ticker": objectives.ticker
        },
        expected_results={
            "fair_value": round(principal - max_loss * 0.2, 2),
            "max_gain": round(max_gain, 2),
            "max_loss": round(max_loss, 2),
            "risk_level": int(30 + objectives.risk_tolerance / 2),
            "probability_profit": round(prob_profit, 2)
        },
        pros=[
            f"Coupon attractif de {coupon_rate:.1f}%",
            "Remboursement anticipé possible",
            f"Protection jusqu'à -{100 - barrier_level:.0f}%"
        ],
        cons=[
            "Risque de perte si barrière cassée",
            "Gain plafonné au coupon",
            "Complexe à comprendre"
        ],
        icon="📈"
    )

def build_reverse_convertible(objectives: InvestorObjectives):
    """Construire un Reverse Convertible optimal"""
    S = objectives.spot_price
    T = objectives.time_horizon_years
    sigma = objectives.volatility
    principal = objectives.principal
    
    # Barrière basée sur la perte max acceptable
    barrier_level = max(50, 100 - objectives.max_loss_pct)
    
    # Coupon élevé car produit risqué
    base_coupon = 8 + (objectives.risk_tolerance / 100) * 10
    volatility_premium = sigma * 12
    coupon_rate = base_coupon + volatility_premium
    
    # Résultats
    total_coupon = principal * (coupon_rate / 100) * T
    max_gain = total_coupon
    max_loss = principal - total_coupon
    
    # Probabilité
    K_barrier = S * (barrier_level / 100)
    d1 = (np.log(S / K_barrier) + (objectives.risk_free_rate + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    prob_profit = norm.cdf(d1) * 100
    
    # Score de match
    gain_match = min(100, (max_gain / (principal * objectives.min_gain_pct / 100)) * 100) if objectives.min_gain_pct > 0 else 50
    loss_match = 100 if max_loss <= (principal * objectives.max_loss_pct / 100) else 60
    income_bonus = 30 if objectives.prefer_income else 0
    risk_match = 100 - abs(objectives.risk_tolerance - 60)
    match_score = int((gain_match + loss_match + income_bonus + risk_match) / 3.3)
    
    return ProductProposal(
        product_type="reverse_convertible",
        product_name="Reverse Convertible Optimisé",
        description=f"Coupon {coupon_rate:.1f}% avec barrière {barrier_level}%",
        match_score=match_score,
        parameters={
            "principal": principal,
            "coupon_rate": round(coupon_rate, 2),
            "barrier_level": round(barrier_level, 2),
            "maturity_years": T,
            "spot_price": S,
            "volatility": sigma,
            "risk_free_rate": objectives.risk_free_rate,
            "ticker": objectives.ticker
        },
        expected_results={
            "fair_value": round(principal - max_loss * 0.15, 2),
            "max_gain": round(max_gain, 2),
            "max_loss": round(max_loss, 2),
            "risk_level": int(40 + objectives.risk_tolerance / 2),
            "probability_profit": round(prob_profit, 2)
        },
        pros=[
            f"Coupon très attractif : {coupon_rate:.1f}%",
            "Revenus prévisibles",
            "Simple à comprendre"
        ],
        cons=[
            "Risque de conversion en actions",
            "Perte potentielle importante",
            "Pas de participation à la hausse"
        ],
        icon="🔄"
    )

def build_warrant(objectives: InvestorObjectives):
    """Construire un Warrant optimal"""
    S = objectives.spot_price
    T = objectives.time_horizon_years
    sigma = objectives.volatility
    principal = objectives.principal
    
    warrant_type = "call"
    
    # Strike légèrement OTM pour plus de levier
    strike_otm_pct = 5 + (100 - objectives.risk_tolerance) / 10
    strike_price = S * (1 + strike_otm_pct / 100)
    
    # Levier basé sur la tolérance au risque
    leverage = 3 + (objectives.risk_tolerance / 100) * 7
    
    # Prix de l'option
    call_price = black_scholes_call(S, strike_price, T, objectives.risk_free_rate, sigma)
    warrant_price = call_price * leverage
    
    # Résultats
    max_gain = (S * 0.5) * leverage
    max_loss = warrant_price * 100
    
    # Probabilité ITM
    d2 = (np.log(S / strike_price) + (objectives.risk_free_rate - 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    prob_profit = norm.cdf(d2) * 100
    
    # Score de match
    gain_match = min(100, (max_gain / (principal * objectives.min_gain_pct / 100)) * 150) if objectives.min_gain_pct > 0 else 50
    loss_match = 50 if objectives.risk_tolerance > 70 else 20
    risk_match = 100 - abs(objectives.risk_tolerance - 90)
    match_score = int((gain_match + loss_match + risk_match) / 3)
    
    return ProductProposal(
        product_type="warrant",
        product_name=f"Warrant {warrant_type.upper()} avec levier {leverage:.0f}x",
        description=f"Strike {strike_price:.2f}$ (OTM {strike_otm_pct:.1f}%)",
        match_score=match_score,
        parameters={
            "strike_price": round(strike_price, 2),
            "warrant_type": warrant_type,
            "leverage": round(leverage, 2),
            "maturity_years": T,
            "spot_price": S,
            "volatility": sigma,
            "risk_free_rate": objectives.risk_free_rate,
            "ticker": objectives.ticker
        },
        expected_results={
            "fair_value": round(warrant_price * 100, 2),
            "max_gain": round(max_gain, 2),
            "max_loss": round(max_loss, 2),
            "risk_level": int(80 + leverage),
            "probability_profit": round(prob_profit, 2)
        },
        pros=[
            f"Effet de levier {leverage:.0f}x",
            "Potentiel de gain très élevé",
            "Investissement initial faible"
        ],
        cons=[
            "Risque de perte totale",
            "Très volatile",
            "Nécessite timing précis"
        ],
        icon="🚀"
    )

# ==================== MAIN ENDPOINT ====================

@router.post("/build", response_model=ProductBuilderResponse)
async def build_products(objectives: InvestorObjectives):
    """
    Construit des produits structurés sur-mesure basés sur les objectifs
    """
    try:
        products = []
        
        # Capital Protégé (toujours proposé)
        products.append(build_capital_protected(objectives))
        
        # Autocall si tolérance au risque modérée à élevée
        if objectives.risk_tolerance >= 30:
            products.append(build_autocall(objectives))
        
        # Reverse Convertible si tolérance au risque modérée et intérêt pour revenus
        if objectives.risk_tolerance >= 40 or objectives.prefer_income:
            products.append(build_reverse_convertible(objectives))
        
        # Warrant si tolérance au risque élevée
        if objectives.risk_tolerance >= 70:
            products.append(build_warrant(objectives))
        
        # Trier par match_score
        products.sort(key=lambda x: x.match_score, reverse=True)
        
        # Générer une recommandation
        best_product = products[0]
        recommendation = f"Nous recommandons le **{best_product.product_name}** (score: {best_product.match_score}/100) qui correspond le mieux à vos objectifs. "
        
        if objectives.risk_tolerance < 30:
            recommendation += "Votre profil conservateur privilégie la protection du capital."
        elif objectives.risk_tolerance < 60:
            recommendation += "Votre profil équilibré recherche un bon compromis risque/rendement."
        else:
            recommendation += "Votre profil dynamique recherche des gains potentiels élevés."
        
        return ProductBuilderResponse(
            objectives_summary={
                "capital": objectives.principal,
                "gain_minimum": f"+{objectives.min_gain_pct}%",
                "perte_maximum": f"-{objectives.max_loss_pct}%",
                "tolerance_risque": f"{objectives.risk_tolerance}/100",
                "horizon": f"{objectives.time_horizon_years} an(s)",
                "preference_revenus": objectives.prefer_income
            },
            proposed_products=products,
            recommendation=recommendation
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Product Builder"
    }