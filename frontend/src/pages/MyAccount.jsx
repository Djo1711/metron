import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { updateUsername, getUserProfile } from '../services/api'

export default function MyAccount() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)  // 🆕 Profil depuis public.users
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setError('Erreur lors du chargement de l\'utilisateur : ' + userError.message)
        setLoading(false)
        return
      }
      
      setUser(user)
      
      // 🆕 Charger le profil depuis public.users
      if (user) {
        try {
          const profileData = await getUserProfile(user.id)
          setProfile(profileData.data)
        } catch (profileError) {
          console.error('Erreur chargement profil:', profileError)
          // Si le profil n'existe pas, on continue quand même
          setProfile({ username: null })
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setError('Erreur : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-metron-purple mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
        <div className="glass-card p-8 border border-red-500/30 bg-red-500/10 max-w-md">
          <p className="text-red-400 text-center">{error || 'Aucun utilisateur trouvé'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Mon Compte</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez votre profil et vos préférences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setTab('profile')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              tab === 'profile'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            👤 Profil
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              tab === 'settings'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            ⚙️ Paramètres
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="glass-card p-8 border border-metron-purple/30">
            <h2 className="text-2xl font-bold text-white mb-6">Informations du profil</h2>
            
            <div className="space-y-6">
              {/* 🆕 USERNAME SECTION */}
              <UsernameEditor user={user} profile={profile} onUpdate={loadUserData} />
              
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <p className="text-2xl font-semibold text-white">{user.email}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <label className="block text-sm font-medium text-gray-400 mb-2">ID Utilisateur</label>
                  <p className="text-sm text-gray-300 font-mono break-all">{user.id}</p>
                </div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Membre depuis</label>
                  <p className="text-lg font-semibold text-white">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-metron-purple/20 to-metron-blue/20 p-6 rounded-xl border border-metron-purple/50">
                <label className="block text-sm font-medium text-gray-400 mb-2">Accès rapide</label>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <a 
                    href="/simulation" 
                    className="bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-white/10 hover:border-metron-purple/50 transition-all cursor-pointer"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-white font-semibold">Mes Simulations</p>
                    <p className="text-sm text-gray-400 mt-1">Voir toutes mes simulations sauvegardées</p>
                  </a>
                  <a 
                    href="/learning" 
                    className="bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-white/10 hover:border-metron-blue/50 transition-all cursor-pointer"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <p className="text-white font-semibold">Apprentissage</p>
                    <p className="text-sm text-gray-400 mt-1">Continuer mes cours et tutoriels</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="glass-card p-8 border border-metron-purple/20">
            <h2 className="text-2xl font-bold text-white mb-8">Paramètres</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Préférences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10 hover:border-metron-purple/50 transition-all">
                    <input type="checkbox" className="w-5 h-5 accent-metron-purple" />
                    <span className="text-gray-300">Notifications email pour les nouvelles fonctionnalités</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10 hover:border-metron-purple/50 transition-all">
                    <input type="checkbox" className="w-5 h-5 accent-metron-purple" defaultChecked />
                    <span className="text-gray-300">Sauvegarde automatique des simulations</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10 hover:border-metron-purple/50 transition-all">
                    <input type="checkbox" className="w-5 h-5 accent-metron-purple" defaultChecked />
                    <span className="text-gray-300">Recevoir des recommandations de contenu éducatif</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Apparence</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thème</label>
                    <select className="input-futuristic w-full md:w-64">
                      <option value="dark">Sombre (Actuel)</option>
                      <option value="light">Clair (Bientôt disponible)</option>
                      <option value="auto">Automatique (Bientôt disponible)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ Zone dangereuse</h3>
                <button className="bg-red-500/20 hover:bg-red-500 text-white px-6 py-3 rounded-lg border border-red-500/50 hover:border-red-500 transition-all font-semibold">
                  Supprimer le compte
                </button>
                <p className="text-sm text-gray-500 mt-2">Cette action est irréversible</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour éditer le username
function UsernameEditor({ user, profile, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(profile?.username || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Mettre à jour le username local quand le profile change
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username)
    }
  }, [profile])

  const handleSave = async () => {
    if (!username || username.length < 3) {
      setError('Le pseudo doit contenir au moins 3 caractères')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateUsername(user.id, username)
      alert('✅ Pseudo mis à jour avec succès !')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-metron-purple/20 to-metron-blue/20 p-6 rounded-xl border border-metron-purple/50">
      <label className="block text-sm font-medium text-gray-400 mb-2">Pseudo public</label>
      
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Votre pseudo..."
            className="input-futuristic w-full"
            maxLength={20}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-neon flex-1"
            >
              {saving ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setError(null)
                setUsername(profile?.username || '')
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-white">
            {profile?.username || 'Aucun pseudo défini'}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-metron-purple hover:bg-metron-purple/80 rounded-lg text-white transition-all"
          >
            ✏️ Modifier
          </button>
        </div>
      )}
    </div>
  )
}