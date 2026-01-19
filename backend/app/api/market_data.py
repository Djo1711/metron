from fastapi import APIRouter, HTTPException
import yfinance as yf
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

router = APIRouter()

# Mapping des indices populaires
INDICES_MAPPING = {
    # France
    'cac40': '^FCHI', 'cac 40': '^FCHI', 'cac': '^FCHI',
    # Europe
    'stoxx50': '^STOXX50E', 'stoxx 50': '^STOXX50E', 'eurostoxx50': '^STOXX50E',
    'euro stoxx 50': '^STOXX50E', 'dax': '^GDAXI', 'ftse': '^FTSE', 'ftse100': '^FTSE',
    'ftse 100': '^FTSE', 'ibex35': '^IBEX', 'ibex': '^IBEX',
    # US
    'sp500': '^GSPC', 's&p500': '^GSPC', 's&p 500': '^GSPC', 'snp500': '^GSPC',
    'dow': '^DJI', 'dowjones': '^DJI', 'dow jones': '^DJI', 'nasdaq': '^IXIC',
    'nasdaq100': '^NDX', 'nasdaq 100': '^NDX', 'russell2000': '^RUT', 'russell 2000': '^RUT',
    # Asie
    'nikkei': '^N225', 'nikkei225': '^N225', 'hang seng': '^HSI', 'hangseng': '^HSI',
    'shanghai': '000001.SS',
}

@router.get("/quote/{ticker}")
async def get_stock_quote(ticker: str):
    """Get real-time stock quote"""
    try:
        ticker_lower = ticker.lower().strip()
        if ticker_lower in INDICES_MAPPING:
            ticker = INDICES_MAPPING[ticker_lower]
        
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
        ticker_lower = ticker.lower().strip()
        if ticker_lower in INDICES_MAPPING:
            ticker = INDICES_MAPPING[ticker_lower]
            
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        hist_reset = hist.reset_index()
        
        data = []
        for _, row in hist_reset.iterrows():
            data.append({
                "Date": row['Date'].strftime('%Y-%m-%d'),
                "Open": float(row['Open']),
                "High": float(row['High']),
                "Low": float(row['Low']),
                "Close": float(row['Close']),
                "Volume": int(row['Volume'])
            })

        return {
            "ticker": ticker,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/volatility/{ticker}")
async def get_volatility(ticker: str, period: str = "1y"):
    """Calculate historical volatility"""
    try:
        ticker_lower = ticker.lower().strip()
        if ticker_lower in INDICES_MAPPING:
            ticker = INDICES_MAPPING[ticker_lower]
            
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
    """Get trending stocks with mini historical data - Mix US + European"""
    try:
        tickers = [
            'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA',
            'MC.PA', 'OR.PA', 'SAN.PA', 'AI.PA', 'BNP.PA'
        ]
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
                    
                    hist = stock.history(period="1y")
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

def fetch_url(url, headers, timeout=1.5):
    """Helper pour fetch avec timeout"""
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        return response.json()
    except:
        return None

@router.get("/search/{query}")
async def search_stocks(query: str):
    """Search stocks - OPTIMIZED with parallel requests"""
    try:
        query_lower = query.lower().strip()
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        # 1. Check indices (instant)
        if query_lower in INDICES_MAPPING:
            ticker = INDICES_MAPPING[query_lower]
            stock = yf.Ticker(ticker)
            info = stock.info
            return [{
                "ticker": ticker,
                "name": info.get('longName') or info.get('shortName') or ticker,
                "exchange": "Index"
            }]
        
        # 2. Partial index match (instant)
        index_results = []
        for key, value in INDICES_MAPPING.items():
            if query_lower in key and len(index_results) < 3:
                try:
                    stock = yf.Ticker(value)
                    info = stock.info
                    index_results.append({
                        "ticker": value,
                        "name": info.get('longName') or info.get('shortName') or value,
                        "exchange": "Index"
                    })
                except:
                    continue
        
        # 3. Parallel requests with ThreadPoolExecutor
        urls = [
            f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=12&newsCount=0",
        ]
        
        # Ajouter bourses européennes seulement si nécessaire
        if len(query) >= 2:
            urls.append(f"https://query2.finance.yahoo.com/v1/finance/search?q={query}.PA&quotesCount=4&newsCount=0")
        
        # Fetch en parallèle
        responses = []
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(fetch_url, url, headers) for url in urls]
            for future in as_completed(futures):
                result = future.result()
                if result:
                    responses.append(result)
        
        # 4. Process results
        results = index_results
        seen_tickers = set([r['ticker'] for r in index_results])
        
        for data in responses:
            for quote in data.get('quotes', []):
                if quote.get('quoteType') in ['EQUITY', 'ETF', 'INDEX']:
                    ticker = quote.get('symbol')
                    name = quote.get('longname') or quote.get('shortname')
                    
                    if ticker and name and ticker not in seen_tickers:
                        results.append({
                            "ticker": ticker,
                            "name": name,
                            "exchange": quote.get('exchDisp') or quote.get('exchange', 'N/A')
                        })
                        seen_tickers.add(ticker)
                        
                        if len(results) >= 10:
                            break
            
            if len(results) >= 10:
                break
        
        return results[:10]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))