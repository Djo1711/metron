import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getStockQuote, getStockHistory } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export default function MarketData() {
  const [searchParams] = useSearchParams()
  const [ticker, setTicker] = useState('')
  const [stockData, setStockData] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('1mo')
  
  // Nouveaux states pour l'autocomplétion
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)

  const periods = [
    { label: '1J', value: '1d' },
    { label: '5J', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1A', value: '1y' },
    { label: '5A', value: '5y' },
  ]

  const newsLinks = [
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/markets', emoji: '📰' },
    { name: 'Financial Times', url: 'https://www.ft.com/markets', emoji: '📊' },
    { name: 'Reuters Finance', url: 'https://www.reuters.com/finance', emoji: '🌐' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/', emoji: '💼' },
    { name: 'Les Échos', url: 'https://www.lesechos.fr/finance-marches', emoji: '🇫🇷' },
    { name: 'Investing.com', url: 'https://fr.investing.com/', emoji: '📈' },
  ]

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-load ticker from URL params
  useEffect(() => {
    const tickerParam = searchParams.get('ticker')
    if (tickerParam) {
      setTicker(tickerParam)
      loadStockData(tickerParam)
    }
  }, [searchParams])

  // Recherche en temps réel
  const handleInputChange = async (e) => {
    const value = e.target.value
    setTicker(value)
    
    if (value.length >= 1) {
      setSearchLoading(true)
      try {
        const response = await axios.get(`http://localhost:8000/api/market/search/${value}`)
        setSuggestions(response.data)
        setShowSuggestions(true)
      } catch (err) {
        console.error('Erreur recherche:', err)
        setSuggestions([])
      } finally {
        setSearchLoading(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Sélectionner une suggestion
  const handleSelectSuggestion = (suggestion) => {
    setTicker(suggestion.ticker)
    setShowSuggestions(false)
    loadStockData(suggestion.ticker)
  }

  // Recherche modifiée pour supporter les noms complets
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ticker.trim()) return
    
    setShowSuggestions(false)
    setLoading(true)
    setError(null)
    
    try {
      // Chercher d'abord pour trouver le bon ticker
      const searchResponse = await axios.get(`http://localhost:8000/api/market/search/${ticker}`)
      
      if (searchResponse.data && searchResponse.data.length > 0) {
        const bestMatch = searchResponse.data[0]
        setTicker(bestMatch.ticker)
        await loadStockData(bestMatch.ticker)
      } else {
        setError('Aucune action trouvée pour "' + ticker + '"')
        setStockData(null)
        setHistoryData([])
      }
    } catch (err) {
      setError('Action non trouvée ou erreur API')
      setStockData(null)
      setHistoryData([])
    } finally {
      setLoading(false)
    }
  }

  const loadStockData = async (tickerSymbol) => {
    setLoading(true)
    setError(null)
    try {
      const quoteResponse = await getStockQuote(tickerSymbol.toUpperCase())
      setStockData(quoteResponse.data)
      await loadHistory(tickerSymbol.toUpperCase(), period)
    } catch (error) {
      setError('Action non trouvée ou erreur API')
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
        date: new Date(item.Date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        price: item.Close.toFixed(2)
      }))
      setHistoryData(formattedData)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
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
            <span className="gradient-text">Données de Marché</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Cotations en temps réel et informations de marché
          </p>
        </div>

        {/* Search Box avec autocomplétion */}
        <div className="relative mb-8" ref={searchRef}>
          <div className="glass-card p-8 border border-metron-purple/30">
            <form onSubmit={handleSearch}>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={ticker}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Rechercher un ticker ou nom (AAPL, Apple...)"
                    className="input-futuristic w-full text-lg"
                    autoComplete="off"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon px-8"
                >
                  {loading ? 'Recherche...' : '🔍 Rechercher'}
                </button>
              </div>
            </form>
            
            <p className="text-xs text-gray-500">
              💡 Tapez n'importe quelle lettre pour voir les suggestions
            </p>
          </div>

          {/* Dropdown HORS du glass-card */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[9999] left-8 right-8 mt-[-3rem] bg-metron-darker border border-metron-purple/50 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 text-center text-gray-400">Recherche...</div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-metron-purple/20 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{suggestion.ticker}</p>
                        <p className="text-sm text-gray-400 truncate">{suggestion.name}</p>
                      </div>
                      <span className="text-xs text-metron-purple">{suggestion.exchange}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* News Section */}
        <div className="glass-card p-6 mb-8 border border-metron-blue/30">
          <h3 className="text-xl font-bold text-white mb-4">📰 Actualités Financières</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {newsLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 text-center hover:border-metron-purple/50 border border-white/10 transition-all card-hover">
                <div className="text-3xl mb-2">{link.emoji}</div>
                <p className="text-sm text-white font-medium">{link.name}</p>
              </a>
            ))}
          </div>
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
                  <p className="text-gray-400 text-lg">{stockData.name || 'Nom de l\'entreprise'}</p>
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
                  <p className="text-xs text-gray-400 mb-1">Capitalisation</p>
                  <p className="text-lg font-bold text-white">
                    {stockData.market_cap 
                      ? `$${(stockData.market_cap / 1e9).toFixed(2)}Mds`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Plus haut du jour</p>
                  <p className="text-lg font-bold text-white">
                    ${stockData.day_high?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Plus bas du jour</p>
                  <p className="text-lg font-bold text-white">
                    ${stockData.day_low?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart with Period Filters */}
            <div className="glass-card p-8 border border-metron-purple/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Historique des prix</h3>
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
                  Chargement du graphique...
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border border-metron-purple/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 Infos de Trading</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ouverture</span>
                    <span className="text-white font-semibold">
                      ${stockData.open?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clôture précédente</span>
                    <span className="text-white font-semibold">
                      ${stockData.previous_close?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plus haut 52 semaines</span>
                    <span className="text-white font-semibold">
                      ${stockData.fifty_two_week_high?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plus bas 52 semaines</span>
                    <span className="text-white font-semibold">
                      ${stockData.fifty_two_week_low?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 border border-metron-blue/20">
                <h3 className="text-xl font-bold text-white mb-4">💼 Infos Entreprise</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Secteur</span>
                    <span className="text-white font-semibold">
                      {stockData.sector || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Industrie</span>
                    <span className="text-white font-semibold">
                      {stockData.industry || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Devise</span>
                    <span className="text-white font-semibold">
                      {stockData.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bourse</span>
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
            <p className="text-gray-400 text-xl mb-2">Recherchez une action pour commencer</p>
            <p className="text-gray-500 text-sm mb-4">
              🇺🇸 Américaines : AAPL, MSFT, TSLA, GOOGL
            </p>
            <p className="text-gray-500 text-sm">
              🇫🇷 Françaises : MC.PA (LVMH), OR.PA (L'Oréal), AI.PA (Air Liquide), SAN.PA (Sanofi)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}