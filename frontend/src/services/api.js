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
export const getStockHistory = (ticker, period = '1y') => 
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