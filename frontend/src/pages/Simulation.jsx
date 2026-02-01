import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { priceProduct, saveSimulation, getQuickPricingData, getUserSimulations, deleteSimulation, getLeaderboard, buildProducts } from '../services/api'
import { supabase } from '../services/supabase'
import Tooltip, { InfoIcon } from '../components/Tooltip'

export default function Simulation({ isGuest }) {
  const [searchParams] = useSearchParams()
  const productFromUrl = searchParams.get('product')
  
  // Gestion des onglets
  const [activeTab, setActiveTab] = useState('simulator')
  
  // États pour le simulateur
  const [selectedProduct, setSelectedProduct] = useState(productFromUrl || 'autocall')
  const [formData, setFormData] = useState({
    ticker: 'AAPL',
    spot_price: 150,
    volatility: 0.25,
    risk_free_rate: 0.04,
    maturity_years: 1,
    principal: 10000,
    // Autocall
    autocall_barrier: 100,
    coupon_rate: 8.0,
    autocall_frequency: 0.25,
    barrier_level: 60,
    // Capital protégé
    protection_level: 100,
    participation_rate: 80,
    // Warrant
    strike_price: 160,
    warrant_type: 'call',
    leverage: 5,
  })
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMarketData, setLoadingMarketData] = useState(false)
  const [error, setError] = useState(null)
  const [scenario, setScenario] = useState('base')

  // États pour Mes Simulations
  const [simulations, setSimulations] = useState([])
  const [loadingSimulations, setLoadingSimulations] = useState(false)
  
  // États pour le Leaderboard
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [leaderboardFilter, setLeaderboardFilter] = useState({
    product: null,
    metric: 'max_gain'
  })

  // États pour Product Builder
  const [builderObjectives, setBuilderObjectives] = useState({
    ticker: 'AAPL',
    principal: 10000,
    min_gain_pct: 15,
    max_loss_pct: 10,
    risk_tolerance: 50,
    time_horizon_years: 1,
    spot_price: 150,
    volatility: 0.25,
    risk_free_rate: 0.04,
    prefer_income: false
  })
  const [builderResults, setBuilderResults] = useState(null)
  const [loadingBuilder, setLoadingBuilder] = useState(false)
  const [loadingBuilderMarketData, setLoadingBuilderMarketData] = useState(false)

  const products = {
    autocall: {
      name: 'Autocall / Phoenix',
      description: 'Produit qui peut être remboursé automatiquement',
      color: 'blue',
      icon: '📈'
    },
    reverse_convertible: {
      name: 'Reverse Convertible',
      description: 'Obligation avec coupon élevé',
      color: 'purple',
      icon: '🔄'
    },
    capital_protected: {
      name: 'Capital Garanti',
      description: 'Protection du capital à maturité',
      color: 'green',
      icon: '🛡️'
    },
    warrant: {
      name: 'Warrant / Turbo',
      description: 'Produit à effet de levier',
      color: 'red',
      icon: '🚀'
    }
  }

  const scenarios = [
    { id: 'bullish', name: '📈 Haussier', multiplier: 1.3 },
    { id: 'base', name: '➡️ Base', multiplier: 1.0 },
    { id: 'bearish', name: '📉 Baissier', multiplier: 0.7 },
    { id: 'volatile', name: '⚡ Volatile', multiplier: 1.0, volMultiplier: 1.5 }
  ]

  useEffect(() => {
    if (activeTab === 'simulations' && !isGuest) {
      loadUserSimulations()
    }
  }, [activeTab, isGuest])

  const loadUserSimulations = async () => {
    setLoadingSimulations(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const response = await getUserSimulations(user.id)
        setSimulations(response.data?.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des simulations:', error)
      setSimulations([])
    } finally {
      setLoadingSimulations(false)
    }
  }

  const handleDeleteSimulation = async (id) => {
    if (!confirm('Supprimer cette simulation ?')) return
    
    try {
      await deleteSimulation(id)
      setSimulations(simulations.filter(sim => sim.id !== id))
    } catch (error) {
      console.error('Erreur de suppression:', error)
      alert('Erreur lors de la suppression de la simulation')
    }
  }

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true)
    try {
      const response = await getLeaderboard(
        leaderboardFilter.product, 
        leaderboardFilter.metric, 
        50
      )
      setLeaderboard(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement du leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard()
    }
  }, [activeTab, leaderboardFilter])

  useEffect(() => {
    if (productFromUrl && products[productFromUrl]) {
      setSelectedProduct(productFromUrl)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [productFromUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: parseFloat(value) || value })
  }

  const handleFetchMarketData = async () => {
    setLoadingMarketData(true)
    setError(null)
    
    try {
      const data = await getQuickPricingData(formData.ticker)
      setFormData({
        ...formData,
        spot_price: data.current_price,
        volatility: data.volatility
      })
      alert(`✅ Données récupérées pour ${data.name}`)
    } catch (err) {
      setError('Impossible de récupérer les données du marché')
    } finally {
      setLoadingMarketData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await priceProduct(selectedProduct, formData)
      setResult(response.data)
    } catch (err) {
      console.error('Pricing error:', err)
      setError(err.response?.data?.detail || err.message || 'Erreur lors du calcul')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSimulation = async () => {
    if (!result) {
      alert('Veuillez d\'abord calculer le prix')
      return
    }

    if (isGuest) {
      alert('⚠️ Mode invité : Créez un compte pour sauvegarder')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await saveSimulation({
        user_id: user.id,
        product_type: selectedProduct,
        ticker: formData.ticker,
        parameters: formData,
        results: result
      })

      alert('✅ Simulation sauvegardée !')
      if (activeTab === 'simulations') {
        loadUserSimulations()
      }
    } catch (error) {
      alert('Erreur : ' + error.message)
    }
  }

  // Product Builder handlers
  const handleBuilderChange = (e) => {
    const { name, value, type, checked } = e.target
    setBuilderObjectives({
      ...builderObjectives,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || value
    })
  }

  const handleFetchBuilderMarketData = async () => {
    setLoadingBuilderMarketData(true)
    setError(null)
    
    try {
      const data = await getQuickPricingData(builderObjectives.ticker)
      setBuilderObjectives({
        ...builderObjectives,
        spot_price: data.current_price,
        volatility: data.volatility
      })
      alert(`✅ Données récupérées pour ${data.name}`)
    } catch (err) {
      setError('Impossible de récupérer les données du marché')
    } finally {
      setLoadingBuilderMarketData(false)
    }
  }

  const handleBuilderSubmit = async (e) => {
    e.preventDefault()
    setLoadingBuilder(true)
    setError(null)
    
    try {
      const response = await buildProducts(builderObjectives)
      setBuilderResults(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la construction')
    } finally {
      setLoadingBuilder(false)
    }
  }

  const handleSelectBuiltProduct = (product) => {
    // Remplir le formulaire avec les paramètres du produit
    setFormData({
      ...formData,
      ...product.parameters
    })
    setSelectedProduct(product.product_type)
    setActiveTab('simulator')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-400'
    if (risk < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRiskLabel = (risk) => {
    if (risk < 30) return 'Faible'
    if (risk < 60) return 'Modéré'
    return 'Élevé'
  }

  const generatePayoffData = () => {
    if (!result) return []
    
    const spots = []
    const S0 = formData.spot_price
    const principal = formData.principal
    
    for (let i = 0.5; i <= 1.5; i += 0.05) {
      const S = S0 * i
      let payoff = 0
      
      switch(selectedProduct) {
        case 'autocall':
          if (S >= S0 * (formData.autocall_barrier / 100)) {
            payoff = principal + (principal * formData.coupon_rate / 100)
          } else if (S < S0 * (formData.barrier_level / 100)) {
            payoff = principal * (S / S0)
          } else {
            payoff = principal
          }
          break
        case 'reverse_convertible':
          const coupon = principal * (formData.coupon_rate / 100)
          if (S >= S0 * (formData.barrier_level / 100)) {
            payoff = principal + coupon
          } else {
            payoff = principal * (S / S0) + coupon
          }
          break
        case 'capital_protected':
          const participation = (formData.participation_rate / 100)
          payoff = principal + Math.max(0, (S - S0) / S0 * principal * participation)
          break
        case 'warrant':
          const intrinsic = Math.max(0, formData.warrant_type === 'call' ? S - formData.strike_price : formData.strike_price - S)
          payoff = intrinsic * formData.leverage * 100
          break
      }
      
      spots.push({
        spot: S,
        payoff: payoff,
        profit: payoff - principal
      })
    }
    
    return spots
  }

  const generateScenarioData = () => {
    const scenarioConfig = scenarios.find(s => s.id === scenario)
    const data = []
    const S0 = formData.spot_price
    const days = 252
    const dt = formData.maturity_years / days
    const drift = formData.risk_free_rate * scenarioConfig.multiplier
    const vol = formData.volatility * (scenarioConfig.volMultiplier || 1)
    
    let price = S0
    
    for (let i = 0; i <= days; i++) {
      const randomShock = (Math.random() - 0.5) * 2
      const dS = price * (drift * dt + vol * Math.sqrt(dt) * randomShock)
      price = Math.max(1, price + dS)
      
      data.push({
        day: i,
        price: price,
        barrier: S0 * (formData.barrier_level / 100),
        autocallBarrier: S0 * (formData.autocall_barrier / 100)
      })
    }
    
    return data
  }

  const payoffData = generatePayoffData()
  const scenarioData = generateScenarioData()

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Simulateur de Produits Structurés</span>
          </h1>
          <p className="text-gray-400 text-lg">
            <Tooltip content="Modèle mathématique permettant de calculer le prix théorique d'options et de produits dérivés en fonction de la volatilité et du temps">
              Pricing Black-Scholes
            </Tooltip>
            {' '}et{' '}
            <Tooltip content="Méthode de simulation statistique qui génère des milliers de scénarios aléatoires pour estimer la valeur d'un produit financier complexe">
              Monte Carlo
            </Tooltip>
            {' '}en temps réel
          </p>
        </div>

        {/* Onglets */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            ⚡ Simulateur
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'builder'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            🏗️ Product Builder
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'simulations'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            📊 Mes Simulations {!isGuest && simulations.length > 0 && `(${simulations.length})`}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            🏆 Classement
          </button>
        </div>

        {/* Onglet Product Builder */}
        {activeTab === 'builder' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire Objectifs */}
            <div className="glass-card p-8 border border-metron-purple/30">
              <h2 className="text-2xl font-bold text-white mb-6">🎯 Vos Objectifs</h2>
              
              <form onSubmit={handleBuilderSubmit} className="space-y-5">
                {/* Données de marché */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3 text-sm">📊 Action sous-jacente</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Symbole boursier de l'action (ex: AAPL pour Apple, MSFT pour Microsoft)">
                          Ticker
                        </Tooltip>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="ticker"
                          value={builderObjectives.ticker}
                          onChange={handleBuilderChange}
                          className="input-futuristic flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleFetchBuilderMarketData}
                          disabled={loadingBuilderMarketData}
                          className="btn-neon px-4 py-2 text-sm"
                        >
                          {loadingBuilderMarketData ? '...' : '🔄'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Prix actuel de l'action sur le marché">
                          Prix Spot ($)
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="spot_price"
                        value={builderObjectives.spot_price}
                        onChange={handleBuilderChange}
                        className="input-futuristic w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Mesure de l'amplitude des variations du prix. Valeur typique: 0.15 à 0.40">
                          Volatilité (σ)
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="volatility"
                        value={builderObjectives.volatility}
                        onChange={handleBuilderChange}
                        className="input-futuristic w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Objectifs financiers */}
                <div className="bg-metron-purple/10 p-4 rounded-lg border border-metron-purple/30">
                  <h3 className="font-semibold text-white mb-3 text-sm">💰 Objectifs Financiers</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Montant que vous souhaitez investir">
                          Capital à investir ($)
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        name="principal"
                        value={builderObjectives.principal}
                        onChange={handleBuilderChange}
                        className="input-futuristic w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Gain minimum que vous souhaitez réaliser">
                          Gain minimum souhaité (%)
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="min_gain_pct"
                        value={builderObjectives.min_gain_pct}
                        onChange={handleBuilderChange}
                        className="input-futuristic w-full"
                      />
                      <p className="text-xs text-green-400 mt-1">
                        Cible: +${(builderObjectives.principal * builderObjectives.min_gain_pct / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Perte maximum que vous êtes prêt à accepter">
                          Perte maximum acceptable (%)
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="max_loss_pct"
                        value={builderObjectives.max_loss_pct}
                        onChange={handleBuilderChange}
                        className="input-futuristic w-full"
                      />
                      <p className="text-xs text-red-400 mt-1">
                        Max: -${(builderObjectives.principal * builderObjectives.max_loss_pct / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="Durée pendant laquelle vous souhaitez investir">
                          Horizon d'investissement (années)
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="time_horizon_years"
                        value={builderObjectives.time_horizon_years}
                        onChange={handleBuilderChange}
                        className="input-futuristic w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Profil de risque */}
                <div className="bg-metron-blue/10 p-4 rounded-lg border border-metron-blue/30">
                  <h3 className="font-semibold text-white mb-3 text-sm">⚖️ Profil de Risque</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content="De 0 (très conservateur) à 100 (très agressif)">
                          Tolérance au risque: {builderObjectives.risk_tolerance}/100
                        </Tooltip>
                      </label>
                      <input
                        type="range"
                        name="risk_tolerance"
                        min="0"
                        max="100"
                        value={builderObjectives.risk_tolerance}
                        onChange={handleBuilderChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-metron-purple"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Conservateur</span>
                        <span className={getRiskColor(builderObjectives.risk_tolerance)}>
                          {getRiskLabel(builderObjectives.risk_tolerance)}
                        </span>
                        <span>Agressif</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="prefer_income"
                        name="prefer_income"
                        checked={builderObjectives.prefer_income}
                        onChange={handleBuilderChange}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-metron-purple focus:ring-metron-purple"
                      />
                      <label htmlFor="prefer_income" className="text-sm text-gray-300 cursor-pointer">
                        <Tooltip content="Privilégier les produits avec coupons réguliers">
                          Je préfère des revenus réguliers (coupons)
                        </Tooltip>
                      </label>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loadingBuilder} className="btn-neon w-full">
                  {loadingBuilder ? '⏳ Construction en cours...' : '🏗️ Construire mes produits'}
                </button>
              </form>
            </div>

            {/* Résultats */}
            {builderResults ? (
              <div className="space-y-6">
                {/* Résumé */}
                <div className="glass-card p-6 border border-metron-blue/30">
                  <h2 className="text-xl font-bold text-white mb-4">📋 Récapitulatif de vos critères</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Capital</p>
                      <p className="text-white font-semibold">{builderResults.objectives_summary.capital}$</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Horizon</p>
                      <p className="text-white font-semibold">{builderResults.objectives_summary.horizon}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Gain min</p>
                      <p className="text-green-400 font-semibold">{builderResults.objectives_summary.gain_minimum}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Perte max</p>
                      <p className="text-red-400 font-semibold">{builderResults.objectives_summary.perte_maximum}</p>
                    </div>
                  </div>
                </div>

                {/* Produits proposés */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">🎁 Produits proposés ({builderResults.proposed_products.length})</h2>
                  
                  {builderResults.proposed_products.map((product, index) => (
                    <div key={index} className="glass-card p-6 border border-metron-purple/30 card-hover">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{product.icon}</div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{product.product_name}</h3>
                            <p className="text-sm text-gray-400">{product.description}</p>
                          </div>
                        </div>
                        <div className="text-center bg-metron-purple/20 px-4 py-2 rounded-lg border border-metron-purple/50">
                          <div className="text-3xl font-bold text-metron-purple">{product.match_score}</div>
                          <div className="text-xs text-gray-400">Score de match</div>
                        </div>
                      </div>

                      {/* Résultats attendus */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Gain Max</p>
                          <p className="text-sm font-bold text-green-400">
                            +${product.expected_results.max_gain?.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Perte Max</p>
                          <p className="text-sm font-bold text-red-400">
                            -${product.expected_results.max_loss?.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Risque</p>
                          <p className={`text-sm font-bold ${getRiskColor(product.expected_results.risk_level)}`}>
                            {product.expected_results.risk_level}%
                          </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Prob. Profit</p>
                          <p className="text-sm font-bold text-blue-400">
                            {product.expected_results.probability_profit?.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Avantages & Inconvénients */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-green-400 mb-2">✅ Avantages</p>
                          <ul className="space-y-1">
                            {product.pros.map((pro, i) => (
                              <li key={i} className="text-xs text-gray-300">• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-400 mb-2">⚠️ Inconvénients</p>
                          <ul className="space-y-1">
                            {product.cons.map((con, i) => (
                              <li key={i} className="text-xs text-gray-300">• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => handleSelectBuiltProduct(product)}
                        className="w-full btn-neon py-3"
                      >
                        📊 Simuler ce produit →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <p className="text-gray-400 text-lg">
                    Définissez vos objectifs et cliquez sur "Construire"
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    L'algorithme vous proposera les produits les plus adaptés
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Simulateur */}
        {activeTab === 'simulator' && (
          <>
            {/* Sélection du produit */}
            <div className="glass-card p-6 mb-8 border border-metron-purple/30">
              <h2 className="text-2xl font-bold text-white mb-4">Choisir un produit</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(products).map(([key, product]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedProduct(key)
                      setResult(null)
                      setError(null)
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedProduct === key
                        ? 'border-metron-purple bg-metron-purple/20'
                        : 'border-white/10 hover:border-metron-purple/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{product.icon}</div>
                    <h3 className="font-bold text-white mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400">{product.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulaire */}
              <div className="glass-card p-8 border border-metron-purple/30">
                <h2 className="text-2xl font-bold text-white mb-6">⚙️ Paramètres</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3 text-sm">📊 Données de marché</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Tooltip content="Symbole boursier de l'action (ex: AAPL pour Apple, MSFT pour Microsoft)">
                            Ticker
                          </Tooltip>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="ticker"
                            value={formData.ticker}
                            onChange={handleChange}
                            className="input-futuristic flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleFetchMarketData}
                            disabled={loadingMarketData}
                            className="btn-neon px-4 py-2 text-sm"
                          >
                            {loadingMarketData ? '...' : '🔄'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Tooltip content="Prix actuel de l'action sur le marché. C'est le point de départ pour tous les calculs de pricing.">
                            Prix Spot ($)
                          </Tooltip>
                        </label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Tooltip content="Mesure de l'amplitude des variations du prix de l'action (σ). Plus elle est élevée, plus le risque et le potentiel de gain sont importants. Valeur typique: 0.15 à 0.40">
                            Volatilité (σ)
                          </Tooltip>
                        </label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Tooltip content="Taux d'intérêt sans risque (r), généralement basé sur les obligations d'État. Utilisé pour actualiser les flux futurs. Valeur actuelle: ~4%">
                            Taux sans risque (r)
                          </Tooltip>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="risk_free_rate"
                          value={formData.risk_free_rate}
                          onChange={handleChange}
                          className="input-futuristic w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Tooltip content="Durée de vie du produit en années. Plus la maturité est longue, plus l'incertitude et la prime de temps sont élevées.">
                            Maturité (années)
                          </Tooltip>
                        </label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Tooltip content="Capital initial investi dans le produit structuré. C'est le montant que vous investissez.">
                            Principal ($)
                          </Tooltip>
                        </label>
                        <input
                          type="number"
                          name="principal"
                          value={formData.principal}
                          onChange={handleChange}
                          className="input-futuristic w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paramètres spécifiques au produit */}
                  <div className="bg-metron-purple/10 p-4 rounded-lg border border-metron-purple/30">
                    <h3 className="font-semibold text-white mb-3 text-sm">
                      {products[selectedProduct].icon} Paramètres {products[selectedProduct].name}
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedProduct === 'autocall' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Seuil de déclenchement du remboursement anticipé. Si le prix dépasse ce niveau à une date d'observation, le produit est remboursé avec le coupon. Valeur typique: 100%">
                                Barrière Autocall (%)
                              </Tooltip>
                            </label>
                            <input type="number" name="autocall_barrier" value={formData.autocall_barrier} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Rendement annuel garanti si le produit n'est pas autocallé ou si la barrière n'est pas cassée. Généralement entre 5% et 15%.">
                                Coupon (%)
                              </Tooltip>
                            </label>
                            <input type="number" step="0.1" name="coupon_rate" value={formData.coupon_rate} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Seuil de protection du capital. Si le prix final est en dessous, vous subissez la perte de l'action. Sinon, vous récupérez votre capital + coupon. Valeur typique: 60-70%">
                                Barrière de protection (%)
                              </Tooltip>
                            </label>
                            <input type="number" name="barrier_level" value={formData.barrier_level} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}

                      {selectedProduct === 'reverse_convertible' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Rendement annuel garanti versé périodiquement. Plus il est élevé, plus le risque de conversion est important. Typique: 8-15%">
                                Coupon (%)
                              </Tooltip>
                            </label>
                            <input type="number" step="0.1" name="coupon_rate" value={formData.coupon_rate} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Seuil en dessous duquel vous recevez des actions au lieu du cash à maturité. Vous encaissez alors la perte de l'action. Typique: 60-80%">
                                Barrière (%)
                              </Tooltip>
                            </label>
                            <input type="number" name="barrier_level" value={formData.barrier_level} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}

                      {selectedProduct === 'capital_protected' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Pourcentage du capital garanti à maturité. 100% = capital totalement protégé. Peut être inférieur pour augmenter la participation.">
                                Protection du capital (%)
                              </Tooltip>
                            </label>
                            <input type="number" name="protection_level" value={formData.protection_level} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Pourcentage de la hausse du sous-jacent que vous captez. 80% = vous gagnez 80% de la performance positive de l'action. Plus c'est élevé, mieux c'est.">
                                Taux de participation (%)
                              </Tooltip>
                            </label>
                            <input type="number" name="participation_rate" value={formData.participation_rate} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}

                      {selectedProduct === 'warrant' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Prix d'exercice de l'option. Pour un Call: vous gagnez si le prix dépasse le strike. Pour un Put: vous gagnez si le prix tombe sous le strike.">
                                Strike ($)
                              </Tooltip>
                            </label>
                            <input type="number" step="0.01" name="strike_price" value={formData.strike_price} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Call = parie sur la hausse | Put = parie sur la baisse">
                                Type
                              </Tooltip>
                            </label>
                            <select name="warrant_type" value={formData.warrant_type} onChange={handleChange} className="input-futuristic w-full">
                              <option value="call">Call</option>
                              <option value="put">Put</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Tooltip content="Multiplicateur de performance. Un levier de 5 signifie que pour 1% de mouvement de l'action, le warrant bouge de 5%. Amplifie les gains ET les pertes.">
                                Effet de levier
                              </Tooltip>
                            </label>
                            <input type="number" name="leverage" value={formData.leverage} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-neon w-full">
                    {loading ? '⏳ Calcul en cours...' : '🚀 Price Product'}
                  </button>
                </form>
              </div>

              {/* Résultats */}
              {result ? (
                <div className="space-y-6">
                  <div className="glass-card p-8 border border-metron-blue/30">
                    <h2 className="text-2xl font-bold text-white mb-6">📊 Résultats</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-metron-purple/20 to-metron-blue/20 p-6 rounded-xl border border-metron-purple/50 shadow-neon-purple">
                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                          <Tooltip content="Prix théorique du produit calculé par le modèle Black-Scholes et/ou Monte Carlo. C'est la valeur juste du produit selon les conditions de marché actuelles.">
                            Valeur Théorique
                          </Tooltip>
                          <InfoIcon content="Prix théorique du produit calculé par le modèle Black-Scholes et/ou Monte Carlo" />
                        </p>
                        <p className="text-4xl font-bold text-white">
                          ${result.fair_value?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{result.product}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Tooltip content="Gain maximum possible si le scénario le plus favorable se réalise (généralement forte hausse du sous-jacent)">
                              Gain Maximum
                            </Tooltip>
                            <InfoIcon content="Meilleur scénario possible" />
                          </p>
                          <p className="text-xl font-bold text-green-400">+${result.max_gain?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Tooltip content="Perte maximum possible si le pire scénario se réalise (généralement forte baisse du sous-jacent)">
                              Perte Maximum
                            </Tooltip>
                            <InfoIcon content="Pire scénario possible" />
                          </p>
                          <p className="text-xl font-bold text-red-400">-${result.max_loss?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Tooltip content="Score de risque de 0 à 100. Plus il est élevé, plus le produit est risqué. Basé sur la volatilité et les barrières.">
                              Niveau de Risque
                            </Tooltip>
                            <InfoIcon content="Score de 0 à 100" />
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div className="bg-metron-purple h-2 rounded-full" style={{width: `${result.risk_level}%`}} />
                            </div>
                            <span className="text-sm font-semibold text-white">{result.risk_level}%</span>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Tooltip content="Probabilité estimée que le produit génère un profit positif à maturité (calculée par simulations Monte Carlo)">
                              Prob. de Profit
                            </Tooltip>
                            <InfoIcon content="Probabilité de gain positif" />
                          </p>
                          <p className="text-xl font-bold text-blue-400">{result.probability_profit?.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Tooltip content="Les 'Greeks' mesurent la sensibilité du prix du produit aux différents facteurs de marché. Ce sont des outils essentiels pour gérer le risque.">
                            Greeks
                          </Tooltip>
                          <InfoIcon content="Sensibilités du produit aux facteurs de marché" />
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">
                              <Tooltip content="Sensibilité au prix du sous-jacent. Un delta de 0.5 signifie que si l'action monte de 1$, le produit gagne 0.50$. Entre 0 et 1 pour les Calls, -1 et 0 pour les Puts.">
                                Delta (Δ)
                              </Tooltip>
                            </p>
                            <p className="text-sm font-semibold text-white">{result.delta?.toFixed(4)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">
                              <Tooltip content="Taux de variation du Delta. Mesure la courbure du prix. Un gamma élevé signifie que le delta change rapidement avec le prix.">
                                Gamma (Γ)
                              </Tooltip>
                            </p>
                            <p className="text-sm font-semibold text-white">{result.gamma?.toFixed(6)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">
                              <Tooltip content="Sensibilité à la volatilité. Indique combien le produit gagne si la volatilité augmente de 1%. Vega élevé = très sensible aux variations d'incertitude du marché.">
                                Vega (ν)
                              </Tooltip>
                            </p>
                            <p className="text-sm font-semibold text-white">{result.vega?.toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">
                              <Tooltip content="Érosion temporelle. Indique combien le produit perd de valeur chaque jour qui passe (toutes choses égales par ailleurs). Généralement négatif pour les options longues.">
                                Theta (Θ)
                              </Tooltip>
                            </p>
                            <p className="text-sm font-semibold text-white">{result.theta?.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <button onClick={handleSaveSimulation} className={`w-full py-4 rounded-xl font-semibold transition-all ${isGuest ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' : 'bg-green-500/20 hover:bg-green-500 text-white border border-green-500/50'}`} disabled={isGuest}>
                        {isGuest ? '🔒 Save (Login Required)' : '💾 Save Simulation'}
                      </button>
                    </div>
                  </div>

                  {/* Graphique Payoff */}
                  <div className="glass-card p-6 border border-metron-blue/30">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Tooltip content="Représentation graphique du gain/perte en fonction du prix final du sous-jacent. Permet de visualiser le profil de risque du produit.">
                        📊 Diagramme de Payoff
                      </Tooltip>
                      <InfoIcon content="Gain/Perte selon le prix final de l'action" />
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={payoffData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="spot" stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                        <RechartsTooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} labelStyle={{color: '#fff'}} />
                        <Area type="monotone" dataKey="payoff" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Simulation de scénarios */}
                  <div className="glass-card p-6 border border-metron-blue/30">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Tooltip content="Simulation du comportement du prix de l'action selon différents scénarios de marché. Aide à comprendre comment le produit se comporte dans diverses conditions.">
                        🎲 Simulation de Scénarios
                      </Tooltip>
                      <InfoIcon content="Évolution du prix selon différents scénarios" />
                    </h2>
                    
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {scenarios.map((s) => (
                        <button key={s.id} onClick={() => setScenario(s.id)} className={`p-3 rounded-lg text-sm font-medium transition-all ${scenario === s.id ? 'bg-metron-purple text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={scenarioData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                        <RechartsTooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} />
                        <Legend />
                        <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Prix simulé" />
                        <Line type="monotone" dataKey="barrier" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Barrière protection" />
                        {selectedProduct === 'autocall' && (
                          <Line type="monotone" dataKey="autocallBarrier" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Barrière Autocall" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-8 border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-gray-400 text-lg">Configurez les paramètres et cliquez sur "Price Product"</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Onglet Mes Simulations */}
        {activeTab === 'simulations' && (
          <div>
            {isGuest ? (
              <div className="glass-card p-16 text-center border border-white/10">
                <div className="text-6xl mb-4">🔒</div>
                <p className="text-gray-400 text-xl mb-2">Fonctionnalité réservée aux membres</p>
                <p className="text-gray-500 mb-6">Créez un compte pour sauvegarder vos simulations</p>
                <a href="/login" className="inline-block btn-neon">
                  Créer un compte →
                </a>
              </div>
            ) : loadingSimulations ? (
              <div className="glass-card p-16 text-center border border-white/10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-metron-purple mb-4"></div>
                <p className="text-gray-400">Chargement des simulations...</p>
              </div>
            ) : simulations.length === 0 ? (
              <div className="glass-card p-16 text-center border border-white/10">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 text-xl mb-2">Aucune simulation pour le moment</p>
                <p className="text-gray-500 mb-6">Créez votre première simulation de pricing !</p>
                <button onClick={() => setActiveTab('simulator')} className="inline-block btn-neon">
                  Démarrer une simulation →
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {simulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="glass-card p-6 border border-metron-purple/20 card-hover"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {sim.product_type}
                        </h3>
                        <p className="text-sm text-gray-400">
                          📅 {new Date(sim.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSimulation(sim.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all border border-red-500/20 hover:border-red-500/50"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-metron-purple mb-3 text-lg">Paramètres</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Ticker :</span>
                            <span className="text-white font-semibold">{sim.ticker}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Principal :</span>
                            <span className="text-white font-semibold">${sim.parameters?.principal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Coupon :</span>
                            <span className="text-white font-semibold">{sim.parameters?.coupon_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Barrière :</span>
                            <span className="text-white font-semibold">{sim.parameters?.barrier_level}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-metron-blue mb-3 text-lg">Résultats</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Juste Valeur :</span>
                            <span className="text-white font-semibold">${sim.results?.fair_value?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Delta :</span>
                            <span className="text-white font-semibold">{sim.results?.delta?.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vega :</span>
                            <span className="text-white font-semibold">{sim.results?.vega?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Prob. de Profit :</span>
                            <span className="text-white font-semibold">{sim.results?.probability_profit?.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Classement */}
        {activeTab === 'leaderboard' && (
          <div>
            {/* Filtres */}
            <div className="glass-card p-6 mb-6 border border-metron-purple/30">
              <h2 className="text-2xl font-bold text-white mb-4">🎯 Filtres</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Filtre par produit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type de produit</label>
                  <select
                    value={leaderboardFilter.product || ''}
                    onChange={(e) => setLeaderboardFilter({
                      ...leaderboardFilter,
                      product: e.target.value || null
                    })}
                    className="input-futuristic w-full"
                  >
                    <option value="">🌐 Tous les produits</option>
                    <option value="autocall">📈 Autocall</option>
                    <option value="reverse_convertible">🔄 Reverse Convertible</option>
                    <option value="capital_protected">🛡️ Capital Garanti</option>
                    <option value="warrant">🚀 Warrant</option>
                  </select>
                </div>

                {/* Filtre par métrique */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Classement par</label>
                  <select
                    value={leaderboardFilter.metric}
                    onChange={(e) => setLeaderboardFilter({
                      ...leaderboardFilter,
                      metric: e.target.value
                    })}
                    className="input-futuristic w-full"
                  >
                    <option value="max_gain">💰 Meilleur gain potentiel</option>
                    <option value="probability_profit">📊 Meilleure probabilité de profit</option>
                    <option value="sharpe_ratio">⚖️ Meilleur ratio rendement/risque</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            {loadingLeaderboard ? (
              <div className="glass-card p-16 text-center border border-white/10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-metron-purple mb-4"></div>
                <p className="text-gray-400">Chargement du classement...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="glass-card p-16 text-center border border-white/10">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-gray-400 text-xl mb-2">Aucune simulation dans ce classement</p>
                <p className="text-gray-500">Soyez le premier à apparaître !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Podium Top 3 */}
                {leaderboard.slice(0, 3).length > 0 && (
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {/* 2ème place */}
                    {leaderboard[1] && (
                      <div className="glass-card p-6 border-2 border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-transparent order-2 md:order-1">
                        <div className="text-center mb-4">
                          <div className="text-5xl mb-2">🥈</div>
                          <div className="text-2xl font-bold text-gray-300">#2</div>
                        </div>
                        <LeaderboardCard sim={leaderboard[1]} rank={2} metric={leaderboardFilter.metric} products={products} />
                      </div>
                    )}

                    {/* 1ère place */}
                    {leaderboard[0] && (
                      <div className="glass-card p-6 border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-400/20 to-transparent shadow-neon-yellow order-1 md:order-2">
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-2">🥇</div>
                          <div className="text-3xl font-bold text-yellow-400">#1</div>
                        </div>
                        <LeaderboardCard sim={leaderboard[0]} rank={1} metric={leaderboardFilter.metric} products={products} />
                      </div>
                    )}

                    {/* 3ème place */}
                    {leaderboard[2] && (
                      <div className="glass-card p-6 border-2 border-orange-600/50 bg-gradient-to-br from-orange-600/10 to-transparent order-3">
                        <div className="text-center mb-4">
                          <div className="text-5xl mb-2">🥉</div>
                          <div className="text-2xl font-bold text-orange-400">#3</div>
                        </div>
                        <LeaderboardCard sim={leaderboard[2]} rank={3} metric={leaderboardFilter.metric} products={products} />
                      </div>
                    )}
                  </div>
                )}

                {/* Reste du classement */}
                {leaderboard.slice(3).map((sim, index) => (
                  <div key={sim.id} className="glass-card p-5 border border-white/10 card-hover">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-500 w-12 text-center">
                        #{index + 4}
                      </div>
                      <div className="flex-1">
                        <LeaderboardCard sim={sim} rank={index + 4} metric={leaderboardFilter.metric} products={products} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LeaderboardCard({ sim, rank, metric, products }) {
  const getMetricValue = () => {
    const results = sim.results || {}
    
    switch(metric) {
      case 'max_gain':
        const maxGain = results.max_gain || 0
        return maxGain > 0 ? `$${maxGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'
      
      case 'probability_profit':
        const prob = results.probability_profit || 0
        return `${prob.toFixed(1)}%`
      
      case 'sharpe_ratio':
        const gain = results.max_gain || 0
        const risk = Math.max(results.risk_level || 1, 1)
        const ratio = gain / risk
        return ratio.toFixed(2)
      
      default:
        return 'N/A'
    }
  }

  const getMetricLabel = () => {
    switch(metric) {
      case 'max_gain':
        return 'Gain Max'
      case 'probability_profit':
        return 'Prob. Profit'
      case 'sharpe_ratio':
        return 'Ratio R/R'
      default:
        return 'Métrique'
    }
  }

  const getDisplayName = () => {
    if (sim.users?.username) {
      return sim.users.username
    }
    
    const email = sim.users?.email
    if (!email) return 'Anonyme'
    
    const [username, domain] = email.split('@')
    if (!username || !domain) return 'Anonyme'
    return `${username.substring(0, 3)}***@${domain}`
  }

  return (
    <div className="relative">
      {/* Date en haut à droite */}
      <div className="absolute top-0 right-0 text-xs text-gray-500">
        📅 {new Date(sim.created_at).toLocaleDateString('fr-FR')}
      </div>
      
      {/* Contenu principal sur 3 colonnes */}
      <div className="grid md:grid-cols-3 gap-4 items-center pt-4">
        <div>
          <p className="text-xs text-gray-400">Utilisateur</p>
          <p className="text-white font-semibold">{getDisplayName()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Produit / Ticker</p>
          <p className="text-white font-semibold">
            {products[sim.product_type]?.icon || '📊'} {sim.ticker}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{getMetricLabel()}</p>
          <p className="text-2xl font-bold text-metron-purple">{getMetricValue()}</p>
        </div>
      </div>
    </div>
  )
}