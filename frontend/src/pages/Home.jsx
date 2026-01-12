import { useEffect, useState } from 'react'
import { getTrendingStocks } from '../services/api'

export default function Home() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrendingStocks()
  }, [])

  const loadTrendingStocks = async () => {
    try {
      const response = await getTrendingStocks()
      setStocks(response.data)
    } catch (error) {
      console.error('Error loading stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Welcome to Metron
      </h1>
      <p className="text-gray-600 mb-8">
        Your intelligent platform for structured products pricing and simulation
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            Market Data
          </h3>
          <p className="text-gray-700">
            Real-time stock quotes and historical data
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Pricing Engine
          </h3>
          <p className="text-gray-700">
            Black-Scholes and Monte Carlo simulations
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-xl font-semibold text-purple-800 mb-2">
            Learning Center
          </h3>
          <p className="text-gray-700">
            Interactive tutorials and educational content
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Trending Stocks
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stocks.map((stock) => (
            <div
              key={stock.ticker}
              className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{stock.ticker}</h3>
              <p className="text-sm text-gray-600">{stock.name}</p>
              <p className="text-xl font-semibold mt-2">${stock.price}</p>
              <p
                className={`text-sm ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stock.change >= 0 ? '↑' : '↓'} {Math.abs(stock.change).toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}