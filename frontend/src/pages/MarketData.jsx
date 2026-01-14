import { useState } from 'react'
import { getStockQuote } from '../services/api'

export default function MarketData() {
  const [ticker, setTicker] = useState('')
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ticker.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await getStockQuote(ticker.toUpperCase())
      setStockData(response.data)
    } catch (error) {
      setError('Stock not found or API error')
      setStockData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Market Data</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time stock quotes and market information
          </p>
        </div>

        {/* Search Box */}
        <div className="glass-card p-8 mb-8 border border-metron-purple/30">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL, MSFT, GOOGL)"
              className="input-futuristic flex-1 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-neon px-8"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                '🔍 Search'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card p-6 mb-8 border border-red-500/30 bg-red-500/10">
            <p className="text-red-400 text-center">❌ {error}</p>
          </div>
        )}

        {/* Stock Data Display */}
        {stockData && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="glass-card p-8 border border-metron-blue/30">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">{stockData.ticker}</h2>
                  <p className="text-gray-400 text-lg">{stockData.name || 'Company Name'}</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white mb-2">
                    ${stockData.current_price?.toFixed(2)}
                  </p>
                  <p
                    className={`text-xl font-semibold ${
                      stockData.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stockData.change_percent >= 0 ? '↑' : '↓'} 
                    {Math.abs(stockData.change_percent).toFixed(2)}%
                    <span className="text-sm ml-2">
                      ({stockData.change_percent >= 0 ? '+' : ''}{stockData.change?.toFixed(2)})
                    </span>
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Volume</p>
                  <p className="text-lg font-bold text-white">
                    {stockData.volume?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-white">
                    {stockData.market_cap 
                      ? `$${(stockData.market_cap / 1e9).toFixed(2)}B`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Day High</p>
                  <p className="text-lg font-bold text-white">
                    ${stockData.day_high?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Day Low</p>
                  <p className="text-lg font-bold text-white">
                    ${stockData.day_low?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border border-metron-purple/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 Trading Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open</span>
                    <span className="text-white font-semibold">
                      ${stockData.open?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Previous Close</span>
                    <span className="text-white font-semibold">
                      ${stockData.previous_close?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">52 Week High</span>
                    <span className="text-white font-semibold">
                      ${stockData.fifty_two_week_high?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">52 Week Low</span>
                    <span className="text-white font-semibold">
                      ${stockData.fifty_two_week_low?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 border border-metron-blue/20">
                <h3 className="text-xl font-bold text-white mb-4">💼 Company Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sector</span>
                    <span className="text-white font-semibold">
                      {stockData.sector || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Industry</span>
                    <span className="text-white font-semibold">
                      {stockData.industry || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency</span>
                    <span className="text-white font-semibold">
                      {stockData.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exchange</span>
                    <span className="text-white font-semibold">
                      {stockData.exchange || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder when no data */}
        {!stockData && !loading && !error && (
          <div className="glass-card p-16 text-center border border-white/10">
            <div className="text-7xl mb-6">📈</div>
            <p className="text-gray-400 text-xl mb-2">Search for a stock to get started</p>
            <p className="text-gray-500 text-sm">
              Try popular tickers like AAPL, MSFT, TSLA, GOOGL
            </p>
          </div>
        )}
      </div>
    </div>
  )
}