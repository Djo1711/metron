from fastapi import APIRouter, HTTPException
import yfinance as yf

router = APIRouter()

@router.get("/quote/{ticker}")
async def get_stock_quote(ticker: str):
    """Get real-time stock quote"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        current_price = info.get('currentPrice') or info.get('regularMarketPrice')
        previous_close = info.get('previousClose')
        
        if not current_price or not previous_close:
            raise HTTPException(status_code=404, detail="Stock not found")
        
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100
        
        return {
            "ticker": ticker.upper(),
            "name": info.get('longName', 'N/A'),
            "current_price": current_price,
            "previous_close": previous_close,
            "change": change,
            "change_percent": change_percent,
            "volume": info.get('volume'),
            "market_cap": info.get('marketCap'),
            "day_high": info.get('dayHigh'),
            "day_low": info.get('dayLow'),
            "open": info.get('open'),
            "fifty_two_week_high": info.get('fiftyTwoWeekHigh'),
            "fifty_two_week_low": info.get('fiftyTwoWeekLow'),
            "sector": info.get('sector'),
            "industry": info.get('industry'),
            "currency": info.get('currency', 'USD'),
            "exchange": info.get('exchange'),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{ticker}")
async def get_stock_history(ticker: str, period: str = "1mo"):
    """Get historical stock data"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        return {
            "ticker": ticker,
            "data": hist.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/volatility/{ticker}")
async def get_volatility(ticker: str, period: str = "1y"):
    """Calculate historical volatility"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        returns = hist['Close'].pct_change().dropna()
        volatility = returns.std() * (252 ** 0.5)
        
        return {
            "ticker": ticker,
            "annualized_volatility": volatility,
            "period": period
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_stocks():
    """Get trending stocks with mini historical data"""
    try:
        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC']
        stocks_data = []
        
        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                current_price = info.get('currentPrice') or info.get('regularMarketPrice')
                previous_close = info.get('previousClose')
                
                if current_price and previous_close:
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100
                    
                    # Get 1 year historical data (more points for better granularity)
                    hist = stock.history(period="1y")
                    # Get last 60 points (approx 1 year with daily data)
                    sparkline_data = [{"price": float(price)} for price in hist['Close'].tail(60)]
                    
                    stocks_data.append({
                        "ticker": ticker,
                        "name": info.get('shortName', ticker),
                        "price": current_price,
                        "change": change_percent,
                        "sparkline": sparkline_data
                    })
            except:
                continue
        
        return stocks_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))