import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Play,
  Clock,
  Send,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function PaperTradingDesk({ 
  accountData, 
  onExecuteOrder, 
  onResetAccount, 
  isLoading,
  currentTicker,
  currentPrice = 200,
  suggestedStopLoss,
  suggestedTarget
}) {
  const [tradeTicker, setTradeTicker] = useState(currentTicker || 'AAPL');
  const [tradeAction, setTradeAction] = useState('BUY');
  const [tradeShares, setTradeShares] = useState(10);
  const [stopLossInput, setStopLossInput] = useState(suggestedStopLoss || '');
  const [targetInput, setTargetInput] = useState(suggestedTarget || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState(null);

  // Keep ticker in sync if currentTicker changes
  React.useEffect(() => {
    if (currentTicker) {
      setTradeTicker(currentTicker);
      if (suggestedStopLoss) setStopLossInput(suggestedStopLoss);
      if (suggestedTarget) setTargetInput(suggestedTarget);
    }
  }, [currentTicker, suggestedStopLoss, suggestedTarget]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!tradeShares || tradeShares <= 0) return;
    setIsSubmitting(true);
    setOrderFeedback(null);

    try {
      await onExecuteOrder({
        ticker: tradeTicker.toUpperCase().trim(),
        action: tradeAction,
        shares: Number(tradeShares),
        order_type: 'MARKET',
        stop_loss_price: stopLossInput ? Number(stopLossInput) : undefined,
        target_price: targetInput ? Number(targetInput) : undefined
      });
      setOrderFeedback({ 
        type: 'success', 
        message: `Order Executed: ${tradeAction} ${tradeShares} shares of ${tradeTicker.toUpperCase()} at market quote.` 
      });
      setTimeout(() => setOrderFeedback(null), 4000);
    } catch (err) {
      setOrderFeedback({ 
        type: 'error', 
        message: err.response?.data?.detail || err.message || 'Execution error.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickClose = async (position) => {
    try {
      await onExecuteOrder({
        ticker: position.ticker,
        action: 'SELL',
        shares: position.shares,
        order_type: 'MARKET'
      });
      setOrderFeedback({ 
        type: 'success', 
        message: `Liquidated position: Sold ${position.shares} shares of ${position.ticker}.` 
      });
      setTimeout(() => setOrderFeedback(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  if (isLoading || !accountData) {
    return (
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-8 h-[400px] flex flex-col items-center justify-center space-y-3">
        <Briefcase className="w-8 h-8 text-sky-400 animate-pulse" />
        <p className="text-slate-200 font-medium text-xs">Synchronizing paper trading execution desk...</p>
        <span className="text-[11px] text-slate-500 font-mono">Fetching mark-to-market valuations and bracket stop triggers</span>
      </div>
    );
  }

  const {
    cash_balance,
    portfolio_market_value,
    total_equity,
    total_pnl,
    total_pnl_pct,
    open_positions_count,
    win_rate_pct,
    positions,
    trade_history
  } = accountData;

  const isProfit = total_pnl >= 0;
  const estimatedGross = Number(tradeShares || 0) * (currentPrice || 200);
  const estimatedSlippage = estimatedGross * 0.0015; // 15 bps
  const estimatedCommission = Number(tradeShares || 0) * 0.005;

  return (
    <div className="space-y-6">
      
      {/* Account Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Equity */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Total Net Equity</span>
          <span className="text-lg sm:text-xl font-black text-white font-mono tabular-nums">
            ${total_equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">Cash + Market Value</span>
        </div>

        {/* Available Cash */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Buying Power</span>
          <span className="text-lg sm:text-xl font-black text-sky-400 font-mono tabular-nums">
            ${cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">Liquid USD</span>
        </div>

        {/* Portfolio Value */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Holdings Value</span>
          <span className="text-lg sm:text-xl font-black text-slate-200 font-mono tabular-nums">
            ${portfolio_market_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">{open_positions_count} Open Tickers</span>
        </div>

        {/* Total P&L */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Net P&L ($)</span>
          <span className={`text-lg sm:text-xl font-black font-mono tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}${total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">Realized + Unrealized</span>
        </div>

        {/* Return % */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Return Rate</span>
          <span className={`text-lg sm:text-xl font-black font-mono tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}{total_pnl_pct.toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Relative to $100k</span>
        </div>

        {/* Win Rate */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Win Rate</span>
          <span className="text-lg sm:text-xl font-black text-sky-400 font-mono tabular-nums">
            {win_rate_pct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Closed Positions</span>
        </div>

      </div>

      {/* Main Trading Floor Grid: Order Ticket & Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Institutional Order Ticket */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E273B]">
            <h3 className="font-bold text-white text-sm font-sans flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Electronic Order Ticket
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#080B11] text-emerald-400 border border-emerald-500/30">
              SIMULATED BROKER
            </span>
          </div>

          {orderFeedback && (
            <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
              orderFeedback.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              {orderFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{orderFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
            {/* BUY / SELL Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTradeAction('BUY')}
                className={`py-2 rounded-lg font-bold font-mono transition-all ${
                  tradeAction === 'BUY'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-[#080B11] text-slate-400 hover:text-slate-200 border border-[#1E273B]'
                }`}
              >
                BUY LONG
              </button>
              <button
                type="button"
                onClick={() => setTradeAction('SELL')}
                className={`py-2 rounded-lg font-bold font-mono transition-all ${
                  tradeAction === 'SELL'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-[#080B11] text-slate-400 hover:text-slate-200 border border-[#1E273B]'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Symbol & Shares Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  value={tradeTicker}
                  onChange={(e) => setTradeTicker(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#080B11] border border-[#1E273B] rounded-lg font-mono font-bold text-white text-sm focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
                  Quantity (Shares)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={tradeShares}
                  onChange={(e) => setTradeShares(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080B11] border border-[#1E273B] rounded-lg font-mono font-bold text-white text-sm focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            {/* Smart Bracket Triggers (Stop-Loss & Take-Profit) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1 font-sans">
                  Stop-Loss ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 210.50"
                  value={stopLossInput}
                  onChange={(e) => setStopLossInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#080B11] border border-[#1E273B] rounded-lg font-mono text-xs text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 font-sans">
                  Take-Profit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 250.00"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#080B11] border border-[#1E273B] rounded-lg font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Execution Pricing Breakdown with Slippage */}
            <div className="bg-[#080B11] p-3 rounded-lg border border-[#1E273B] space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Est. Share Price:</span>
                <span className="text-slate-200 tabular-nums">${currentPrice ? currentPrice.toFixed(2) : '—'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Value:</span>
                <span className="text-slate-200 tabular-nums">${estimatedGross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Slippage (15 bps):</span>
                <span className="tabular-nums">-${estimatedSlippage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Commission ($0.005/sh):</span>
                <span className="tabular-nums">-${estimatedCommission.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#1E273B] pt-1 flex justify-between font-bold text-white">
                <span>Estimated Outlay:</span>
                <span className="text-sky-400 tabular-nums">${(estimatedGross + estimatedCommission).toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg font-bold font-sans text-xs tracking-wide transition-all flex items-center justify-center gap-2 ${
                tradeAction === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Routing Order...' : `Execute ${tradeAction} Order`}</span>
            </button>
          </form>

          {/* Account Reset Button */}
          <div className="pt-2 border-t border-[#1E273B] flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Need a clean slate?</span>
            <button
              onClick={() => {
                if (window.confirm('Reset virtual portfolio to initial $100,000 cash balance?')) {
                  onResetAccount();
                }
              }}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 font-mono transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset to $100k
            </button>
          </div>
        </div>

        {/* Right Columns: Active Positions & Trade History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Open Positions Table */}
          <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E273B]">
              <h3 className="font-bold text-white text-sm font-sans flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Active Open Positions ({positions.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Auto Bracket Monitors Active</span>
            </div>

            {positions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No active positions currently open. Route a simulated order from the ticket to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-[#1E273B]">
                    <tr>
                      <th className="pb-2">Asset</th>
                      <th className="pb-2">Shares</th>
                      <th className="pb-2">Entry Price</th>
                      <th className="pb-2">Current</th>
                      <th className="pb-2">Market Val</th>
                      <th className="pb-2">P&L ($)</th>
                      <th className="pb-2">Bracket Floors</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E273B]/60 text-slate-300">
                    {positions.map((pos) => {
                      const posProfit = pos.unrealized_pnl >= 0;
                      return (
                        <tr key={pos.ticker} className="hover:bg-[#131A2B]/50 transition-colors">
                          <td className="py-2.5 font-bold text-white">{pos.ticker}</td>
                          <td className="py-2.5 tabular-nums">{pos.shares}</td>
                          <td className="py-2.5 tabular-nums text-slate-400">${pos.entry_price.toFixed(2)}</td>
                          <td className="py-2.5 tabular-nums font-semibold">${pos.current_price.toFixed(2)}</td>
                          <td className="py-2.5 tabular-nums">${pos.market_value.toFixed(2)}</td>
                          <td className={`py-2.5 font-bold tabular-nums ${posProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {posProfit ? '+' : ''}${pos.unrealized_pnl.toFixed(2)}
                            <span className="text-[10px] block opacity-80">
                              ({posProfit ? '+' : ''}{pos.unrealized_pnl_pct.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-2.5 text-[10px] text-slate-400 space-y-0.5">
                            {pos.stop_loss_price && (
                              <div className="text-rose-400">SL: ${pos.stop_loss_price.toFixed(2)}</div>
                            )}
                            {pos.target_price && (
                              <div className="text-emerald-400">TP: ${pos.target_price.toFixed(2)}</div>
                            )}
                            {!pos.stop_loss_price && !pos.target_price && <div>Manual</div>}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleQuickClose(pos)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-[#182137] text-slate-300 hover:text-white hover:bg-rose-500/20 hover:text-rose-300 border border-[#1E273B] transition-colors"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Trade Execution Ledger / Audit Trail */}
          <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E273B]">
              <h3 className="font-bold text-white text-sm font-sans flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Execution Ledger & Fill History
              </h3>
              <span className="text-[11px] font-mono text-slate-500">{trade_history.length} Total Fills</span>
            </div>

            {trade_history.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">
                Order history ledger is empty.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-[#1E273B]">
                    <tr>
                      <th className="pb-1.5">Timestamp</th>
                      <th className="pb-1.5">Order ID</th>
                      <th className="pb-1.5">Action</th>
                      <th className="pb-1.5">Ticker</th>
                      <th className="pb-1.5">Shares</th>
                      <th className="pb-1.5">Fill Price</th>
                      <th className="pb-1.5 text-right">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E273B]/40 text-slate-400 text-[11px]">
                    {trade_history.slice(-8).reverse().map((trade) => {
                      const isBuy = trade.action === 'BUY';
                      return (
                        <tr key={trade.order_id} className="hover:bg-[#131A2B]/40">
                          <td className="py-1.5 text-slate-500 text-[10px]">
                            {trade.timestamp.slice(11, 19)}
                          </td>
                          <td className="py-1.5 text-slate-400">{trade.order_id}</td>
                          <td className="py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {trade.action}
                            </span>
                          </td>
                          <td className="py-1.5 font-bold text-slate-200">{trade.ticker}</td>
                          <td className="py-1.5 tabular-nums">{trade.shares}</td>
                          <td className="py-1.5 tabular-nums text-slate-300">${trade.execution_price.toFixed(2)}</td>
                          <td className="py-1.5 tabular-nums text-right text-slate-200 font-semibold">
                            ${trade.total_value.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
