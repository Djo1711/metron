"""
Configuration management
Fusionné avec pydantic-settings pour validation automatique
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application configuration avec validation Pydantic"""
    
    # ==================== APP SETTINGS ====================
    APP_NAME: str = "Metron API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "API de pricing pour produits structurés"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # ==================== CORS ====================
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # ==================== SUPABASE ====================
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""  # For admin operations
    
    # ==================== DATABASE ====================
    DATABASE_URL: str = ""  # Supabase PostgreSQL connection string
    
    # ==================== MONTE CARLO SETTINGS ====================
    MC_DEFAULT_SIMULATIONS: int = 10000
    MC_SEED: int = 42  # For reproducibility in tests
    
    # ==================== MARKET DATA (YFINANCE) ====================
    YFINANCE_PERIOD: str = "1y"  # Default period for historical data
    YFINANCE_INTERVAL: str = "1d"  # Daily data
    
    # ==================== API KEYS (Optional) ====================
    ALPHA_VANTAGE_KEY: str = ""  # Alternative market data source
    
    # ==================== SERVER SETTINGS ====================
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env
    
    # ==================== VALIDATION METHODS ====================
    
    def validate_supabase(self) -> bool:
        """Check if Supabase is properly configured"""
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY)
    
    def validate_required(self) -> None:
        """Validate required environment variables"""
        if not self.validate_supabase():
            raise ValueError(
                "Supabase credentials missing! "
                "Please set SUPABASE_URL and SUPABASE_KEY in .env"
            )
    
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT.lower() == "development"
    
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT.lower() == "production"
    
    # ==================== UTILITY METHODS ====================
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins (alias for compatibility)"""
        return self.ALLOWED_ORIGINS
    
    def get_monte_carlo_params(self) -> dict:
        """Get Monte Carlo configuration"""
        return {
            "n_simulations": self.MC_DEFAULT_SIMULATIONS,
            "seed": self.MC_SEED
        }
    
    def get_yfinance_params(self) -> dict:
        """Get yfinance configuration"""
        return {
            "period": self.YFINANCE_PERIOD,
            "interval": self.YFINANCE_INTERVAL
        }

# ==================== SINGLETON INSTANCE ====================

# Create singleton instance
settings = Settings()

# Print configuration on startup (only in debug mode)
if settings.DEBUG:
    print(f"\n{'='*50}")
    print(f"🚀 {settings.APP_NAME} v{settings.API_VERSION}")
    print(f"{'='*50}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug: {settings.DEBUG}")
    print(f"Supabase configured: {settings.validate_supabase()}")
    print(f"CORS origins: {len(settings.ALLOWED_ORIGINS)}")
    print(f"Monte Carlo sims: {settings.MC_DEFAULT_SIMULATIONS}")
    print(f"{'='*50}\n")

# Optional: Validate on import (comment out if you want to delay validation)
# if settings.validate_supabase():
#     settings.validate_required()