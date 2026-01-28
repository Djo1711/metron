"""
Simulations API Router
Gestion des simulations de produits structurés
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.database import get_supabase

router = APIRouter()

# ==================== MODELS ====================

class SimulationCreate(BaseModel):
    """Modèle pour créer une simulation"""
    user_id: str
    product_type: str
    ticker: str
    parameters: Dict[str, Any]
    results: Dict[str, Any]

class SimulationResponse(BaseModel):
    """Modèle de réponse pour une simulation"""
    id: int
    user_id: str
    product_type: str
    ticker: str
    parameters: Dict[str, Any]
    results: Dict[str, Any]
    created_at: datetime

# ==================== ENDPOINTS ====================

@router.post("/save")
async def save_simulation(simulation: SimulationCreate):
    """
    Sauvegarder une nouvelle simulation
    
    Args:
        simulation: Données de la simulation (user_id, product_type, ticker, parameters, results)
    
    Returns:
        La simulation créée avec son ID
    """
    try:
        supabase = get_supabase()
        
        # Insérer la simulation
        response = supabase.table('simulations').insert({
            'user_id': simulation.user_id,
            'product_type': simulation.product_type,
            'ticker': simulation.ticker,
            'parameters': simulation.parameters,
            'results': simulation.results
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde")
        
        return {
            "message": "Simulation sauvegardée avec succès",
            "data": response.data[0]
        }
        
    except Exception as e:
        print(f"Erreur save_simulation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la sauvegarde: {str(e)}"
        )


@router.get("/user/{user_id}")
async def get_user_simulations(user_id: str):
    """
    Récupérer toutes les simulations d'un utilisateur
    
    Args:
        user_id: ID de l'utilisateur (UUID Supabase)
    
    Returns:
        Liste des simulations de l'utilisateur triées par date décroissante
    """
    try:
        supabase = get_supabase()
        
        response = supabase.table('simulations').select('*').eq(
            'user_id', user_id
        ).order('created_at', desc=True).execute()
        
        return {
            "data": response.data or [],
            "count": len(response.data) if response.data else 0
        }
        
    except Exception as e:
        print(f"Erreur get_user_simulations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )


@router.delete("/{simulation_id}")
async def delete_simulation(simulation_id: int):
    """
    Supprimer une simulation
    
    Args:
        simulation_id: ID de la simulation à supprimer
    
    Returns:
        Confirmation de la suppression
    """
    try:
        supabase = get_supabase()
        
        # Vérifier que la simulation existe
        check = supabase.table('simulations').select('id').eq(
            'id', simulation_id
        ).execute()
        
        if not check.data:
            raise HTTPException(
                status_code=404,
                detail="Simulation non trouvée"
            )
        
        # Supprimer la simulation
        response = supabase.table('simulations').delete().eq(
            'id', simulation_id
        ).execute()
        
        return {
            "message": "Simulation supprimée avec succès",
            "id": simulation_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur delete_simulation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )


@router.get("/leaderboard")
async def get_leaderboard(
    product_type: Optional[str] = None,
    metric: str = "max_gain",
    limit: int = 50
):
    """
    Récupère le classement des meilleures simulations (leaderboard)
    
    Args:
        product_type: Filtrer par type de produit (autocall, reverse_convertible, capital_protected, warrant)
        metric: Métrique de classement (max_gain, probability_profit, sharpe_ratio)
        limit: Nombre de résultats à retourner (max 100)
    
    Returns:
        Liste des meilleures simulations avec les données utilisateur (email + username)
    
    Examples:
        GET /api/simulations/leaderboard
        GET /api/simulations/leaderboard?product_type=autocall
        GET /api/simulations/leaderboard?metric=probability_profit&limit=10
    """
    try:
        supabase = get_supabase()
        
        # Limiter à 100 max pour éviter les abus
        limit = min(limit, 100)
        
        # Valider la métrique
        valid_metrics = ["max_gain", "probability_profit", "sharpe_ratio"]
        if metric not in valid_metrics:
            raise HTTPException(
                status_code=400,
                detail=f"Métrique invalide. Choix possibles: {', '.join(valid_metrics)}"
            )
        
        # Valider le type de produit si fourni
        valid_products = ["autocall", "reverse_convertible", "capital_protected", "warrant"]
        if product_type and product_type not in valid_products:
            raise HTTPException(
                status_code=400,
                detail=f"Type de produit invalide. Choix possibles: {', '.join(valid_products)}"
            )
        
        # Construire la requête de base SANS jointure
        query = supabase.table('simulations').select('*')
        
        # Filtre par produit si spécifié
        if product_type:
            query = query.eq('product_type', product_type)
        
        # Limiter les résultats (on récupère plus que nécessaire pour trier ensuite)
        query = query.limit(500)  # On récupère 500 puis on trie et limite
        
        # Exécuter la requête
        response = query.execute()
        simulations = response.data or []
        
        if not simulations:
            return []
        
        # Fonction pour calculer la clé de tri
        def get_sort_key(sim):
            results = sim.get('results', {})
            
            if metric == "max_gain":
                # Trier par gain maximum
                return results.get('max_gain', 0)
            
            elif metric == "probability_profit":
                # Trier par probabilité de profit
                return results.get('probability_profit', 0)
            
            elif metric == "sharpe_ratio":
                # Ratio simplifié : gain / risque
                max_gain = results.get('max_gain', 0)
                risk_level = max(results.get('risk_level', 1), 1)  # Éviter division par 0
                return max_gain / risk_level
            
            else:
                return 0
        
        # Trier par ordre décroissant (meilleurs en premier)
        simulations.sort(key=get_sort_key, reverse=True)
        
        # Limiter au nombre demandé
        simulations = simulations[:limit]
        
        # 🆕 Récupérer les emails ET usernames séparément
        user_ids = [sim['user_id'] for sim in simulations]
        users_response = supabase.table('users').select('id, email, username').in_('id', user_ids).execute()
        users_dict = {u['id']: u for u in (users_response.data or [])}
        
        # Ajouter les infos utilisateur aux simulations
        for i, sim in enumerate(simulations):
            sim['rank'] = i + 1
            sim['users'] = users_dict.get(sim['user_id'], {'email': 'Anonyme', 'username': None})
        
        return simulations
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur leaderboard: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération du leaderboard: {str(e)}"
        )


@router.get("/stats")
async def get_simulation_stats():
    """
    Récupérer les statistiques globales des simulations
    
    Returns:
        Statistiques: nombre total, par produit, etc.
    """
    try:
        supabase = get_supabase()
        
        # Récupérer toutes les simulations
        response = supabase.table('simulations').select('product_type').execute()
        
        if not response.data:
            return {
                "total": 0,
                "by_product": {}
            }
        
        # Compter par type de produit
        by_product = {}
        for sim in response.data:
            product = sim.get('product_type', 'unknown')
            by_product[product] = by_product.get(product, 0) + 1
        
        return {
            "total": len(response.data),
            "by_product": by_product
        }
        
    except Exception as e:
        print(f"Erreur get_stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des stats: {str(e)}"
        )