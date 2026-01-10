from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_supabase

router = APIRouter()

# ===== Models =====
class SimulationCreate(BaseModel):
    user_id: str
    product_type: str  # "reverse_convertible", "autocall", etc.
    ticker: str
    parameters: dict  # JSON with all input parameters
    results: dict  # JSON with pricing results

class SimulationResponse(BaseModel):
    id: int
    user_id: str
    product_type: str
    ticker: str
    parameters: dict
    results: dict
    created_at: str

# ===== Endpoints =====
@router.post("/save")
async def save_simulation(simulation: SimulationCreate):
    """Save a simulation to database"""
    try:
        supabase = get_supabase()
        
        data = {
            "user_id": simulation.user_id,
            "product_type": simulation.product_type,
            "ticker": simulation.ticker,
            "parameters": simulation.parameters,
            "results": simulation.results,
            "created_at": datetime.now().isoformat()
        }
        
        response = supabase.table("simulations").insert(data).execute()
        
        return {
            "message": "Simulation saved successfully",
            "id": response.data[0]["id"] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving simulation: {str(e)}")

@router.get("/user/{user_id}", response_model=List[SimulationResponse])
async def get_user_simulations(user_id: str, limit: int = 50):
    """Get all simulations for a user"""
    try:
        supabase = get_supabase()
        
        response = (
            supabase.table("simulations")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching simulations: {str(e)}")

@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(simulation_id: int):
    """Get a specific simulation by ID"""
    try:
        supabase = get_supabase()
        
        response = (
            supabase.table("simulations")
            .select("*")
            .eq("id", simulation_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{simulation_id}")
async def delete_simulation(simulation_id: int):
    """Delete a simulation"""
    try:
        supabase = get_supabase()
        
        response = (
            supabase.table("simulations")
            .delete()
            .eq("id", simulation_id)
            .execute()
        )
        
        return {"message": "Simulation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def simulations_info():
    return {
        "endpoints": [
            "POST /save - Save a new simulation",
            "GET /user/{user_id} - Get all simulations for a user",
            "GET /{simulation_id} - Get specific simulation",
            "DELETE /{simulation_id} - Delete a simulation"
        ]
    }
