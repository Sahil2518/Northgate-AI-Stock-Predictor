import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  Sliders,
  DollarSign,
  ArrowRight,
  Wallet
} from 'lucide-react';

export default function TerminalOrderPanel({
  currentTicker = 'AAPL',
  quote,
  recommendation,
  accountData,
  onExecuteOrder,
  onResetAccount,
  onOpenWallet,
  isPaperLoading
}) {
  const [action, setAction] = useState('BUY');
  const [shares, setShares] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Auto-sync suggested levels when ticker changes
  useEffect(() => {
    if (recommendation) {
      if (recommendation.stop_loss_price) {
        setStopLoss(Number(recommendation.stop_loss_price).toFixed(2));
      }
      if (recommendation.target_price_30d) {
        setTargetPrice(Number(recommendation.target_price_30d).toFixed(2));
      }
    }
  }, [recommendation, currentTicker]);

  const price = Number(quote?.current_price || recommendation?.current_price || 200);

  const handleApplyAIBounds = () => {
    if (recommendation) {
      if (recommendation.stop_loss_price) setStopLoss(Number(recommendation.stop_loss_price).toFixed(2));
      if (recommendation.target_price_30d) setTargetPrice(Number(recommendation.target_price_30d).toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shares || shares <= 0) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await onExecuteOrder({
        ticker: currentTicker.toUpperCase().trim(),
        action: action,
        shares: Number(shares),
        order_type: 'MARKET',
        stop_loss_price: stopLoss ? Number(stopLoss) : undefined,
        target_price: targetPrice ? Number(targetPrice) : undefined
      });
      setFeedback({ type: 'success', text: `Filled ${action} ${shares} ${currentTicker} @ $${price.toFixed(2)}` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.detail || err.message || 'Execution failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const recRating = typeof recommendation?.recommendation === 'string' 
    ? recommendation.recommendation 
    : 'BUY';
  const confidence = Number(recommendation?.confidence_score ?? 82);
  const target30d = Number(recommendation?.target_price_30d || price * 1.08);
  const slFloor = Number(recommendation?.stop_loss_price || price * 0.94);
  const riskReward = Number(recommendation?.risk_reward_ratio || 2.5);

  const isBuyRating = recRating.includes('BUY');
  const isSellRating = recRating.includes('SELL');

  // Calculations
  const grossValue = Number(shares || 0) * price;
  const slippage = grossValue * 0.0015; // 15 bps
  const commission = Number(shares || 0) * 0.005;
  const estimatedTotal = grossValue + commission;

  // Account NAV (Strict default 0.0 for realistic un-funded state)
  const totalEquity = Number(accountData?.total_equity ?? 0);
  const cashBalance = Number(accountData?.cash_balance ?? 0);
  const totalPnl = Number(accountData?.total_pnl ?? 0);
  const isPnlPositive = totalPnl >= 0;

  return (
    <div className="h-full flex flex-col bg-[#0A0E17] border-l border-[#171D2B] overflow-y-auto select-none">
      
      {/* 1. AI Conviction & Target Matrix */}
      <div className="p-4 border-b border-[#171D2B] bg-[#07090E]/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            AI ADVISORY THESIS
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {confidence}% Conviction
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${
            isBuyRating 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : isSellRating 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            {recRating}
          </span>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-sans">Risk Profile</span>
            <span className="text-xs font-mono font-bold text-slate-300">
              {recommendation?.risk_level || 'Moderate'}
            </span>
          </div>
        </div>

        {/* Target vs Stop Loss Strip */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
          <div className="bg-[#0E1422] p-2 rounded-lg border border-[#1E273B]">
            <span className="text-[9px] text-slate-500 uppercase block font-sans">30D Target</span>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">${target30d.toFixed(2)}</span>
          </div>

          <div className="bg-[#0E1422] p-2 rounded-lg border border-[#1E273B]">
            <span className="text-[9px] text-slate-500 uppercase block font-sans">Stop-Loss</span>
            <span className="text-xs font-bold text-rose-400 tabular-nums">${slFloor.toFixed(2)}</span>
          </div>

          <div className="bg-[#0E1422] p-2 rounded-lg border border-[#1E273B]">
            <span className="text-[9px] text-slate-500 uppercase block font-sans">R / R Ratio</span>
            <span className="text-xs font-bold text-sky-400 tabular-nums">{riskReward.toFixed(1)}:1</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Execution Order Ticket */}
      <div className="p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            Electronic Order Ticket
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            SIMULATED
          </span>
        </div>

        {feedback && (
          <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span className="text-[11px] leading-tight">{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Action Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#07090E] p-1 rounded-lg border border-[#1E273B]">
            <button
              type="button"
              onClick={() => setAction('BUY')}
              className={`py-1.5 rounded-md font-mono font-bold text-xs transition-all ${
                action === 'BUY'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BUY LONG
            </button>
            <button
              type="button"
              onClick={() => setAction('SELL')}
              className={`py-1.5 rounded-md font-mono font-bold text-xs transition-all ${
                action === 'SELL'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SELL SHORT
            </button>
          </div>

          {/* Quantity Shares */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px]">
              <label className="text-slate-400 font-sans font-medium">Quantity (Shares)</label>
              <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-500">
                <button type="button" onClick={() => setShares(10)} className="hover:text-sky-400">+10</button>
                <span>·</span>
                <button type="button" onClick={() => setShares(50)} className="hover:text-sky-400">+50</button>
                <span>·</span>
                <button type="button" onClick={() => setShares(100)} className="hover:text-sky-400">+100</button>
              </div>
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full px-3 py-2 bg-[#07090E] border border-[#1E273B] rounded-lg font-mono font-bold text-white text-sm focus:outline-none focus:border-sky-500 tabular-nums"
              required
            />
          </div>

          {/* Smart ATR Brackets */}
          <div className="space-y-2 pt-1 border-t border-[#171D2B]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                Bracket Stop & Target
              </span>
              <button
                type="button"
                onClick={handleApplyAIBounds}
                className="text-[10px] font-mono text-sky-400 hover:text-sky-300"
              >
                Auto-fill AI Levels
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <label className="text-[10px] text-rose-400 block mb-0.5 font-sans">Stop-Loss ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Floor"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#07090E] border border-[#1E273B] rounded-md text-xs text-rose-300 focus:outline-none focus:border-rose-500 tabular-nums"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-400 block mb-0.5 font-sans">Take-Profit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Target"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#07090E] border border-[#1E273B] rounded-md text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Outlay Breakdown with Slippage & Fee */}
          <div className="bg-[#07090E] p-3 rounded-lg border border-[#1E273B] space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Market Price:</span>
              <span className="text-white tabular-nums">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Slippage (15 bps):</span>
              <span className="tabular-nums">-${slippage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Commission ($0.005/sh):</span>
              <span className="tabular-nums">-${commission.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#1E273B] pt-1 flex justify-between font-bold text-white text-xs">
              <span>Estimated Outlay:</span>
              <span className="text-sky-400 tabular-nums">${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Unfunded Account Alert Banner */}
          {cashBalance <= 0 && action === 'BUY' && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-sans">Account Unfunded ($0.00 cash)</span>
              </div>
              <button
                type="button"
                onClick={onOpenWallet}
                className="px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] tracking-wide transition-colors"
              >
                + Deposit
              </button>
            </div>
          )}

          {/* Execution Button */}
          <button
            type="submit"
            disabled={isSubmitting || isPaperLoading || (cashBalance <= 0 && action === 'BUY')}
            className={`w-full py-2.5 rounded-lg font-bold font-sans text-xs tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              action === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-rose-500 hover:bg-rose-400 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Routing Order...' : `Execute ${action} ${currentTicker}`}</span>
          </button>
        </form>
      </div>

      {/* 3. Virtual Account Quick NAV Footer */}
      <div className="p-4 border-t border-[#171D2B] bg-[#07090E]/80 space-y-2 text-xs font-mono">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
            Paper Portfolio NAV
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset portfolio to $0.00 (Unfunded empty state)?')) {
                  onResetAccount(0.0);
                }
              }}
              className="text-[10px] text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
              title="Reset to $0.00 empty wallet"
            >
              <RotateCcw className="w-2.5 h-2.5" /> $0
            </button>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Fund virtual portfolio with $100,000 Sandbox Capital?')) {
                  onResetAccount(100000.0);
                }
              }}
              className="text-[10px] text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors"
              title="Reset to $100,000 Sandbox capital"
            >
              $100k
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm font-bold text-white">
          <span className="text-slate-400 text-xs font-normal">Total Equity:</span>
          <span className="tabular-nums">${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>Buying Power:</span>
          <span className="text-sky-400 tabular-nums font-semibold">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Net Return:</span>
          <span className={`tabular-nums font-bold ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPnlPositive ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </div>

        {/* Deposit / Withdraw Action Button */}
        <button
          type="button"
          onClick={onOpenWallet}
          className="w-full mt-2 py-2 px-3 rounded-lg bg-[#0E1524] hover:bg-[#162138] border border-[#232F48] hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-sans font-semibold text-xs transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
          <Wallet className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Deposit / Cashier Hub</span>
        </button>
      </div>

    </div>
  );
}
