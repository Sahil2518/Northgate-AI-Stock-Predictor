import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TickerBar from './components/TickerBar';
import RecommendationCard from './components/RecommendationCard';
import PredictionChart from './components/PredictionChart';
import SentimentView from './components/SentimentView';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import TechnicalView from './components/TechnicalView';
import api from './services/api';
import { 
  TrendingUp, 
  BrainCircuit, 
  PieChart, 
  Newspaper, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [currentTicker, setCurrentTicker] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  
  // Data States
  const [quote, setQuote] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionHorizon, setPredictionHorizon] = useState(14);
  const [sentiment, setSentiment] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [technicals, setTechnicals] = useState(null);
  const [history, setHistory] = useState(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isPredictLoading, setIsPredictLoading] = useState(false);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initial load: health check & watchlist
  useEffect(() => {
    const initApp = async () => {
      try {
        await api.checkHealth();
        setIsLive(true);
        const wl = await api.getWatchlist();
        setWatchlist(wl);
      } catch (err) {
        console.warn('Backend connection note:', err.message);
        setIsLive(false);
      }
    };
    initApp();
  }, []);

  // Fetch all ticker-specific data when currentTicker changes
  useEffect(() => {
    let isSubscribed = true;

    const fetchTickerData = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        // Parallel queries for fast response
        const [qRes, rRes, sRes, tRes, hRes] = await Promise.all([
          api.getQuote(currentTicker).catch(() => null),
          api.getRecommendation(currentTicker).catch(() => null),
          api.getSentiment(currentTicker).catch(() => null),
          api.getTechnicals(currentTicker).catch(() => null),
          api.getHistory(currentTicker, '1y').catch(() => null),
        ]);

        if (isSubscribed) {
          if (qRes) setQuote(qRes);
          if (rRes) setRecommendation(rRes);
          if (sRes) setSentiment(sRes);
          if (tRes) setTechnicals(tRes);
          if (hRes) setHistory(hRes);
        }
      } catch (err) {
        if (isSubscribed) {
          setErrorMsg(`Failed to synchronize intelligence for ${currentTicker}.`);
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchTickerData();
    return () => { isSubscribed = false; };
  }, [currentTicker]);

  // Fetch predictions separately or when horizon changes
  useEffect(() => {
    let isSubscribed = true;

    const fetchPrediction = async () => {
      setIsPredictLoading(true);
      try {
        const pRes = await api.getPredictions(currentTicker, predictionHorizon);
        if (isSubscribed && pRes) {
          setPrediction(pRes);
        }
      } catch (err) {
        console.error('Prediction fetch error:', err);
      } finally {
        if (isSubscribed) setIsPredictLoading(false);
      }
    };

    fetchPrediction();
    return () => { isSubscribed = false; };
  }, [currentTicker, predictionHorizon]);

  // Auto-run portfolio optimization when visiting portfolio tab the first time
  useEffect(() => {
    if (activeTab === 'portfolio' && !portfolio) {
      handleRunOptimization({
        tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'],
        investment_amount: 10000,
        risk_free_rate: 0.045,
        timeframe_years: 2
      });
    }
  }, [activeTab]);

  const handleRunOptimization = async (params) => {
    setIsPortfolioLoading(true);
    try {
      const res = await api.optimizePortfolio(params);
      setPortfolio(res);
    } catch (err) {
      console.error('Portfolio optimization error:', err);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const handleSelectTicker = (newTicker) => {
    if (newTicker !== currentTicker) {
      setCurrentTicker(newTicker);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Navbar with Brand, Ticker Search, & Navigation Tabs */}
      <Navbar
        currentTicker={currentTicker}
        onSelectTicker={handleSelectTicker}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={isLive}
      />

      {/* Live Market Ticker Ribbon */}
      <TickerBar
        watchlist={watchlist}
        currentTicker={currentTicker}
        onSelectTicker={handleSelectTicker}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setCurrentTicker(currentTicker)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Tab 1: AI Advisory Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <RecommendationCard 
              recommendation={recommendation} 
              quote={quote} 
            />

            {/* Side-by-Side Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    Forecast Preview (14-Day Horizon)
                  </h3>
                  <button 
                    onClick={() => setActiveTab('prediction')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Open Forecaster →
                  </button>
                </div>
                <PredictionChart
                  predictionData={prediction}
                  onHorizonChange={setPredictionHorizon}
                  currentHorizon={predictionHorizon}
                  isLoading={isPredictLoading}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-cyan-400" />
                    Sentiment Velocity
                  </h3>
                  <button 
                    onClick={() => setActiveTab('sentiment')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Full Sentiment Engine →
                  </button>
                </div>
                <SentimentView
                  sentimentData={sentiment}
                  ticker={currentTicker}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Price Forecaster */}
        {activeTab === 'prediction' && (
          <PredictionChart
            predictionData={prediction}
            onHorizonChange={setPredictionHorizon}
            currentHorizon={predictionHorizon}
            isLoading={isPredictLoading}
          />
        )}

        {/* Tab 3: News Sentiment */}
        {activeTab === 'sentiment' && (
          <SentimentView
            sentimentData={sentiment}
            ticker={currentTicker}
            isLoading={isLoading}
          />
        )}

        {/* Tab 4: Modern Portfolio Optimizer */}
        {activeTab === 'portfolio' && (
          <PortfolioOptimizer
            portfolioData={portfolio}
            onOptimize={handleRunOptimization}
            isLoading={isPortfolioLoading}
          />
        )}

        {/* Tab 5: Technical Engine */}
        {activeTab === 'technicals' && (
          <TechnicalView
            technicalData={technicals}
            historyData={history}
            ticker={currentTicker}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* Enterprise Platform Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="font-extrabold text-slate-300 tracking-wider">NORTHGATE AI</span>
            <span>·</span>
            <span>Machine Learning & Deep Learning Stock Prediction</span>
            <span>·</span>
            <span>Markowitz Modern Portfolio Theory</span>
          </div>
          <p className="max-w-2xl mx-auto text-[11px] text-slate-600">
            Disclaimer: Northgate AI Stock Predictor is designed for algorithmic quantitative research, educational simulations, and technical demonstration. Financial markets involve inherent volatility; past performance and deep learning forecasts do not guarantee future returns.
          </p>
          <div className="text-[10px] text-slate-600">
            Powered by PyTorch 2.14 LSTM, XGBoost 3.2, VADER NLP Sentiment, and FastAPI REST Engine.
          </div>
        </div>
      </footer>

    </div>
  );
}
