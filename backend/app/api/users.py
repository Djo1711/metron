"""
Users API Router
Gestion des profils utilisateurs
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_supabase

router = APIRouter()

class UsernameUpdate(BaseModel):
    """Modèle pour mettre à jour le username"""
    user_id: str
    username: str

@router.put("/username")
async def update_username(data: UsernameUpdate):
    """Mettre à jour le pseudo de l'utilisateur"""
    print(f"🔍 Tentative de mise à jour username pour user_id: {data.user_id}")
    print(f"🔍 Nouveau username: {data.username}")
    
    try:
        supabase = get_supabase()
        print("✅ Supabase client obtenu")
        
        # Vérifier que le username n'est pas vide
        if not data.username or len(data.username.strip()) < 3:
            print("❌ Username trop court")
            raise HTTPException(
                status_code=400,
                detail="Le pseudo doit contenir au moins 3 caractères"
            )
        
        # Vérifier que l'utilisateur existe
        print(f"🔍 Vérification si user {data.user_id} existe...")
        check_user = supabase.table('users').select('id').eq('id', data.user_id).execute()
        print(f"✅ Résultat de la recherche: {check_user.data}")
        
        if not check_user.data:
            print(f"❌ Utilisateur {data.user_id} non trouvé dans public.users")
            raise HTTPException(
                status_code=404,
                detail="Utilisateur non trouvé. Veuillez contacter le support."
            )
        
        # Mettre à jour le username
        print(f"🔍 Mise à jour du username vers: {data.username.strip()}")
        response = supabase.table('users').update({
            'username': data.username.strip()
        }).eq('id', data.user_id).execute()
        
        print(f"✅ Réponse de la mise à jour: {response.data}")
        
        if not response.data:
            print("❌ Aucune donnée retournée après update")
            raise HTTPException(
                status_code=500,
                detail="Erreur lors de la mise à jour"
            )
        
        print("✅ Username mis à jour avec succès!")
        return {
            "message": "Pseudo mis à jour avec succès",
            "username": data.username.strip()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE: {str(e)}")
        print(f"❌ Type d'erreur: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur : {str(e)}"
        )


@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """
    Récupérer le profil complet d'un utilisateur
    
    Args:
        user_id: ID de l'utilisateur
    
    Returns:
        Profil utilisateur (email, username, etc.)
    """
    try:
        supabase = get_supabase()
        
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=404,
                detail="Utilisateur non trouvé"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur get_user_profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur : {str(e)}"
        )