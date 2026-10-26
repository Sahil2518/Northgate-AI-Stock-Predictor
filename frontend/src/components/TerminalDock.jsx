import React, { useState } from 'react';
import { 
  Layers, 
  Clock, 
  Brain, 
  Newspaper, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  AlertCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function TerminalDock({
  accountData,
  recommendation,
  sentimentData,
  stressTestData,
  onExecuteOrder,
  currentTicker = 'AAPL',
  investmentAmount = 10000
}) {
  const [activeDockTab, setActiveDockTab] = useState('positions'); // 'positions', 'signals', 'news', 'stresstest'
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currencySymbol = accountData?.currency_symbol || '₹';

  const positionsList = Array.isArray(accountData?.positions) ? accountData.positions : [];
  const historyList = Array.isArray(accountData?.trade_history) ? accountData.trade_history : [];
  const articlesList = Array.isArray(sentimentData?.articles) ? sentimentData.articles : [];
  const signals = recommendation?.signals || {};
  const scenariosList = Array.isArray(stressTestData?.scenarios) ? stressTestData.scenarios : [];

  const handleClosePosition = async (pos) => {
    try {
      await onExecuteOrder({
        ticker: pos.ticker,
        action: 'SELL',
        shares: pos.shares,
        order_type: 'MARKET'
      });
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const tabs = [
    { id: 'positions', label: `Positions (${positionsList.length})`, icon: Layers },
    { id: 'signals', label: 'Signal Decomposition', icon: Brain },
    { id: 'news', label: `News Wire (${articlesList.length})`, icon: Newspaper },
    { id: 'stresstest', label: 'Crisis Stress Test', icon: ShieldAlert },
  ];

  return (
    <div className={`bg-[#0A0E17] border-t border-[#171D2B] flex flex-col shrink-0 select-none transition-all ${
      isCollapsed ? 'h-9' : 'h-64'
    }`}>
      
      {/* Dock Header Tabs */}
      <div className="h-9 bg-[#07090E] border-b border-[#171D2B] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDockTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveDockTab(tab.id);
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                  isActive && !isCollapsed
                    ? 'bg-[#151E33] text-sky-400 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-slate-500 hover:text-slate-200 rounded hover:bg-[#111726] transition-colors"
          title={isCollapsed ? 'Expand Bottom Dock' : 'Collapse Bottom Dock'}
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Dock Content Body */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
          
          {/* Tab 1: Positions & Fill History */}
          {activeDockTab === 'positions' && (
            <div className="space-y-4">
              {positionsList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-sans text-xs">
                  No active simulated positions. Use the electronic order ticket on the right to enter market positions.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-[#171D2B]">
                      <tr>
                        <th className="pb-1.5">Symbol</th>
                        <th className="pb-1.5">Shares</th>
                        <th className="pb-1.5">Avg Entry</th>
                        <th className="pb-1.5">Current Spot</th>
                        <th className="pb-1.5">Market Value</th>
                        <th className="pb-1.5">Unrealized P&L</th>
                        <th className="pb-1.5">ATR Brackets</th>
                        <th className="pb-1.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171D2B]/80 text-slate-300">
                      {positionsList.map(pos => {
                        const isProfitable = Number(pos.unrealized_pnl || 0) >= 0;
                        return (
                          <tr key={pos.ticker} className="hover:bg-[#111726]/60">
                            <td className="py-2 font-bold text-white">{pos.ticker}</td>
                            <td className="py-2 tabular-nums">{pos.shares}</td>
                            <td className="py-2 tabular-nums text-slate-400">{currencySymbol}{Number(pos.entry_price || pos.average_entry_price || 0).toFixed(2)}</td>
                            <td className="py-2 tabular-nums font-semibold">{currencySymbol}{Number(pos.current_price || 0).toFixed(2)}</td>
                            <td className="py-2 tabular-nums">{currencySymbol}{Number(pos.market_value || 0).toFixed(2)}</td>
                            <td className={`py-2 font-bold tabular-nums ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfitable ? '+' : ''}{currencySymbol}{Number(pos.unrealized_pnl || 0).toFixed(2)} ({Number(pos.unrealized_pnl_pct || 0).toFixed(2)}%)
                            </td>
                            <td className="py-2 text-[10px] space-y-0.5 text-slate-400">
                              {pos.stop_loss_price && <div className="text-rose-400">SL: {currencySymbol}{Number(pos.stop_loss_price).toFixed(2)}</div>}
                              {pos.target_price && <div className="text-emerald-400">TP: {currencySymbol}{Number(pos.target_price).toFixed(2)}</div>}
                            </td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => handleClosePosition(pos)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#151E33] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#232F48] transition-colors"
                              >
                                Liquidate
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
          )}

          {/* Tab 2: Signal Decomposition */}
          {activeDockTab === 'signals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#07090E] p-3 rounded-lg border border-[#171D2B] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-sans font-medium">1. AI Model Forecast (35%)</span>
                  <span className="font-bold text-sky-400 tabular-nums">
                    {signals?.ai_return !== undefined ? `${signals.ai_return > 0 ? '+' : ''}${Number(signals.ai_return).toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-[#111726] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, (signals?.ai_return || 0) * 5 + 50))}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block font-sans">LSTM Sequence + XGBoost Tree Consensus</span>
              </div>

              <div className="bg-[#07090E] p-3 rounded-lg border border-[#171D2B] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-sans font-medium">2. News Sentiment (25%)</span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    {signals?.sentiment_score !== undefined ? `${Number(signals.sentiment_score).toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="w-full bg-[#111726] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, ((signals?.sentiment_score || 0) + 1) * 50))}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block font-sans">VADER Institutional Corporate Headline Polarity</span>
              </div>

              <div className="bg-[#07090E] p-3 rounded-lg border border-[#171D2B] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-sans font-medium">3. Technical Trend (25%)</span>
                  <span className="font-bold text-indigo-400 tabular-nums">
                    {signals?.technical_score ? `${Number(signals.technical_score).toFixed(0)}/100` : '—'}
                  </span>
                </div>
                <div className="w-full bg-[#111726] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, signals?.technical_score || 50))}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block font-sans">RSI Mean-Reversion, MACD & Moving Averages</span>
              </div>

              <div className="bg-[#07090E] p-3 rounded-lg border border-[#171D2B] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-sans font-medium">4. Volatility & Risk (15%)</span>
                  <span className="font-bold text-amber-400 font-sans">
                    {recommendation?.risk_level || 'Moderate'}
                  </span>
                </div>
                <div className="w-full bg-[#111726] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-[10px] text-slate-500 block font-sans">ATR Risk Barrier & Downside Volatility Vector</span>
              </div>
            </div>
          )}

          {/* Tab 3: News Wire */}
          {activeDockTab === 'news' && (
            <div className="space-y-2">
              {articlesList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-sans text-xs">
                  News wire is synchronizing headlines for {currentTicker}...
                </div>
              ) : (
                articlesList.slice(0, 5).map((art, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#07090E] border border-[#171D2B] text-xs">
                    <a
                      href={art.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-200 hover:text-sky-400 font-sans truncate max-w-xl flex items-center gap-1.5"
                    >
                      <span>{art.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                    </a>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                      <span className="text-slate-500 text-[10px]">{art.publisher}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        art.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {art.sentiment}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Stress Test */}
          {activeDockTab === 'stresstest' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {scenariosList.map(sc => (
                <div key={sc.scenario_id} className="p-2.5 rounded-lg bg-[#07090E] border border-[#171D2B]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white font-sans text-xs">{sc.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#111726] text-sky-400 border border-[#1E273B]">
                      {sc.resilience_grade}
                    </span>
                  </div>
                  <div className="text-rose-400 font-bold tabular-nums text-sm">
                    {Number(sc.simulated_drawdown_pct || 0).toFixed(1)}% Max Shock
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Vol: +{(Number(sc.volatility_spike_multiplier || 1) * 100 - 100).toFixed(0)}% · Recovery: {sc.estimated_recovery_months}mo
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
