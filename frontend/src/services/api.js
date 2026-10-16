/**
 * Northgate AI Stock Predictor - Frontend API Client
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Stock data
  getQuote: (ticker) => apiClient.get(`/stocks/quote/${ticker}`).then(res => res.data),
  getHistory: (ticker, period = '1y') => apiClient.get(`/stocks/history/${ticker}?period=${period}`).then(res => res.data),
  getTechnicals: (ticker) => apiClient.get(`/stocks/technicals/${ticker}`).then(res => res.data),
  getWatchlist: () => apiClient.get('/stocks/watchlist').then(res => res.data),

  // AI Prediction
  getPredictions: (ticker, horizon = 14) => apiClient.get(`/predict/${ticker}?horizon=${horizon}`).then(res => res.data),

  // Sentiment Analysis
  getSentiment: (ticker) => apiClient.get(`/sentiment/${ticker}`).then(res => res.data),

  // Recommendations
  getRecommendation: (ticker) => apiClient.get(`/recommendations/${ticker}`).then(res => res.data),

  // Portfolio Optimization
  optimizePortfolio: (data) => apiClient.post('/portfolio/optimize', data).then(res => res.data),

  // Health
  checkHealth: () => axios.get('http://127.0.0.1:8000/health').then(res => res.data),
};

export default api;
