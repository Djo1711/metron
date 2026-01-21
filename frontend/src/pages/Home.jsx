import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTrendingStocks } from '../services/api'
import SparklineChart from '../components/SparklineChart'

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
      console.error('Erreur lors du chargement des actions:', error)
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
            <span className="gradient-text">Bienvenue sur Metron</span>
          </h1>
          <p className="text-xl text-gray-400">
            Votre plateforme intelligente pour le pricing et la simulation de produits structurés
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Link to="/market" className="glass-card p-8 hover:shadow-neon-blue card-hover group cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-metron-blue mb-3 group-hover:text-metron-purple transition-colors">
              Données de Marché
            </h3>
            <p className="text-gray-400">
              Cotations en temps réel et données historiques via Yahoo Finance
            </p>
          </Link>

          <Link to="/simulation" className="glass-card p-8 hover:shadow-neon-purple card-hover group cursor-pointer">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-metron-purple mb-3 group-hover:text-metron-pink transition-colors">
              Simulateur
            </h3>
            <p className="text-gray-400">
              Simulations Black-Scholes et Monte Carlo pour un pricing avancé
            </p>
          </Link>

          <Link to="/learning" className="glass-card p-8 hover:shadow-neon-pink card-hover group cursor-pointer">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-metron-pink mb-3 group-hover:text-metron-blue transition-colors">
              Centre d'Apprentissage
            </h3>
            <p className="text-gray-400">
              Tutoriels interactifs et contenu éducatif pour débutants
            </p>
          </Link>
        </div>

        {/* Trending Stocks with Sparklines */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            📈 Actions Tendances
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-metron-purple"></div>
              <p className="text-gray-400 mt-4">Chargement des données de marché...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  to={`/market?ticker=${stock.ticker}`}
                  className="glass-card p-5 card-hover border border-metron-purple/20 hover:border-metron-purple/50 cursor-pointer transition-all"
                >
                  <h3 className="font-bold text-xl text-white mb-1">{stock.ticker}</h3>
                  <p className="text-sm text-gray-400 truncate mb-3">{stock.name}</p>
                  <p className="text-2xl font-bold text-white mb-2">${stock.price}</p>
                  <p
                    className={`text-sm font-semibold mb-3 ${
                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stock.change >= 0 ? '↑' : '↓'} {Math.abs(stock.change).toFixed(2)}%
                  </p>
                  {stock.sparkline && stock.sparkline.length > 0 && (
                    <div className="mt-2">
                      <SparklineChart 
                        data={stock.sparkline} 
                        color={stock.change >= 0 ? '#4ade80' : '#f87171'} 
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* About Section with CTA */}
        <div className="glass-card p-12 border border-metron-purple/30 text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Découvrez Notre Équipe</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            6 étudiants passionnés réunis pour démocratiser la finance quantitative 
            et rendre les produits structurés accessibles à tous.
          </p>
          <Link 
            to="/team" 
            className="btn-neon inline-block"
          >
            Rencontrer l'équipe →
          </Link>
        </div>
      </div>
    </div>
  )
}
