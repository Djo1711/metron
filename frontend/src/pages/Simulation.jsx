import { useState } from 'react'
import { priceReverseConvertible, saveSimulation } from '../services/api'
import { supabase } from '../services/supabase'

export default function Simulation({ isGuest }) {
  const [formData, setFormData] = useState({
    ticker: 'AAPL',
    principal: 10000,
    coupon_rate: 8.0,
    barrier_level: 60,
    maturity_years: 1,
    spot_price: 150,
    volatility: 0.25,
    risk_free_rate: 0.04,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: parseFloat(value) || value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await priceReverseConvertible(formData)
      setResult(response.data)
    } catch (error) {
      alert('Error pricing product: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSimulation = async () => {
    if (!result) {
      alert('Please price the product first')
      return
    }

    // Check if guest mode
    if (isGuest) {
      alert('⚠️ Guest mode: Simulations cannot be saved. Create an account to save your work!')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await saveSimulation({
        user_id: user.id,
        product_type: 'Reverse Convertible',
        ticker: formData.ticker,
        parameters: formData,
        results: result
      })

      alert('✅ Simulation saved successfully!')
    } catch (error) {
      alert('Error saving simulation: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Reverse Convertible Simulation</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Price a reverse convertible structured product using Black-Scholes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Parameters Form */}
          <div className="glass-card p-8 border border-metron-purple/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              ⚙️ Parameters
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ticker</label>
                <input
                  type="text"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                  placeholder="AAPL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Principal ($)</label>
                <input
                  type="number"
                  name="principal"
                  value={formData.principal}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Coupon Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="coupon_rate"
                  value={formData.coupon_rate}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Barrier Level (%)</label>
                <input
                  type="number"
                  name="barrier_level"
                  value={formData.barrier_level}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Maturity (years)</label>
                <input
                  type="number"
                  step="0.1"
                  name="maturity_years"
                  value={formData.maturity_years}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Spot Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="spot_price"
                  value={formData.spot_price}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Volatility</label>
                <input
                  type="number"
                  step="0.01"
                  name="volatility"
                  value={formData.volatility}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk-Free Rate</label>
                <input
                  type="number"
                  step="0.01"
                  name="risk_free_rate"
                  value={formData.risk_free_rate}
                  onChange={handleChange}
                  className="input-futuristic w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon w-full mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    Calculating...
                  </div>
                ) : (
                  '🚀 Price Product'
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          {result ? (
            <div className="glass-card p-8 border border-metron-blue/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                📊 Results
              </h2>
              
              <div className="space-y-6">
                {/* Fair Value - Highlight */}
                <div className="bg-gradient-to-br from-metron-purple/20 to-metron-blue/20 p-6 rounded-xl border border-metron-purple/50 shadow-neon-purple">
                  <p className="text-sm text-gray-400 mb-1">Fair Value</p>
                  <p className="text-4xl font-bold text-white">
                    ${result.fair_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>

                {/* Other Results Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Coupon Value</p>
                    <p className="text-xl font-bold text-white">${result.coupon_value}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Embedded Put</p>
                    <p className="text-xl font-bold text-white">${result.embedded_put_value}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Break-Even</p>
                    <p className="text-xl font-bold text-white">${result.break_even_price}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Delta</p>
                    <p className="text-xl font-bold text-white">{result.delta.toFixed(4)}</p>
                  </div>
                </div>

                {/* Greeks */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Greeks</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                      <p className="text-xs text-gray-400 mb-1">Gamma</p>
                      <p className="text-sm font-semibold text-white">{result.gamma.toFixed(6)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                      <p className="text-xs text-gray-400 mb-1">Vega</p>
                      <p className="text-sm font-semibold text-white">{result.vega.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                      <p className="text-xs text-gray-400 mb-1">Theta</p>
                      <p className="text-sm font-semibold text-white">{result.theta.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSimulation}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    isGuest 
                      ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed' 
                      : 'bg-green-500/20 hover:bg-green-500 text-white border border-green-500/50 hover:border-green-500 hover:shadow-lg'
                  }`}
                  disabled={isGuest}
                >
                  {isGuest ? '🔒 Save (Login Required)' : '💾 Save Simulation'}
                </button>

                {isGuest && (
                  <p className="text-xs text-center text-gray-500">
                    Create an account to save your simulations
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-gray-400 text-lg">
                  Configure parameters and click "Price Product" to see results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}