import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { getUserSimulations, deleteSimulation } from '../services/api'

export default function MyAccount() {
  const [user, setUser] = useState(null)
  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('profile') // profile, simulations, settings

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get simulations history
      if (user) {
        const response = await getUserSimulations(user.id)
        setSimulations(response.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
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
      alert('Error deleting simulation')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-2 ${tab === 'profile' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab('simulations')}
          className={`px-4 py-2 ${tab === 'simulations' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          Simulations History ({simulations.length})
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`px-4 py-2 ${tab === 'settings' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          Settings
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">User ID</label>
              <p className="text-sm text-gray-500 font-mono">{user?.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Member since</label>
              <p className="text-lg">
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Total Simulations</label>
              <p className="text-lg font-semibold">{simulations.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Simulations History Tab */}
      {tab === 'simulations' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Simulation History</h2>
          
          {simulations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No simulations yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.map((sim) => (
                <div key={sim.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{sim.product_type}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(sim.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSimulation(sim.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Ticker:</span> {sim.ticker}</p>
                        <p><span className="font-medium">Principal:</span> ${sim.parameters.principal}</p>
                        <p><span className="font-medium">Coupon:</span> {sim.parameters.coupon_rate}%</p>
                        <p><span className="font-medium">Barrier:</span> {sim.parameters.barrier_level}%</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Results</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Fair Value:</span> ${sim.results.fair_value?.toFixed(2)}</p>
                        <p><span className="font-medium">Delta:</span> {sim.results.delta?.toFixed(4)}</p>
                        <p><span className="font-medium">Break-even:</span> ${sim.results.break_even_price?.toFixed(2)}</p>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Preferences</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Email notifications</span>
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span>Save simulations automatically</span>
              </label>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Danger Zone</h3>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}