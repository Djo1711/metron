import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Navbar({ user, isGuest }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem('guestMode')
      window.location.href = '/login'
    } else {
      await supabase.auth.signOut()
      navigate('/login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-metron-darker/95 backdrop-blur-xl border-b border-metron-purple/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-white hover:scale-105 transition-transform">
              <span className="bg-gradient-to-r from-metron-purple to-metron-blue bg-clip-text text-transparent">METRON</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-2">
                <Link to="/" className={`px-4 py-2 rounded-lg transition-all ${isActive('/') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  Tableau de bord
                </Link>
                <Link to="/market" className={`px-4 py-2 rounded-lg transition-all ${isActive('/market') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  Données de Marché
                </Link>
                <Link to="/simulation" className={`px-4 py-2 rounded-lg transition-all ${isActive('/simulation') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  Simulateur
                </Link>
                <Link to="/learning" className={`px-4 py-2 rounded-lg transition-all ${isActive('/learning') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  Apprentissage
                </Link>
                {!isGuest && (
                  <Link to="/account" className={`px-4 py-2 rounded-lg transition-all ${isActive('/account') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                    Mon Compte
                  </Link>
                )}
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/70">
                {isGuest ? '👤 Mode Invité' : user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg border border-red-500 hover:shadow-lg transition-all font-medium"
              >
                {isGuest ? 'Quitter' : 'Déconnexion'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}