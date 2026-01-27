import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { priceProduct, saveSimulation, getQuickPricingData } from '../services/api'
import { supabase } from '../services/supabase'
import Tooltip, { InfoIcon } from '../components/Tooltip'
import { getDefinition } from '../utils/definitions'

export default function Simulation({ isGuest }) {
  const [searchParams] = useSearchParams()
  const productFromUrl = searchParams.get('product')
  
  const [selectedProduct, setSelectedProduct] = useState(productFromUrl || 'autocall')
  const [formData, setFormData] = useState({
    ticker: 'AAPL',
    spot_price: 150,
    volatility: 0.25,
    risk_free_rate: 0.04,
    maturity_years: 1,
    principal: 10000,
    autocall_barrier: 100,
    coupon_rate: 8.0,
    autocall_frequency: 0.25,
    barrier_level: 60,
    protection_level: 100,
    participation_rate: 80,
    strike_price: 160,
    warrant_type: 'call',
    leverage: 5,
  })
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMarketData, setLoadingMarketData] = useState(false)
  const [error, setError] = useState(null)
  const [scenario, setScenario] = useState('base')

  const products = {
    autocall: { name: 'Autocall / Phoenix', description: 'Produit qui peut être remboursé automatiquement', color: 'blue', icon: '📈' },
    reverse_convertible: { name: 'Reverse Convertible', description: 'Obligation avec coupon élevé', color: 'purple', icon: '🔄' },
    capital_protected: { name: 'Capital Garanti', description: 'Protection du capital à maturité', color: 'green', icon: '🛡️' },
    warrant: { name: 'Warrant / Turbo', description: 'Produit à effet de levier', color: 'red', icon: '🚀' }
  }

  const scenarios = [
    { id: 'bullish', name: '📈 Haussier', multiplier: 1.3 },
    { id: 'base', name: '➡️ Base', multiplier: 1.0 },
    { id: 'bearish', name: '📉 Baissier', multiplier: 0.7 },
    { id: 'volatile', name: '⚡ Volatile', multiplier: 1.0, volMultiplier: 1.5 }
  ]

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
      setFormData({ ...formData, spot_price: data.current_price, volatility: data.volatility })
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
      setError(err.response?.data?.detail || err.message || 'Erreur lors du calcul')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSimulation = async () => {
    if (!result) return alert('Veuillez d\'abord calculer le prix')
    if (isGuest) return alert('⚠️ Mode invité : Créez un compte pour sauvegarder')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await saveSimulation({ user_id: user.id, product_type: selectedProduct, ticker: formData.ticker, parameters: formData, results: result })
      alert('✅ Simulation sauvegardée !')
    } catch (error) {
      alert('Erreur : ' + error.message)
    }
  }

  const generatePayoffData = () => {
    if (!result) return []
    const spots = [], S0 = formData.spot_price, principal = formData.principal
    for (let i = 0.5; i <= 1.5; i += 0.05) {
      const S = S0 * i
      let payoff = 0
      switch(selectedProduct) {
        case 'autocall':
          payoff = S >= S0 * (formData.autocall_barrier / 100) ? principal + (principal * formData.coupon_rate / 100) :
                   S < S0 * (formData.barrier_level / 100) ? principal * (S / S0) : principal
          break
        case 'reverse_convertible':
          const coupon = principal * (formData.coupon_rate / 100)
          payoff = S >= S0 * (formData.barrier_level / 100) ? principal + coupon : principal * (S / S0) + coupon
          break
        case 'capital_protected':
          payoff = principal + Math.max(0, (S - S0) / S0 * principal * (formData.participation_rate / 100))
          break
        case 'warrant':
          const intrinsic = Math.max(0, formData.warrant_type === 'call' ? S - formData.strike_price : formData.strike_price - S)
          payoff = intrinsic * formData.leverage * 100
          break
      }
      spots.push({ spot: S, payoff: payoff, profit: payoff - principal })
    }
    return spots
  }

  const generateScenarioData = () => {
    const scenarioConfig = scenarios.find(s => s.id === scenario)
    const data = [], S0 = formData.spot_price, days = 252, dt = formData.maturity_years / days
    const drift = formData.risk_free_rate * scenarioConfig.multiplier, vol = formData.volatility * (scenarioConfig.volMultiplier || 1)
    let price = S0
    for (let i = 0; i <= days; i++) {
      const dS = price * (drift * dt + vol * Math.sqrt(dt) * ((Math.random() - 0.5) * 2))
      price = Math.max(1, price + dS)
      data.push({ day: i, price: price, barrier: S0 * (formData.barrier_level / 100), autocallBarrier: S0 * (formData.autocall_barrier / 100) })
    }
    return data
  }

  const payoffData = generatePayoffData()
  const scenarioData = generateScenarioData()

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3"><span className="gradient-text">Simulateur de Produits Structurés</span></h1>
          <p className="text-gray-400 text-lg">Pricing Black-Scholes et Monte Carlo en temps réel</p>
        </div>

        <div className="glass-card p-6 mb-8 border border-metron-purple/30">
          <h2 className="text-2xl font-bold text-white mb-4">Choisir un produit</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(products).map(([key, product]) => (
              <button key={key} onClick={() => { setSelectedProduct(key); setResult(null); setError(null) }}
                className={`p-4 rounded-lg border-2 transition-all relative ${selectedProduct === key ? 'border-metron-purple bg-metron-purple/20' : 'border-white/10 hover:border-metron-purple/50'}`}>
                <div className="absolute top-2 right-2"><InfoIcon content={getDefinition(`product_${key}`)} /></div>
                <div className="text-3xl mb-2">{product.icon}</div>
                <h3 className="font-bold text-white mb-1">{product.name}</h3>
                <p className="text-xs text-gray-400">{product.description}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6"><p className="text-red-300">❌ {error}</p></div>}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 border border-metron-purple/30">
            <h2 className="text-2xl font-bold text-white mb-6">⚙️ Paramètres</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-3 text-sm">📊 Données de marché</h3>
                <div className="space-y-3">
                  {[
                    {label: 'Ticker', name: 'ticker', type: 'text', def: 'ticker'},
                    {label: 'Prix Spot ($)', name: 'spot_price', type: 'number', step: '0.01', def: 'spot_price'},
                    {label: 'Volatilité (σ)', name: 'volatility', type: 'number', step: '0.01', def: 'volatility'},
                    {label: 'Taux sans risque (r)', name: 'risk_free_rate', type: 'number', step: '0.01', def: 'risk_free_rate'},
                    {label: 'Maturité (années)', name: 'maturity_years', type: 'number', step: '0.1', def: 'maturity'},
                    {label: 'Principal ($)', name: 'principal', type: 'number', def: 'principal'}
                  ].map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Tooltip content={getDefinition(field.def)}>{field.label}</Tooltip>
                      </label>
                      {field.name === 'ticker' ? (
                        <div className="flex gap-2">
                          <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} className="input-futuristic flex-1" />
                          <button type="button" onClick={handleFetchMarketData} disabled={loadingMarketData} className="btn-neon px-4 py-2 text-sm" title="Récupérer données en temps réel">
                            {loadingMarketData ? '...' : '🔄'}
                          </button>
                        </div>
                      ) : (
                        <input type={field.type} step={field.step} name={field.name} value={formData[field.name]} onChange={handleChange} className="input-futuristic w-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-metron-purple/10 p-4 rounded-lg border border-metron-purple/30">
                <h3 className="font-semibold text-white mb-3 text-sm">{products[selectedProduct].icon} Paramètres {products[selectedProduct].name}</h3>
                <div className="space-y-3">
                  {selectedProduct === 'autocall' && ['autocall_barrier', 'coupon_rate', 'barrier_level'].map(f => (
                    <div key={f}><label className="block text-sm font-medium text-gray-300 mb-2"><Tooltip content={getDefinition(f)}>{f === 'autocall_barrier' ? 'Barrière Autocall (%)' : f === 'coupon_rate' ? 'Coupon (%)' : 'Barrière de protection (%)'}</Tooltip></label>
                    <input type="number" step={f === 'coupon_rate' ? '0.1' : undefined} name={f} value={formData[f]} onChange={handleChange} className="input-futuristic w-full" /></div>
                  ))}
                  {selectedProduct === 'reverse_convertible' && ['coupon_rate', 'barrier_level'].map(f => (
                    <div key={f}><label className="block text-sm font-medium text-gray-300 mb-2"><Tooltip content={getDefinition(f === 'barrier_level' ? 'reverse_convertible_barrier' : f)}>{f === 'coupon_rate' ? 'Coupon (%)' : 'Barrière (%)'}</Tooltip></label>
                    <input type="number" step={f === 'coupon_rate' ? '0.1' : undefined} name={f} value={formData[f]} onChange={handleChange} className="input-futuristic w-full" /></div>
                  ))}
                  {selectedProduct === 'capital_protected' && ['protection_level', 'participation_rate'].map(f => (
                    <div key={f}><label className="block text-sm font-medium text-gray-300 mb-2"><Tooltip content={getDefinition(f)}>{f === 'protection_level' ? 'Protection du capital (%)' : 'Taux de participation (%)'}</Tooltip></label>
                    <input type="number" name={f} value={formData[f]} onChange={handleChange} className="input-futuristic w-full" /></div>
                  ))}
                  {selectedProduct === 'warrant' && (<>
                    <div><label className="block text-sm font-medium text-gray-300 mb-2"><Tooltip content={getDefinition('strike_price')}>Strike ($)</Tooltip></label>
                    <input type="number" step="0.01" name="strike_price" value={formData.strike_price} onChange={handleChange} className="input-futuristic w-full" /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-2"><Tooltip content={getDefinition('warrant_type')}>Type</Tooltip></label>
                    <select name="warrant_type" value={formData.warrant_type} onChange={handleChange} className="input-futuristic w-full"><option value="call">Call</option><option value="put">Put</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-2"><Tooltip content={getDefinition('leverage')}>Effet de levier</Tooltip></label>
                    <input type="number" name="leverage" value={formData.leverage} onChange={handleChange} className="input-futuristic w-full" /></div>
                  </>)}
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-neon w-full">{loading ? '⏳ Calcul en cours...' : '🚀 Price Product'}</button>
            </form>
          </div>

          {result ? (
            <div className="space-y-6">
              <div className="glass-card p-8 border border-metron-blue/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📊 Résultats</h2>
                  <InfoIcon content="Résultats du pricing via Black-Scholes ou Monte Carlo" />
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-metron-purple/20 to-metron-blue/20 p-6 rounded-xl border border-metron-purple/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-400">Valeur Théorique</p>
                      <InfoIcon content={getDefinition('fair_value')} />
                    </div>
                    <p className="text-4xl font-bold text-white">${result.fair_value?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    <p className="text-xs text-gray-500 mt-2">{result.product}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {label: 'Gain Maximum', value: result.max_gain, color: 'green', def: 'max_gain', sign: '+'},
                      {label: 'Perte Maximum', value: result.max_loss, color: 'red', def: 'max_loss', sign: '-'},
                      {label: 'Niveau de Risque', value: result.risk_level, def: 'risk_level', isBar: true},
                      {label: 'Prob. de Profit', value: result.probability_profit, color: 'blue', def: 'probability_profit', suffix: '%'}
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <InfoIcon content={getDefinition(item.def)} />
                        </div>
                        {item.isBar ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div className="bg-metron-purple h-2 rounded-full" style={{width: `${item.value}%`}} />
                            </div>
                            <span className="text-sm font-semibold text-white">{item.value}%</span>
                          </div>
                        ) : (
                          <p className={`text-xl font-bold text-${item.color}-400`}>{item.sign || ''}{item.suffix ? item.value?.toFixed(1) : `$${item.value?.toFixed(2)}`}{item.suffix || ''}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-white">Greeks</h3>
                      <InfoIcon content="Sensibilités du prix aux paramètres de marché" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {label: 'Delta (Δ)', value: result.delta, decimals: 4, def: 'delta'},
                        {label: 'Gamma (Γ)', value: result.gamma, decimals: 6, def: 'gamma'},
                        {label: 'Vega (ν)', value: result.vega, decimals: 2, def: 'vega'},
                        {label: 'Theta (Θ)', value: result.theta, decimals: 2, def: 'theta'}
                      ].map((greek, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <p className="text-xs text-gray-400">{greek.label}</p>
                            <InfoIcon content={getDefinition(greek.def)} />
                          </div>
                          <p className="text-sm font-semibold text-white">{greek.value?.toFixed(greek.decimals)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSaveSimulation} className={`w-full py-4 rounded-xl font-semibold transition-all ${isGuest ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' : 'bg-green-500/20 hover:bg-green-500 text-white border border-green-500/50'}`} disabled={isGuest}>
                    {isGuest ? '🔒 Save (Login Required)' : '💾 Save Simulation'}
                  </button>
                </div>
              </div>
              <div className="glass-card p-6 border border-metron-blue/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">📊 Diagramme de Payoff</h2>
                  <InfoIcon content={getDefinition('payoff_diagram')} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={payoffData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="spot" stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                    <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${val.toFixed(0)}`} />
                    <RechartsTooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} labelStyle={{color: '#fff'}} />
                    <Area type="monotone" dataKey="payoff" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Payoff" />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-6 border border-metron-blue/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">🎲 Simulation de Scénarios</h2>
                  <InfoIcon content={getDefinition('scenario_simulation')} />
                </div>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {scenarios.map((s) => (
                    <button key={s.id} onClick={() => setScenario(s.id)} className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${scenario === s.id ? 'bg-metron-purple text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      <span>{s.name}</span>
                      <InfoIcon content={getDefinition(`scenario_${s.id}`)} />
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
                    {selectedProduct === 'autocall' && <Line type="monotone" dataKey="autocallBarrier" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Barrière Autocall" />}
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
      </div>
    </div>
  )
}