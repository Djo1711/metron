from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import pricing, market_data, simulations, search, users  # 🆕 Ajoute users

app = FastAPI(
    title="Metron API",
    description="API for structured products pricing and simulation",
    version="0.1.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pricing.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(market_data.router, prefix="/api/market", tags=["market"])
app.include_router(simulations.router, prefix="/api/simulations", tags=["simulations"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(users.router, prefix="/api/users", tags=["users"])  # 🆕 Ajoute cette ligne


@app.get("/")
async def root():
    return {
        "message": "Metron API - Produits Structurés",
        "version": "1.0.0",
        "endpoints": {
            "autocall": "/api/pricing/autocall",
            "reverse_convertible": "/api/pricing/reverse-convertible",
            "capital_protected": "/api/pricing/capital-protected",
            "warrant": "/api/pricing/warrant",
            "health": "/api/pricing/health"
    }
}
    
    
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)