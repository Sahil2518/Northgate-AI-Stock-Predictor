import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TickerBar from './components/TickerBar';
import StockHeader from './components/StockHeader';
import RecommendationCard from './components/RecommendationCard';
import PredictionChart from './components/PredictionChart';
import SentimentView from './components/SentimentView';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import TechnicalView from './components/TechnicalView';
import PaperTradingDesk from './components/PaperTradingDesk';
import Toast from './components/Toast';
import api from './services/api';
import { 
  TrendingUp, 
  BrainCircuit, 
  PieChart, 
  Newspaper, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  Terminal,
  Cpu
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
  const [paperAccount, setPaperAccount] = useState(null);
  const [stressTest, setStressTest] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isPredictLoading, setIsPredictLoading] = useState(false);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [isPaperLoading, setIsPaperLoading] = useState(false);
  const [isStressLoading, setIsStressLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Initial load: health check, watchlist & paper account
  useEffect(() => {
    const initApp = async () => {
      try {
        await api.checkHealth();
        setIsLive(true);
        const [wl, acc] = await Promise.all([
          api.getWatchlist().catch(() => []),
          api.getPaperAccount().catch(() => null)
        ]);
        if (wl && wl.length) setWatchlist(wl);
        if (acc) setPaperAccount(acc);
      } catch (err) {
        console.warn('Backend connection note:', err.message);
        setIsLive(false);
      }
    };
    initApp();
  }, []);

  // Fetch all ticker-specific data when currentTicker changes
  const fetchTickerData = async (ticker = currentTicker) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const [qRes, rRes, sRes, tRes, hRes] = await Promise.all([
        api.getQuote(ticker).catch(() => null),
        api.getRecommendation(ticker).catch(() => null),
        api.getSentiment(ticker).catch(() => null),
        api.getTechnicals(ticker).catch(() => null),
        api.getHistory(ticker, '1y').catch(() => null),
      ]);

      if (qRes) setQuote(qRes);
      if (rRes) setRecommendation(rRes);
      if (sRes) setSentiment(sRes);
      if (tRes) setTechnicals(tRes);
      if (hRes) setHistory(hRes);
    } catch (err) {
      setErrorMsg(`Failed to synchronize intelligence feed for ${ticker}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData(currentTicker);
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
      showToast('success', `Markowitz Frontier optimized across ${params.tickers.length} assets.`);
    } catch (err) {
      showToast('error', 'Portfolio optimization solver failed.');
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const handleRunStressTest = async (tickers, amount) => {
    setIsStressLoading(true);
    try {
      const res = await api.stressTestPortfolio({
        tickers: tickers || ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'],
        investment_amount: amount || 10000
      });
      setStressTest(res);
      showToast('info', 'Crisis simulation completed: 4 shock distributions applied.');
    } catch (err) {
      showToast('error', 'Macro stress test failed.');
    } finally {
      setIsStressLoading(false);
    }
  };

  const handleExecutePaperOrder = async (order) => {
    setIsPaperLoading(true);
    try {
      const res = await api.executePaperOrder(order);
      setPaperAccount(res);
      showToast('success', `Filled Order: ${order.action} ${order.shares} ${order.ticker} at market price.`);
      return res;
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setIsPaperLoading(false);
    }
  };

  const handleResetPaperAccount = async () => {
    setIsPaperLoading(true);
    try {
      const res = await api.resetPaperAccount();
      setPaperAccount(res);
      showToast('info', 'Paper trading account reset to initial $100,000 cash.');
    } catch (err) {
      showToast('error', 'Account reset failed.');
    } finally {
      setIsPaperLoading(false);
    }
  };

  const handleOpenPaperTrade = (rec) => {
    if (rec?.ticker) {
      setCurrentTicker(rec.ticker);
    }
    setActiveTab('paper');
  };

  const handleSelectTicker = (newTicker) => {
    if (newTicker !== currentTicker) {
      setCurrentTicker(newTicker);
      showToast('info', `Switched active terminal ticker to ${newTicker}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Institutional Top Navbar */}
      <Navbar
        currentTicker={currentTicker}
        onSelectTicker={handleSelectTicker}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={isLive}
      />

      {/* Real-Time Live Feed Ribbon */}
      <TickerBar
        watchlist={watchlist}
        currentTicker={currentTicker}
        onSelectTicker={handleSelectTicker}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3.5 flex items-center justify-between text-rose-300 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => fetchTickerData(currentTicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-all font-mono"
            >
              <RefreshCw className="w-3 h-3" /> Retry Sync
            </button>
          </div>
        )}

        {/* Global Asset Header: Shown on relevant asset tabs */}
        {activeTab !== 'portfolio' && (
          <StockHeader
            quote={quote}
            currentTicker={currentTicker}
            recommendation={recommendation}
            onOpenPaperTrade={handleOpenPaperTrade}
            onRefresh={() => fetchTickerData(currentTicker)}
            isLoading={isLoading}
          />
        )}

        {/* Tab 1: Advisory Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <RecommendationCard 
              recommendation={recommendation} 
              quote={quote}
              onOpenPaperTrade={handleOpenPaperTrade}
            />

            {/* Side-by-Side Dual Intelligence Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-sans">
                    <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
                    Neural Forecasting Preview
                  </h3>
                  <button 
                    onClick={() => setActiveTab('prediction')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-mono font-semibold"
                  >
                    Expanded View →
                  </button>
                </div>
                <PredictionChart
                  predictionData={prediction}
                  onHorizonChange={setPredictionHorizon}
                  currentHorizon={predictionHorizon}
                  isLoading={isPredictLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-sans">
                    <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                    Market Media Sentiment
                  </h3>
                  <button 
                    onClick={() => setActiveTab('sentiment')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-mono font-semibold"
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
            stressTestData={stressTest}
            onRunStressTest={handleRunStressTest}
            isStressLoading={isStressLoading}
          />
        )}

        {/* Tab 5: Paper Trading Terminal */}
        {activeTab === 'paper' && (
          <PaperTradingDesk
            accountData={paperAccount}
            onExecuteOrder={handleExecutePaperOrder}
            onResetAccount={handleResetPaperAccount}
            isLoading={isPaperLoading}
            currentTicker={currentTicker}
            currentPrice={quote?.current_price}
            suggestedStopLoss={recommendation?.stop_loss_price}
            suggestedTarget={recommendation?.target_price_30d}
          />
        )}

        {/* Tab 6: Technical Engine */}
        {activeTab === 'technicals' && (
          <TechnicalView
            technicalData={technicals}
            historyData={history}
            ticker={currentTicker}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* Institutional Enterprise Footer */}
      <footer className="border-t border-[#1E273B] bg-[#080B11] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="flex items-center justify-center space-x-2 font-mono text-[11px]">
            <span className="font-bold text-slate-300 tracking-wider">NORTHGATE AI</span>
            <span>·</span>
            <span>PyTorch 2.14 LSTM Sequence Forecaster</span>
            <span>·</span>
            <span>XGBoost Gradient Boosting</span>
            <span>·</span>
            <span>Markowitz Mean-Variance MPT</span>
          </div>
          <p className="max-w-2xl mx-auto text-[10px] text-slate-600 leading-relaxed font-sans">
            Disclaimer: For algorithmic research, simulated execution, and quantitative analysis. Deep learning forecasts and historical simulations do not guarantee future returns.
          </p>
        </div>
      </footer>

    </div>
  );
}
