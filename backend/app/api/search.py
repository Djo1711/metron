from fastapi import APIRouter, HTTPException
import yfinance as yf
from difflib import get_close_matches

router = APIRouter()

# Mapping des noms d'entreprises populaires vers leurs tickers
STOCK_MAPPING = {
    "apple": "AAPL",
    "microsoft": "MSFT",
    "google": "GOOGL",
    "alphabet": "GOOGL",
    "amazon": "AMZN",
    "tesla": "TSLA",
    "nvidia": "NVDA",
    "meta": "META",
    "facebook": "META",
    "netflix": "NFLX",
    "amd": "AMD",
    "intel": "INTC",
    "disney": "DIS",
    "coca cola": "KO",
    "pepsi": "PEP",
    "mcdonalds": "MCD",
    "nike": "NKE",
    "visa": "V",
    "mastercard": "MA",
    "paypal": "PYPL",
    "alibaba": "BABA",
    "walmart": "WMT",
    "target": "TGT",
    "starbucks": "SBUX",
    "uber": "UBER",
    "lyft": "LYFT",
    "airbnb": "ABNB",
    "spotify": "SPOT",
    "snapchat": "SNAP",
    "twitter": "TWTR",
    "zoom": "ZM",
    "salesforce": "CRM",
    "oracle": "ORCL",
    "ibm": "IBM",
    "cisco": "CSCO",
    "adobe": "ADBE",
    "boeing": "BA",
    "airbus": "AIR.PA",
    "volkswagen": "VOW.DE",
    "bmw": "BMW.DE",
    "mercedes": "MBG.DE",
    "toyota": "TM",
    "ford": "F",
    "general motors": "GM",
    "jpmorgan": "JPM",
    "bank of america": "BAC",
    "goldman sachs": "GS",
    "morgan stanley": "MS",
    "citigroup": "C",
    "wells fargo": "WFC",
}

@router.get("/search")
async def search_stock(query: str):
    """
    Recherche intelligente d'actions avec tolérance aux fautes
    Accepte les tickers ou les noms d'entreprise
    """
    try:
        query_lower = query.lower().strip()
        
        # 1. Recherche exacte dans le mapping
        if query_lower in STOCK_MAPPING:
            ticker = STOCK_MAPPING[query_lower]
            return {"ticker": ticker, "match_type": "exact_name"}
        
        # 2. Si c'est déjà un ticker, essaie direct
        if len(query) <= 5 and query.isupper():
            try:
                stock = yf.Ticker(query)
                info = stock.info
                if info.get('regularMarketPrice') or info.get('currentPrice'):
                    return {"ticker": query.upper(), "match_type": "exact_ticker"}
            except:
                pass
        
        # 3. Fuzzy matching avec tolérance aux fautes
        close_matches = get_close_matches(
            query_lower, 
            STOCK_MAPPING.keys(), 
            n=1, 
            cutoff=0.6  # 60% de similarité minimum
        )
        
        if close_matches:
            ticker = STOCK_MAPPING[close_matches[0]]
            return {
                "ticker": ticker, 
                "match_type": "fuzzy",
                "matched_name": close_matches[0]
            }
        
        # 4. Essaie le query tel quel en uppercase (au cas où)
        try:
            stock = yf.Ticker(query.upper())
            info = stock.info
            if info.get('regularMarketPrice') or info.get('currentPrice'):
                return {"ticker": query.upper(), "match_type": "direct"}
        except:
            pass
        
        # Aucune correspondance trouvée
        raise HTTPException(
            status_code=404, 
            detail=f"Aucune action trouvée pour '{query}'. Essayez un ticker (ex: AAPL) ou un nom d'entreprise (ex: Apple)"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))