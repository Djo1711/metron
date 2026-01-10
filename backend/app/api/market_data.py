from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

router = APIRouter()

# ===== Models =====
class StockInfo(BaseModel):
    ticker: str
    name: str
    current_price: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None

class HistoricalData(BaseModel):
    dates: List[str]
    prices: List[float]
    volumes: List[int]

class VolatilityData(BaseModel):
    ticker: str
    historical_volatility: float  # Annualized
    period_days: int

# ===== Endpoints =====
@router.get("/quote/{ticker}")
async def get_stock_quote(ticker: str):
    """Get current stock quote and basic info"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Get current price
        current_price = info.get('currentPrice') or info.get('regularMarketPrice')
        if not current_price:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")
        
        # Calculate change percent
        previous_close = info.get('previousClose', current_price)
        change_percent = ((current_price - previous_close) / previous_close) * 100
        
        return StockInfo(
            ticker=ticker.upper(),
            name=info.get('longName', ticker),
            current_price=round(current_price, 2),
            change_percent=round(change_percent, 2),
            volume=info.get('volume', 0),
            market_cap=info.get('marketCap')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching {ticker}: {str(e)}")

@router.get("/history/{ticker}")
async def get_historical_data(
    ticker: str,
    period: str = "1y",  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    interval: str = "1d"  # 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
):
    """Get historical price data"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data for {ticker}")
        
        return HistoricalData(
            dates=[d.strftime('%Y-%m-%d') for d in hist.index],
            prices=[round(p, 2) for p in hist['Close'].tolist()],
            volumes=[int(v) for v in hist['Volume'].tolist()]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/volatility/{ticker}")
async def calculate_volatility(ticker: str, period_days: int = 252):
    """
    Calculate historical volatility (annualized)
    period_days: number of days to look back (default 252 = 1 year)
    """
    try:
        stock = yf.Ticker(ticker)
        
        # Get historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days + 30)  # Extra buffer
        hist = stock.history(start=start_date, end=end_date)
        
        if len(hist) < period_days:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough data. Only {len(hist)} days available"
            )
        
        # Calculate daily returns
        hist['Returns'] = hist['Close'].pct_change()
        
        # Calculate volatility (annualized)
        daily_volatility = hist['Returns'].std()
        annualized_volatility = daily_volatility * np.sqrt(252)  # 252 trading days
        
        return VolatilityData(
            ticker=ticker.upper(),
            historical_volatility=round(annualized_volatility, 4),
            period_days=len(hist)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_stocks():
    """Get list of popular stocks (hardcoded for now)"""
    popular_tickers = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
        "META", "NVDA", "JPM", "V", "JNJ"
    ]
    
    results = []
    for ticker in popular_tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            previous_close = info.get('previousClose', current_price)
            
            if current_price:
                change_percent = ((current_price - previous_close) / previous_close) * 100
                results.append({
                    "ticker": ticker,
                    "name": info.get('shortName', ticker),
                    "price": round(current_price, 2),
                    "change": round(change_percent, 2)
                })
        except:
            continue
    
    return results

@router.get("/")
async def market_data_info():
    return {
        "endpoints": [
            "/quote/{ticker}",
            "/history/{ticker}",
            "/volatility/{ticker}",
            "/trending"
        ],
        "supported_tickers": "All Yahoo Finance tickers (US, EU, etc.)"
    }
