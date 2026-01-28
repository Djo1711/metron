from supabase import create_client, Client
from app.config import settings

class SupabaseClient:
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client singleton"""
        if cls._instance is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError(
                    "Supabase credentials not configured. "
                    "Please set SUPABASE_URL and SUPABASE_KEY in .env file"
                )
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
        return cls._instance

# Convenience function
def get_supabase() -> Client:
    """Get Supabase client instance"""
    return SupabaseClient.get_client()
