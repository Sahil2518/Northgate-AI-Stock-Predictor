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
  Clock
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
      setOrderFeedback({ type: 'success', message: `Order executed: ${tradeAction} ${tradeShares} shares of ${tradeTicker.toUpperCase()}` });
      setTimeout(() => setOrderFeedback(null), 5000);
    } catch (err) {
      setOrderFeedback({ type: 'error', message: err.response?.data?.detail || err.message });
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
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  if (isLoading || !accountData) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 h-[400px] flex flex-col items-center justify-center space-y-4">
        <Briefcase className="w-12 h-12 text-cyan-400 animate-pulse" />
        <p className="text-slate-300 font-medium text-sm">Loading simulated brokerage trading desk...</p>
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

  return (
    <div className="space-y-6">
      
      {/* Account Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Equity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Net Worth</span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono">
            ${total_equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">Cash + Holdings</span>
        </div>

        {/* Available Cash */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Available Cash</span>
          <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            ${cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">Buying Power</span>
        </div>

        {/* Portfolio Value */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Invested Value</span>
          <span className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
            ${portfolio_market_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 block">{open_positions_count} Open Positions</span>
        </div>

        {/* Total P&L */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total P&L</span>
          <span className={`text-xl sm:text-2xl font-black font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}${total_pnl.toFixed(2)}
          </span>
          <span className={`text-[10px] font-bold block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}{total_pnl_pct.toFixed(2)}%
          </span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Win Rate</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{win_rate_pct}%</span>
          <span className="text-[10px] text-slate-500 block">Closed Trades</span>
        </div>

        {/* Reset Action */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
          <button
            onClick={() => {
              if (confirm('Reset paper trading balance back to $100,000.00?')) {
                onResetAccount();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Capital
          </button>
          <span className="text-[10px] text-slate-500 mt-1">$100k Virtual Balance</span>
        </div>

      </div>

      {/* Trade Execution Panel and Active Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Order Execution Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              Simulated Order Terminal
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              5 bps Slippage
            </span>
          </div>

          {orderFeedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              orderFeedback.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              {orderFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{orderFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
            
            {/* Action Toggle (BUY / SELL) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTradeAction('BUY')}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  tradeAction === 'BUY'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTradeAction('SELL')}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  tradeAction === 'SELL'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Symbol & Shares */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Ticker
                </label>
                <input
                  type="text"
                  value={tradeTicker}
                  onChange={(e) => setTradeTicker(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-bold font-mono text-slate-100 uppercase focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Shares
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={tradeShares}
                  onChange={(e) => setTradeShares(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Stop-Loss & Target Brackets */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 150.00"
                  value={stopLossInput}
                  onChange={(e) => setStopLossInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Price ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 260.00"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                tradeAction === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20 hover:from-rose-400 hover:to-red-500'
              } disabled:opacity-50`}
            >
              {isSubmitting ? 'Routing Order...' : `Execute ${tradeAction} Order`}
            </button>

            <span className="text-[10px] text-slate-500 block text-center">
              Order automatically enforces trailing stop-loss and profit target triggers.
            </span>
          </form>
        </div>

        {/* Active Open Positions Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Active Open Positions ({positions.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono">Live Mark-to-Market</span>
            </div>

            {positions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No open positions. Use the order terminal or 1-click trade buttons on AI Advisory cards to open a position.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-left">
                      <th className="py-2">Asset</th>
                      <th className="py-2 text-right">Shares</th>
                      <th className="py-2 text-right">Avg Entry</th>
                      <th className="py-2 text-right">Current</th>
                      <th className="py-2 text-right">Market Value</th>
                      <th className="py-2 text-right">Unrealized P&L</th>
                      <th className="py-2 text-right">Stop Loss</th>
                      <th className="py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(p => {
                      const posProfit = p.unrealized_pnl >= 0;
                      return (
                        <tr key={p.ticker} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                          <td className="py-2.5 font-bold text-white">
                            <div>{p.ticker}</div>
                            <div className="text-[10px] text-slate-500 font-sans">{p.company_name}</div>
                          </td>
                          <td className="py-2.5 text-right text-slate-300">{p.shares}</td>
                          <td className="py-2.5 text-right text-slate-400">${p.average_entry_price.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-bold text-slate-200">${p.current_price.toFixed(2)}</td>
                          <td className="py-2.5 text-right text-slate-200 font-bold">${p.market_value.toLocaleString()}</td>
                          <td className={`py-2.5 text-right font-bold ${posProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {posProfit ? '+' : ''}${p.unrealized_pnl.toFixed(2)}
                            <span className="text-[10px] block">({posProfit ? '+' : ''}{p.unrealized_pnl_pct.toFixed(1)}%)</span>
                          </td>
                          <td className="py-2.5 text-right text-rose-400 font-semibold">
                            {p.stop_loss_price ? `$${p.stop_loss_price.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => handleQuickClose(p)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-[11px] font-bold"
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

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between items-center">
            <span>Automated monitoring verifies stop-loss brackets continuously.</span>
            <span>Broker: Paper Simulation</span>
          </div>
        </div>

      </div>

      {/* Trade Execution History Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Executed Trade History Log ({trade_history.length})
          </span>
          <span className="text-xs text-slate-500 font-normal">Realized Transactions</span>
        </h4>

        {trade_history.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs font-mono">
            No executed trades yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2">Date / Time</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Symbol</th>
                  <th className="py-2 text-right">Shares</th>
                  <th className="py-2 text-right">Execution Price</th>
                  <th className="py-2 text-right">Total ($)</th>
                  <th className="py-2 text-right">Realized P&L</th>
                  <th className="py-2 text-right">Reason</th>
                </tr>
              </thead>
              <tbody>
                {trade_history.map(t => {
                  const hasPnl = t.realized_pnl !== null && t.realized_pnl !== undefined;
                  const isPnlPositive = hasPnl && t.realized_pnl >= 0;
                  return (
                    <tr key={t.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                      <td className="py-2 text-slate-400">{t.executed_at}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {t.action}
                        </span>
                      </td>
                      <td className="py-2 font-bold text-white">{t.ticker}</td>
                      <td className="py-2 text-right text-slate-300">{t.shares}</td>
                      <td className="py-2 text-right text-slate-200">${t.execution_price.toFixed(2)}</td>
                      <td className="py-2 text-right text-slate-200">${t.total_amount.toLocaleString()}</td>
                      <td className={`py-2 text-right font-bold ${hasPnl ? (isPnlPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'}`}>
                        {hasPnl ? `${isPnlPositive ? '+' : ''}$${t.realized_pnl.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2 text-right text-slate-400 text-[11px] font-sans">
                        {t.trigger_reason}
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
  );
}
