from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Metron API"
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""  # For admin operations
    
    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = ""
    
    # API Keys (optional)
    ALPHA_VANTAGE_KEY: str = ""  # If you want to use Alpha Vantage later
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
