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
              Moteur de Pricing
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

        {/* Team Section */}
        <div className="glass-card p-12 border border-metron-purple/30">
          <h2 className="text-4xl font-bold text-center mb-3">
            <span className="gradient-text">Notre Équipe</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Les étudiants passionnés derrière Metron
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Geoffroy */}
            <div className="glass-card p-6 text-center card-hover border border-metron-purple/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-metron-purple shadow-neon-purple">
                <img 
                  src="/team/geoffroy.jpg" 
                  alt="Geoffroy Boccon-Liaudet"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Geoffroy Boccon-Liaudet</h3>
              <p className="text-sm text-metron-purple mb-3 font-medium">Tech Lead & Développeur Fullstack</p>
              <p className="text-sm text-gray-400">
                Architecte fullstack du projet. Responsable du développement backend (FastAPI), frontend (React) et du design UI/UX. Implémentation des modèles de pricing Black-Scholes.
              </p>
            </div>

            {/* Danaé */}
            <div className="glass-card p-6 text-center card-hover border border-metron-blue/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-500">
                <img 
                  src="/team/danae.jpg" 
                  alt="Danaé Collard"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Danaé Collard</h3>
              <p className="text-sm text-green-400 mb-3 font-medium">Responsable Contenu & Pédagogie</p>
              <p className="text-sm text-gray-400">
                Responsable du Centre d'Apprentissage. Création de contenu pédagogique et tutoriels interactifs pour rendre la finance quantitative accessible.
              </p>
            </div>

            {/* Mael */}
            <div className="glass-card p-6 text-center card-hover border border-metron-pink/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-orange-500">
                <img 
                  src="/team/mael.jpg" 
                  alt="Mael Coredo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Mael Coredo</h3>
              <p className="text-sm text-orange-400 mb-3 font-medium">Ingénieur Financier</p>
              <p className="text-sm text-gray-400">
                Ingénieur financier. Développement et validation des modèles de pricing pour les produits structurés (Reverse Convertible, Autocall).
              </p>
            </div>

            {/* Ethan */}
            <div className="glass-card p-6 text-center card-hover border border-metron-purple/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-pink-500">
                <img 
                  src="/team/ethan.jpg" 
                  alt="Ethan Chetboun"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Ethan Chetboun</h3>
              <p className="text-sm text-pink-400 mb-3 font-medium">Analyste de Marché</p>
              <p className="text-sm text-gray-400">
                Analyste stratégique. Réalisation de l'étude de marché et analyse du public cible. Contribution à l'état de l'art des produits structurés.
              </p>
            </div>

            {/* Mathias */}
            <div className="glass-card p-6 text-center card-hover border border-metron-blue/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-indigo-500">
                <img 
                  src="/team/mathias.jpg" 
                  alt="Mathias Rechsteiner"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Mathias Rechsteiner</h3>
              <p className="text-sm text-indigo-400 mb-3 font-medium">Ingénieur DevOps</p>
              <p className="text-sm text-gray-400">
                Expert en déploiement et qualité. Assure la fiabilité de la plateforme.
              </p>
            </div>

            {/* Amine */}
            <div className="glass-card p-6 text-center card-hover border border-metron-pink/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-yellow-500">
                <img 
                  src="/team/amine.jpg" 
                  alt="Amine Gaghighi"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Amine Gaghighi</h3>
              <p className="text-sm text-yellow-400 mb-3 font-medium">Chef de Projet</p>
              <p className="text-sm text-gray-400">
                Étude de faisabilité TELOS et coordination de l'équipe via ClickUp. Gestion des tâches et du planning.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 pt-8 border-t border-white/10">
            <p className="text-gray-300 font-medium text-lg">
              🎓 Projet réalisé dans le cadre du PFE de l'ECE
            </p>
            <p className="text-gray-500 mt-2">
              2025 - 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}