import { useState } from 'react'
import { getStockQuote, getStockHistory } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MarketData() {
  const [ticker, setTicker] = useState('')
  const [stockData, setStockData] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('1mo')

  const periods = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
  ]

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ticker.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Get quote
      const quoteResponse = await getStockQuote(ticker.toUpperCase())
      setStockData(quoteResponse.data)
      
      // Get history
      await loadHistory(ticker.toUpperCase(), period)
    } catch (error) {
      setError('Stock not found or API error')
      setStockData(null)
      setHistoryData([])
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async (tickerSymbol, selectedPeriod) => {
    try {
      const histResponse = await getStockHistory(tickerSymbol, selectedPeriod)
      const formattedData = histResponse.data.data.map(item => ({
        date: new Date(item.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item.Close.toFixed(2)
      }))
      setHistoryData(formattedData)
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod)
    if (stockData) {
      await loadHistory(stockData.ticker, newPeriod)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-7xl mx-auto px-4">
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
              {loading ? 'Searching...' : '🔍 Search'}
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

            {/* Chart with Period Filters */}
            <div className="glass-card p-8 border border-metron-purple/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Price History</h3>
                <div className="flex gap-2">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handlePeriodChange(p.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        period === p.value
                          ? 'bg-gradient-metron text-white shadow-neon-purple'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#888" 
                      style={{ fontSize: '12px' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid #A855F7',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#A855F7" 
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Loading chart data...
                </div>
              )}
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

        {/* Placeholder */}
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