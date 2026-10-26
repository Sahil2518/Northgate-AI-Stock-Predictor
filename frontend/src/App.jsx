import React, { useState, useEffect } from 'react';
import TerminalSidebar from './components/TerminalSidebar';
import TerminalTopBar from './components/TerminalTopBar';
import TerminalChartCanvas from './components/TerminalChartCanvas';
import TerminalDock from './components/TerminalDock';
import TerminalOrderPanel from './components/TerminalOrderPanel';
import PredictionChart from './components/PredictionChart';
import SentimentView from './components/SentimentView';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import TechnicalView from './components/TechnicalView';
import PaperTradingDesk from './components/PaperTradingDesk';
import WalletModal from './components/WalletModal';
import Toast from './components/Toast';
import api from './services/api';

export default function App() {
  const [currentTicker, setCurrentTicker] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'prediction', 'sentiment', 'portfolio', 'paper', 'technicals'
  const [isLive, setIsLive] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState(null);

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

  // Loading States
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

  // 1. Initial Load: Check Health, Watchlist, Paper Broker & Engine Status
  useEffect(() => {
    const initApp = async () => {
      try {
        await api.checkHealth();
        setIsLive(true);
        const [wl, acc, bStatus] = await Promise.all([
          api.getWatchlist().catch(() => []),
          api.getPaperAccount().catch(() => null),
          api.getBrokerStatus().catch(() => null)
        ]);
        if (wl && wl.length) setWatchlist(wl);
        if (acc) setPaperAccount(acc);
        if (bStatus) setBrokerStatus(bStatus);
      } catch (err) {
        console.warn('Backend note:', err.message);
        setIsLive(false);
      }
    };
    initApp();
  }, []);

  // 2. Fetch Ticker Data on currentTicker Change
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

  // 3. Fetch Neural Predictions on Ticker or Horizon Change
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

  // Auto-run portfolio optimization if portfolio tab is selected for first time
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
      showToast('success', `Executed ${order.action} ${order.shares} ${order.ticker} at market price.`);
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
      showToast('info', 'Virtual trading account reset to initial $100,000 cash.');
    } catch (err) {
      showToast('error', 'Account reset failed.');
    } finally {
      setIsPaperLoading(false);
    }
  };

  const handleDepositCash = async (amount, method) => {
    try {
      const res = await api.depositCash({ amount, method });
      setPaperAccount(res);
      showToast('success', `Credited +$${Number(amount).toLocaleString()} via ${method}.`);
      return res;
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Deposit transaction failed');
      throw err;
    }
  };

  const handleWithdrawCash = async (amount, method) => {
    try {
      const res = await api.withdrawCash({ amount, method });
      setPaperAccount(res);
      showToast('info', `Withdrew -$${Number(amount).toLocaleString()} to linked bank account.`);
      return res;
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Withdrawal transaction failed');
      throw err;
    }
  };

  const handleSelectTicker = (newTicker) => {
    if (newTicker !== currentTicker) {
      setCurrentTicker(newTicker);
      showToast('info', `Active chart switched to ${newTicker}.`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090E] text-slate-100 font-sans select-none antialiased">
      
      {/* Toast System Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 1. Left Vertical Tool Rail (TradingView Pro Style) */}
      <TerminalSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWallet={() => setIsWalletOpen(true)}
        isLive={isLive}
      />

      {/* 2. Main Terminal Canvas Body */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        
        {/* Top Asset Command Bar */}
        <TerminalTopBar
          currentTicker={currentTicker}
          onSelectTicker={handleSelectTicker}
          quote={quote}
          recommendation={recommendation}
          onRefresh={() => fetchTickerData(currentTicker)}
          onOpenWallet={() => setIsWalletOpen(true)}
          cashBalance={paperAccount?.cash_balance ?? 100000}
          isLoading={isLoading}
        />

        {/* Dynamic Center Workstation */}
        {activeTab === 'workspace' && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            
            {/* Center Area: Chart Canvas + Bottom Dock (70%) */}
            <div className="flex flex-col flex-1 min-w-0 h-full border-r border-[#171D2B]">
              
              {/* Top Chart Canvas */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <TerminalChartCanvas
                  currentTicker={currentTicker}
                  quote={quote}
                  predictionData={prediction}
                  historyData={history}
                  predictionHorizon={predictionHorizon}
                  onHorizonChange={setPredictionHorizon}
                  isPredictLoading={isPredictLoading}
                />
              </div>

              {/* Bottom Multi-Tab Dock */}
              <TerminalDock
                accountData={paperAccount}
                recommendation={recommendation}
                sentimentData={sentiment}
                stressTestData={stressTest}
                onExecuteOrder={handleExecutePaperOrder}
                currentTicker={currentTicker}
              />
            </div>

            {/* Right Pinned Execution & AI Conviction Dock (30% / 360px) */}
            <div className="w-80 lg:w-96 shrink-0 h-full overflow-hidden">
              <TerminalOrderPanel
                currentTicker={currentTicker}
                quote={quote}
                recommendation={recommendation}
                accountData={paperAccount}
                onExecuteOrder={handleExecutePaperOrder}
                onResetAccount={handleResetPaperAccount}
                onOpenWallet={() => setIsWalletOpen(true)}
                isPaperLoading={isPaperLoading}
              />
            </div>

          </div>
        )}

        {/* Expanded Deep-Dive Views (Sidebar Navigation) */}
        {activeTab === 'prediction' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#080B11]">
            <PredictionChart
              predictionData={prediction}
              onHorizonChange={setPredictionHorizon}
              currentHorizon={predictionHorizon}
              isLoading={isPredictLoading}
            />
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#080B11]">
            <SentimentView
              sentimentData={sentiment}
              ticker={currentTicker}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#080B11]">
            <PortfolioOptimizer
              portfolioData={portfolio}
              onOptimize={handleRunOptimization}
              isLoading={isPortfolioLoading}
              stressTestData={stressTest}
              onRunStressTest={handleRunStressTest}
              isStressLoading={isStressLoading}
            />
          </div>
        )}

        {activeTab === 'paper' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#080B11]">
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
          </div>
        )}

        {activeTab === 'technicals' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#080B11]">
            <TechnicalView
              technicalData={technicals}
              historyData={history}
              ticker={currentTicker}
              isLoading={isLoading}
            />
          </div>
        )}

      </div>

      {/* Institutional Cashier & Wallet Hub Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        accountData={paperAccount}
        onDeposit={handleDepositCash}
        onWithdraw={handleWithdrawCash}
        brokerStatus={brokerStatus}
      />

    </div>
  );
}
