import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_pricing_info():
    """Test pricing info endpoint"""
    response = client.get("/api/pricing/")
    assert response.status_code == 200
    assert "available_products" in response.json()

def test_market_data_info():
    """Test market data info endpoint"""
    response = client.get("/api/market/")
    assert response.status_code == 200
    assert "endpoints" in response.json()

# Example test for reverse convertible pricing
def test_reverse_convertible_pricing():
    """Test reverse convertible pricing endpoint"""
    payload = {
        "ticker": "AAPL",
        "principal": 10000,
        "coupon_rate": 8.0,
        "barrier_level": 60,
        "maturity_years": 1,
        "spot_price": 150,
        "volatility": 0.25,
        "risk_free_rate": 0.04
    }
    
    response = client.post("/api/pricing/reverse-convertible", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "fair_value" in data
    assert "coupon_value" in data
    assert "embedded_put_value" in data
    assert data["fair_value"] > 0

# Run tests with: pytest
