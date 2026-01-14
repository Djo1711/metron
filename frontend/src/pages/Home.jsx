import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            <span className="gradient-text">Welcome to Metron</span>
          </h1>
          <p className="text-xl text-gray-400">
            Your intelligent platform for structured products pricing and simulation
          </p>
        </div>

        {/* Feature Cards - CLIQUABLES */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Link to="/market" className="glass-card p-8 hover:shadow-neon-blue card-hover group cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-metron-blue mb-3 group-hover:text-metron-purple transition-colors">
              Market Data
            </h3>
            <p className="text-gray-400">
              Real-time stock quotes and historical data powered by Yahoo Finance
            </p>
          </Link>

          <Link to="/simulation" className="glass-card p-8 hover:shadow-neon-purple card-hover group cursor-pointer">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-metron-purple mb-3 group-hover:text-metron-pink transition-colors">
              Pricing Engine
            </h3>
            <p className="text-gray-400">
              Black-Scholes and Monte Carlo simulations for advanced pricing
            </p>
          </Link>

          <Link to="/learning" className="glass-card p-8 hover:shadow-neon-pink card-hover group cursor-pointer">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-metron-pink mb-3 group-hover:text-metron-blue transition-colors">
              Learning Center
            </h3>
            <p className="text-gray-400">
              Interactive tutorials and educational content for beginners
            </p>
          </Link>
        </div>

        {/* Trending Stocks */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            📈 Trending Stocks
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-metron-purple"></div>
              <p className="text-gray-400 mt-4">Loading market data...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stocks.map((stock) => (
                <div
                  key={stock.ticker}
                  className="glass-card p-5 card-hover border border-metron-purple/20 hover:border-metron-purple/50"
                >
                  <h3 className="font-bold text-xl text-white mb-1">{stock.ticker}</h3>
                  <p className="text-sm text-gray-400 truncate mb-3">{stock.name}</p>
                  <p className="text-2xl font-bold text-white mb-2">${stock.price}</p>
                  <p
                    className={`text-sm font-semibold ${
                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stock.change >= 0 ? '↑' : '↓'} {Math.abs(stock.change).toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="glass-card p-12 border border-metron-purple/30">
          <h2 className="text-4xl font-bold text-center mb-3">
            <span className="gradient-text">Notre Équipe</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Les étudiants passionnés derrière Metron
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Membre 1 */}
            <div className="glass-card p-6 text-center card-hover border border-metron-purple/20">
              <div className="w-24 h-24 bg-gradient-to-br from-metron-purple to-metron-blue rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-neon-purple">
                GB
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Votre Nom</h3>
              <p className="text-sm text-metron-purple mb-3 font-medium">Tech Lead & Data Science</p>
              <p className="text-sm text-gray-400">
                Passionné par l'IA et la finance quantitative. Responsable de l'architecture backend et des modèles de pricing.
              </p>
            </div>

            {/* Membre 2 */}
            <div className="glass-card p-6 text-center card-hover border border-metron-blue/20">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                M2
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Membre 2</h3>
              <p className="text-sm text-metron-blue mb-3 font-medium">Frontend Developer</p>
              <p className="text-sm text-gray-400">
                Expert en React et design UI/UX. Crée des interfaces intuitives et élégantes.
              </p>
            </div>

            {/* Membre 3 */}
            <div className="glass-card p-6 text-center card-hover border border-metron-pink/20">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                M3
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Membre 3</h3>
              <p className="text-sm text-metron-pink mb-3 font-medium">Financial Engineer</p>
              <p className="text-sm text-gray-400">
                Spécialiste des produits structurés. Garantit la précision des modèles financiers.
              </p>
            </div>

            {/* Membre 4 */}
            <div className="glass-card p-6 text-center card-hover border border-metron-purple/20">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                M4
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Membre 4</h3>
              <p className="text-sm text-metron-purple mb-3 font-medium">Content & Pedagogy</p>
              <p className="text-sm text-gray-400">
                Créateur de contenu éducatif. Rend la finance accessible à tous.
              </p>
            </div>

            {/* Membre 5 */}
            <div className="glass-card p-6 text-center card-hover border border-metron-blue/20">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                M5
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Membre 5</h3>
              <p className="text-sm text-metron-blue mb-3 font-medium">DevOps Engineer</p>
              <p className="text-sm text-gray-400">
                Expert en déploiement et qualité. Assure la fiabilité de la plateforme.
              </p>
            </div>

            {/* Membre 6 */}
            <div className="glass-card p-6 text-center card-hover border border-metron-pink/20">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                M6
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Membre 6</h3>
              <p className="text-sm text-metron-pink mb-3 font-medium">Finance Specialist</p>
              <p className="text-sm text-gray-400">
                Analyste financier. Valide les scénarios et cas d'usage réels.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 pt-8 border-t border-white/10">
            <p className="text-gray-300 font-medium text-lg">
              🎓 Projet réalisé dans le cadre de [Nom de votre école/formation]
            </p>
            <p className="text-gray-500 mt-2">
              Janvier 2026 - Durée : 4 semaines
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}