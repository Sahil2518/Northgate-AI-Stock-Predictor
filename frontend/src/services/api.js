/**
 * Northgate AI Stock Predictor - Production Frontend API Client
 * Dynamically resolves API base paths for both local development and containerized production environments.
 */
import axios from 'axios';

// In local Vite dev (port 5173), direct requests to the FastAPI backend port 8000.
// In production (Docker/Nginx/Cloud), use the relative reverse proxy path /api/v1.
const isDev = typeof window !== 'undefined' && window.location.port === '5173';
const DEFAULT_BASE = isDev ? 'http://127.0.0.1:8000/api/v1' : '/api/v1';
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_BASE;
const HEALTH_URL = API_BASE.includes('/api/v1') 
  ? API_BASE.replace('/api/v1', '/health') 
  : `${API_BASE}/health`;

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Bearer token into outgoing requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('northgate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // User Authentication & Multi-Tenant Sessions
  login: (data) => apiClient.post('/auth/login', data).then(res => {
    if (res.data?.access_token) localStorage.setItem('northgate_token', res.data.access_token);
    return res.data;
  }),
  register: (data) => apiClient.post('/auth/register', data).then(res => {
    if (res.data?.access_token) localStorage.setItem('northgate_token', res.data.access_token);
    return res.data;
  }),
  loginDemo: () => apiClient.post('/auth/demo').then(res => {
    if (res.data?.access_token) localStorage.setItem('northgate_token', res.data.access_token);
    return res.data;
  }),
  getMe: () => apiClient.get('/auth/me').then(res => res.data),
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('northgate_token');
  },
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('northgate_token') : null,

  // Real-time market quotes and historical technical bars
  getQuote: (ticker) => apiClient.get(`/stocks/quote/${ticker}`).then(res => res.data),
  getHistory: (ticker, period = '1y') => apiClient.get(`/stocks/history/${ticker}?period=${period}`).then(res => res.data),
  getTechnicals: (ticker) => apiClient.get(`/stocks/technicals/${ticker}`).then(res => res.data),
  getWatchlist: () => apiClient.get('/stocks/watchlist').then(res => res.data),

  // Multi-model AI price forecasting (PyTorch LSTM + XGBoost + Sentiment)
  getPredictions: (ticker, horizon = 14) => apiClient.get(`/predict/${ticker}?horizon=${horizon}`).then(res => res.data),

  // PRD Benchmark & Quant Lab Endpoints
  getModelBenchmark: (ticker) => apiClient.get(`/predict/benchmark/${ticker}`).then(res => res.data),
  getSentimentAblation: (ticker) => apiClient.get(`/predict/sentiment-impact/${ticker}`).then(res => res.data),
  getRebalancingPlan: (data) => apiClient.post('/portfolio/rebalance', data).then(res => res.data),
  getDataQualityReport: () => apiClient.get('/quant/data-quality-report').then(res => res.data),
  getMathVerification: () => apiClient.get('/quant/math-verify').then(res => res.data),

  // Real-time financial news sentiment analysis
  getSentiment: (ticker) => apiClient.get(`/sentiment/${ticker}`).then(res => res.data),

  // Intelligent Buy/Hold/Sell multi-factor recommendations
  getRecommendation: (ticker) => apiClient.get(`/recommendations/${ticker}`).then(res => res.data),

  // Markowitz Modern Portfolio Theory optimization
  optimizePortfolio: (data) => apiClient.post('/portfolio/optimize', data).then(res => res.data),

  // Historical Crisis Stress Testing
  stressTestPortfolio: (data) => apiClient.post('/portfolio/stress-test', data).then(res => res.data),

  // Paper Trading & Brokerage Execution Simulator
  getPaperAccount: () => apiClient.get('/paper-trading/account').then(res => res.data),
  executePaperOrder: (order) => apiClient.post('/paper-trading/order', order).then(res => res.data),
  resetPaperAccount: (target_balance) => {
    const url = target_balance !== undefined ? `/paper-trading/reset?target_balance=${target_balance}` : '/paper-trading/reset';
    return apiClient.post(url).then(res => res.data);
  },
  getBrokerStatus: () => apiClient.get('/paper-trading/broker-status').then(res => res.data),

  // Funding & Cashier Wallet Hub
  depositCash: (data) => apiClient.post('/paper-trading/wallet/deposit', data).then(res => res.data),
  withdrawCash: (data) => apiClient.post('/paper-trading/wallet/withdraw', data).then(res => res.data),
  getWalletTransactions: () => apiClient.get('/paper-trading/wallet/transactions').then(res => res.data),

  // System liveness and healthcheck
  checkHealth: () => axios.get(HEALTH_URL).then(res => res.data),
};

export default api;
