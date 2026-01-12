import { useState } from 'react'
import { getStockQuote } from '../services/api'

export default function MarketData() {
  const [ticker, setTicker] = useState('')
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ticker) return

    setLoading(true)
    setError('')
    
    try {
      const response = await getStockQuote(ticker.toUpperCase())
      setStockData(response.data)
    } catch (err) {
      setError('Stock not found or API error')
      setStockData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Market Data
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter ticker (e.g., AAPL, MSFT)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {stockData && (
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {stockData.ticker}
              </h2>
              <p className="text-gray-600">{stockData.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">
                ${stockData.current_price}
              </p>
              <p
                className={`text-lg font-semibold ${
                  stockData.change_percent >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stockData.change_percent >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(stockData.change_percent).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Volume</p>
              <p className="text-lg font-semibold">
                {stockData.volume.toLocaleString()}
              </p>
            </div>
            {stockData.market_cap && (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-lg font-semibold">
                  ${(stockData.market_cap / 1e9).toFixed(2)}B
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}