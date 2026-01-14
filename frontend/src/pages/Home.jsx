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
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
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

      {/* SECTION NOTRE ÉQUIPE */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Notre Équipe
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Les étudiants passionnés derrière Metron
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Membre 1 */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              GB
            </div>
            <h3 className="text-xl font-bold">Votre Nom</h3>
            <p className="text-sm text-gray-600 mb-2">Tech Lead & Data Science</p>
            <p className="text-sm text-gray-700">
              Passionné par l'IA et la finance quantitative. Responsable de l'architecture backend et des modèles de pricing.
            </p>
          </div>

          {/* Membre 2 */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              M2
            </div>
            <h3 className="text-xl font-bold">Membre 2</h3>
            <p className="text-sm text-gray-600 mb-2">Frontend Developer</p>
            <p className="text-sm text-gray-700">
              Expert en React et design UI/UX. Crée des interfaces intuitives et élégantes.
            </p>
          </div>

          {/* Membre 3 */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              M3
            </div>
            <h3 className="text-xl font-bold">Membre 3</h3>
            <p className="text-sm text-gray-600 mb-2">Financial Engineer</p>
            <p className="text-sm text-gray-700">
              Spécialiste des produits structurés. Garantit la précision des modèles financiers.
            </p>
          </div>

          {/* Membre 4 */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              M4
            </div>
            <h3 className="text-xl font-bold">Membre 4</h3>
            <p className="text-sm text-gray-600 mb-2">Content & Pedagogy</p>
            <p className="text-sm text-gray-700">
              Créateur de contenu éducatif. Rend la finance accessible à tous.
            </p>
          </div>

          {/* Membre 5 */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              M5
            </div>
            <h3 className="text-xl font-bold">Membre 5</h3>
            <p className="text-sm text-gray-600 mb-2">DevOps Engineer</p>
            <p className="text-sm text-gray-700">
              Expert en déploiement et qualité. Assure la fiabilité de la plateforme.
            </p>
          </div>

          {/* Membre 6 */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              M6
            </div>
            <h3 className="text-xl font-bold">Membre 6</h3>
            <p className="text-sm text-gray-600 mb-2">Finance Specialist</p>
            <p className="text-sm text-gray-700">
              Analyste financier. Valide les scénarios et cas d'usage réels.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-700 font-medium">
            🎓 Projet réalisé dans le cadre de [Nom de votre école/formation]
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Janvier 2026 - Durée : 4 semaines
          </p>
        </div>
      </div>
    </div>
  )
}