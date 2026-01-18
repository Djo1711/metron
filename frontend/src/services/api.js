import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Market Data
export const getStockQuote = (ticker) => api.get(`/api/market/quote/${ticker}`)

export const getStockHistory = (ticker, period = '1mo') => 
  api.get(`/api/market/history/${ticker}`, { params: { period } })

export const getTrendingStocks = () => api.get('/api/market/trending')

// Pricing
export const priceReverseConvertible = (data) => 
  api.post('/api/pricing/reverse-convertible', data)

// Simulations
export const saveSimulation = (data) => api.post('/api/simulations/save', data)

export const getUserSimulations = (userId) => api.get(`/api/simulations/user/${userId}`)

export const deleteSimulation = (simulationId) => api.delete(`/api/simulations/${simulationId}`)

export default api
/**
 * Price Autocall / Phoenix
 */
export const priceAutocall = (data) => 
  api.post('/api/pricing/autocall', data)

/**
 * Price Capital Protected Product
 */
export const priceCapitalProtected = (data) => 
  api.post('/api/pricing/capital-protected', data)

/**
 * Price Warrant / Turbo
 */
export const priceWarrant = (data) => 
  api.post('/api/pricing/warrant', data)

/**
 * Router function pour appeler le bon endpoint selon le produit
 * UTILE pour la page Simulation avec menu déroulant
 */
export const priceProduct = async (productType, params) => {
  // Adapter les paramètres selon le produit
  const payload = {
    ticker: params.ticker,
    spot_price: params.spot_price,
    volatility: params.volatility,
    risk_free_rate: params.risk_free_rate,
    maturity_years: params.maturity_years,
  }

  switch (productType) {
    case 'autocall':
      return await api.post('/api/pricing/autocall', {
        ...payload,
        principal: params.principal || 10000,
        autocall_barrier: params.autocall_barrier,
        coupon_rate: params.coupon_rate,
        barrier_level: params.barrier_level,
        autocall_frequency: params.autocall_frequency || 0.25,
      })
    
    case 'reverse_convertible':
      return await api.post('/api/pricing/reverse-convertible', {
        ...payload,
        principal: params.principal || 10000,
        coupon_rate: params.coupon_rate,
        barrier_level: params.barrier_level,
      })
    
    case 'capital_protected':
      return await api.post('/api/pricing/capital-protected', {
        ...payload,
        principal: params.principal || 10000,
        protection_level: params.protection_level,
        participation_rate: params.participation_rate,
      })
    
    case 'warrant':
      return await api.post('/api/pricing/warrant', {
        ...payload,
        strike_price: params.strike_price,
        warrant_type: params.warrant_type || 'call',
        leverage: params.leverage || 5,
      })
    
    default:
      throw new Error(`Unknown product type: ${productType}`)
  }
}

// ===== MARKET DATA - Compléter avec volatilité =====

/**
 * Get volatility (tu as déjà l'endpoint backend)
 * Mais ajoute cette fonction pour l'utiliser facilement
 */
export const getVolatility = (ticker, period = '1y') =>
  api.get(`/api/market/volatility/${ticker}`, { params: { period } })

/**
 * Get quick data (prix + volatilité en un appel)
 * UTILE pour auto-remplir le formulaire
 */
export const getQuickPricingData = async (ticker) => {
  try {
    const [quoteRes, volRes] = await Promise.all([
      getStockQuote(ticker),
      getVolatility(ticker, '1y')
    ])
    
    return {
      ticker: ticker.toUpperCase(),
      name: quoteRes.data.name,
      current_price: quoteRes.data.current_price,
      volatility: volRes.data.annualized_volatility,
      currency: quoteRes.data.currency
    }
  } catch (error) {
    console.error('Error fetching quick data:', error)
    throw error
  }
}
// Ajoute cette fonction
export const searchStock = async (query) => {
  return axios.get(`${API_URL}/api/search/search`, {
    params: { query }
  })
}