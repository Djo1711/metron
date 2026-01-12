import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Navbar({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold">
              Metron
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link to="/market" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Market Data
                </Link>
                <Link to="/simulation" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Simulation
                </Link>
                <Link to="/learning" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Learning
                </Link>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}