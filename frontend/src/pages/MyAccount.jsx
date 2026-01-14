import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { getUserSimulations, deleteSimulation } from '../services/api'

export default function MyAccount() {
  const [user, setUser] = useState(null)
  const [simulations, setSimulations] = useState([])
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
        setError('Error loading user: ' + userError.message)
        setLoading(false)
        return
      }
      
      setUser(user)

      if (user) {
        try {
          const response = await getUserSimulations(user.id)
          setSimulations(response.data || [])
        } catch (simError) {
          console.error('Simulations error:', simError)
          setSimulations([])
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSimulation = async (id) => {
    if (!confirm('Delete this simulation?')) return
    
    try {
      await deleteSimulation(id)
      setSimulations(simulations.filter(sim => sim.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Error deleting simulation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-metron-purple mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
        <div className="glass-card p-8 border border-red-500/30 bg-red-500/10 max-w-md">
          <p className="text-red-400 text-center">{error || 'No user found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">My Account</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your profile and simulation history
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
            👤 Profile
          </button>
          <button
            onClick={() => setTab('simulations')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              tab === 'simulations'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            📊 Simulations ({simulations.length})
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              tab === 'settings'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="glass-card p-8 border border-metron-purple/30">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <p className="text-2xl font-semibold text-white">{user.email}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
                  <p className="text-sm text-gray-300 font-mono break-all">{user.id}</p>
                </div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Member Since</label>
                  <p className="text-lg font-semibold text-white">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-metron-purple/20 to-metron-blue/20 p-6 rounded-xl border border-metron-purple/50">
                <label className="block text-sm font-medium text-gray-400 mb-2">Total Simulations</label>
                <p className="text-4xl font-bold text-white">{simulations.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Simulations Tab */}
        {tab === 'simulations' && (
          <div>
            {simulations.length === 0 ? (
              <div className="glass-card p-16 text-center border border-white/10">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 text-xl mb-2">No simulations yet</p>
                <p className="text-gray-500 mb-6">Create your first pricing simulation!</p>
                <a href="/simulation" className="inline-block btn-neon">
                  Start Simulation →
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {simulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="glass-card p-6 border border-metron-purple/20 card-hover"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {sim.product_type}
                        </h3>
                        <p className="text-sm text-gray-400">
                          📅 {new Date(sim.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSimulation(sim.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all border border-red-500/20 hover:border-red-500/50"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-metron-purple mb-3 text-lg">Parameters</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Ticker:</span>
                            <span className="text-white font-semibold">{sim.ticker}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Principal:</span>
                            <span className="text-white font-semibold">${sim.parameters?.principal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Coupon:</span>
                            <span className="text-white font-semibold">{sim.parameters?.coupon_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Barrier:</span>
                            <span className="text-white font-semibold">{sim.parameters?.barrier_level}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-metron-blue mb-3 text-lg">Results</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fair Value:</span>
                            <span className="text-white font-semibold">${sim.results?.fair_value?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Delta:</span>
                            <span className="text-white font-semibold">{sim.results?.delta?.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vega:</span>
                            <span className="text-white font-semibold">{sim.results?.vega?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Break-even:</span>
                            <span className="text-white font-semibold">${sim.results?.break_even_price?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="glass-card p-8 border border-metron-purple/20">
            <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10 hover:border-metron-purple/50 transition-all">
                    <input type="checkbox" className="w-5 h-5 accent-metron-purple" />
                    <span className="text-gray-300">Email notifications for new features</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10 hover:border-metron-purple/50 transition-all">
                    <input type="checkbox" className="w-5 h-5 accent-metron-purple" defaultChecked />
                    <span className="text-gray-300">Auto-save simulations</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
                <button className="bg-red-500/20 hover:bg-red-500 text-white px-6 py-3 rounded-lg border border-red-500/50 hover:border-red-500 transition-all font-semibold">
                  Delete Account
                </button>
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}