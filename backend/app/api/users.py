"""
Users API Router
Gestion des profils utilisateurs
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_supabase
from app.utils.username_validator import validate_username  # 🆕 Import

router = APIRouter()

class UsernameUpdate(BaseModel):
    """Modèle pour mettre à jour le username"""
    user_id: str
    username: str

@router.put("/username")
async def update_username(data: UsernameUpdate):
    """
    Mettre à jour le pseudo de l'utilisateur avec validation stricte
    """
    print(f"🔍 Tentative de mise à jour username pour user_id: {data.user_id}")
    print(f"🔍 Nouveau username: {data.username}")
    
    try:
        supabase = get_supabase()
        
        # 🆕 VALIDATION COMPLÈTE DU USERNAME
        is_valid, error_message = validate_username(data.username)
        if not is_valid:
            print(f"❌ Username invalide: {error_message}")
            raise HTTPException(status_code=400, detail=error_message)
        
        # Vérifier que l'utilisateur existe
        check_user = supabase.table('users').select('id').eq('id', data.user_id).execute()
        
        if not check_user.data:
            raise HTTPException(
                status_code=404,
                detail="Utilisateur non trouvé"
            )
        
        # Mettre à jour le username
        username_clean = data.username.strip()
        response = supabase.table('users').update({
            'username': username_clean
        }).eq('id', data.user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Erreur lors de la mise à jour"
            )
        
        print("✅ Username mis à jour avec succès!")
        return {
            "message": "Pseudo mis à jour avec succès",
            "username": username_clean
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur : {str(e)}"
        )


@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Récupérer le profil complet d'un utilisateur"""
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