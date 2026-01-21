import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { priceProduct, saveSimulation, getQuickPricingData, getUserSimulations, deleteSimulation } from '../services/api'
import { supabase } from '../services/supabase'

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

  // Charger les simulations quand on passe sur l'onglet
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
        setSimulations(response.data || [])
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

  // Scroll au top et sélectionner le produit de l'URL
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
      // Recharger les simulations si on est sur cet onglet
      if (activeTab === 'simulations') {
        loadUserSimulations()
      }
    } catch (error) {
      alert('Erreur : ' + error.message)
    }
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
            Pricing Black-Scholes et Monte Carlo en temps réel
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
            onClick={() => setActiveTab('simulations')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'simulations'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            📊 Mes Simulations {!isGuest && simulations.length > 0 && `(${simulations.length})`}
          </button>
        </div>

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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Ticker</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Prix Spot ($)</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Volatilité (σ)</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Taux sans risque (r)</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Maturité (années)</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Principal ($)</label>
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Barrière Autocall (%)</label>
                            <input type="number" name="autocall_barrier" value={formData.autocall_barrier} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Coupon (%)</label>
                            <input type="number" step="0.1" name="coupon_rate" value={formData.coupon_rate} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Barrière de protection (%)</label>
                            <input type="number" name="barrier_level" value={formData.barrier_level} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}

                      {selectedProduct === 'reverse_convertible' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Coupon (%)</label>
                            <input type="number" step="0.1" name="coupon_rate" value={formData.coupon_rate} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Barrière (%)</label>
                            <input type="number" name="barrier_level" value={formData.barrier_level} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}

                      {selectedProduct === 'capital_protected' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Protection du capital (%)</label>
                            <input type="number" name="protection_level" value={formData.protection_level} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Taux de participation (%)</label>
                            <input type="number" name="participation_rate" value={formData.participation_rate} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                        </>
                      )}

                      {selectedProduct === 'warrant' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Strike ($)</label>
                            <input type="number" step="0.01" name="strike_price" value={formData.strike_price} onChange={handleChange} className="input-futuristic w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                            <select name="warrant_type" value={formData.warrant_type} onChange={handleChange} className="input-futuristic w-full">
                              <option value="call">Call</option>
                              <option value="put">Put</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Effet de levier</label>
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
                        <p className="text-sm text-gray-400 mb-1">Valeur Théorique</p>
                        <p className="text-4xl font-bold text-white">
                          ${result.fair_value?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{result.product}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Gain Maximum</p>
                          <p className="text-xl font-bold text-green-400">+${result.max_gain?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Perte Maximum</p>
                          <p className="text-xl font-bold text-red-400">-${result.max_loss?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Niveau de Risque</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div className="bg-metron-purple h-2 rounded-full" style={{width: `${result.risk_level}%`}} />
                            </div>
                            <span className="text-sm font-semibold text-white">{result.risk_level}%</span>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Prob. de Profit</p>
                          <p className="text-xl font-bold text-blue-400">{result.probability_profit?.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Greeks</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">Delta (Δ)</p>
                            <p className="text-sm font-semibold text-white">{result.delta?.toFixed(4)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">Gamma (Γ)</p>
                            <p className="text-sm font-semibold text-white">{result.gamma?.toFixed(6)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">Vega (ν)</p>
                            <p className="text-sm font-semibold text-white">{result.vega?.toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 mb-1">Theta (Θ)</p>
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
                    <h2 className="text-xl font-bold text-white mb-4">📊 Diagramme de Payoff</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={payoffData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="spot" stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} labelStyle={{color: '#fff'}} />
                        <Area type="monotone" dataKey="payoff" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Simulation de scénarios */}
                  <div className="glass-card p-6 border border-metron-blue/30">
                    <h2 className="text-xl font-bold text-white mb-4">🎲 Simulation de Scénarios</h2>
                    
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
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} />
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
      </div>
    </div>
  )
}
