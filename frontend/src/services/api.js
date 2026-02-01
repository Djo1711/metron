import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== SUPABASE CLIENT =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// ===== MARKET DATA =====

export const getStockQuote = (ticker) => api.get(`/api/market/quote/${ticker}`)

export const getStockHistory = (ticker, period = '1mo') => 
  api.get(`/api/market/history/${ticker}`, { params: { period } })

export const getTrendingStocks = () => api.get('/api/market/trending')

export const getVolatility = (ticker, period = '1y') =>
  api.get(`/api/market/volatility/${ticker}`, { params: { period } })

export const searchStock = (query) => api.get(`/api/market/search/${query}`)

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

// ===== PRICING =====

export const priceReverseConvertible = (data) => 
  api.post('/api/pricing/reverse-convertible', data)

export const priceAutocall = (data) => 
  api.post('/api/pricing/autocall', data)

export const priceCapitalProtected = (data) => 
  api.post('/api/pricing/capital-protected', data)

export const priceWarrant = (data) => 
  api.post('/api/pricing/warrant', data)

/**
 * Router function pour appeler le bon endpoint selon le produit
 */
export const priceProduct = async (productType, params) => {
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

// ===== SIMULATIONS =====

export const saveSimulation = (data) => api.post('/api/simulations/save', data)

export const getUserSimulations = (userId) => api.get(`/api/simulations/user/${userId}`)

export const deleteSimulation = (simulationId) => api.delete(`/api/simulations/${simulationId}`)

export const getLeaderboard = (productType = null, metric = 'max_gain', limit = 50) => {
  const params = { metric, limit }
  if (productType) params.product_type = productType
  
  return api.get('/api/simulations/leaderboard', { params })
}
// ===== QUIZ SCORES (Supabase direct) =====

/**
 * Sauvegarder un score de quiz
 */
export const saveQuizScore = async (userId, level, moduleIndex, score, totalQuestions) => {
  const { data, error } = await supabase
    .from('quiz_scores')
    .insert([
      {
        user_id: userId,
        level: level,
        module_index: moduleIndex,
        score: score,
        total_questions: totalQuestions
      }
    ])
    .select()
  
  if (error) throw error
  return data
}

/**
 * Récupérer tous les scores d'un utilisateur
 */
export const getUserQuizScores = async (userId) => {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Récupérer le meilleur score pour un module spécifique
 */
export const getBestScore = async (userId, level, moduleIndex) => {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('level', level)
    .eq('module_index', moduleIndex)
    .order('score', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

// Users
export const updateUsername = (userId, username) => 
  api.put('/api/users/username', { user_id: userId, username })

export const getUserProfile = (userId) => 
  api.get(`/api/users/profile/${userId}`)

/**
 * Récupérer les scores d'un utilisateur pour un niveau donné
 */
export const getUserQuizScoresByLevel = async (userId, level) => {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('level', level)
    .order('module_index', { ascending: true })
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Mettre à jour le nombre de tentatives pour un module
 */
export const incrementQuizAttempts = async (userId, level, moduleIndex) => {
  // Récupérer le score existant
  const { data: existing } = await supabase
    .from('quiz_scores')
    .select('attempts')
    .eq('user_id', userId)
    .eq('level', level)
    .eq('module_index', moduleIndex)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()
  
  return existing ? existing.attempts + 1 : 1
}

// ===== PRODUCT BUILDER =====

export const buildProducts = async (objectives) => {
  return await api.post('/api/product-builder/build', objectives)
}
export default api