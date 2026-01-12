import { useState } from 'react'
import { priceReverseConvertible } from '../services/api'

export default function Simulation() {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Reverse Convertible Simulation
      </h1>
      <p className="text-gray-600 mb-8">
        Price a reverse convertible structured product using Black-Scholes
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Parameters</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ticker</label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Principal ($)</label>
              <input
                type="number"
                name="principal"
                value={formData.principal}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coupon Rate (%)</label>
              <input
                type="number"
                step="0.1"
                name="coupon_rate"
                value={formData.coupon_rate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Barrier Level (%)</label>
              <input
                type="number"
                name="barrier_level"
                value={formData.barrier_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maturity (years)</label>
              <input
                type="number"
                step="0.1"
                name="maturity_years"
                value={formData.maturity_years}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Spot Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="spot_price"
                value={formData.spot_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Volatility</label>
              <input
                type="number"
                step="0.01"
                name="volatility"
                value={formData.volatility}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Risk-Free Rate</label>
              <input
                type="number"
                step="0.01"
                name="risk_free_rate"
                value={formData.risk_free_rate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Calculating...' : 'Price Product'}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Results</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Fair Value</p>
                <p className="text-3xl font-bold text-blue-800">
                  ${result.fair_value.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Coupon Value</p>
                  <p className="text-lg font-semibold">${result.coupon_value}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Embedded Put</p>
                  <p className="text-lg font-semibold">${result.embedded_put_value}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Break-Even</p>
                  <p className="text-lg font-semibold">${result.break_even_price}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Delta</p>
                  <p className="text-lg font-semibold">{result.delta.toFixed(4)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Greeks</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Gamma:</span>
                    <span className="font-semibold">{result.gamma.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Vega:</span>
                    <span className="font-semibold">{result.vega.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Theta:</span>
                    <span className="font-semibold">{result.theta.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}