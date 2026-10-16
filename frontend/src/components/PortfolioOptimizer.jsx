import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  Line 
} from 'recharts';
import { 
  PieChart, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Sliders, 
  Plus, 
  Trash2, 
  Play, 
  Layers, 
  CheckCircle2,
  Award
} from 'lucide-react';

const CANDIDATE_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY', 'JPM', 'V'];

export default function PortfolioOptimizer({ 
  portfolioData, 
  onOptimize, 
  isLoading 
}) {
  const [selectedTickers, setSelectedTickers] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']);
  const [newTickerInput, setNewTickerInput] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [riskFreeRate, setRiskFreeRate] = useState(0.045);
  const [activeStrategy, setActiveStrategy] = useState('max_sharpe'); // 'max_sharpe', 'min_vol', 'equal_weight'

  const handleAddTicker = (t) => {
    const clean = t.toUpperCase().trim();
    if (clean && !selectedTickers.includes(clean)) {
      setSelectedTickers([...selectedTickers, clean]);
      setNewTickerInput('');
    }
  };

  const handleRemoveTicker = (t) => {
    if (selectedTickers.length > 2) {
      setSelectedTickers(selectedTickers.filter(sym => sym !== t));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onOptimize({
      tickers: selectedTickers,
      investment_amount: Number(investmentAmount),
      risk_free_rate: Number(riskFreeRate),
      timeframe_years: 2
    });
  };

  const currentResult = portfolioData ? (
    activeStrategy === 'max_sharpe' 
      ? portfolioData.max_sharpe_portfolio 
      : activeStrategy === 'min_vol' 
      ? portfolioData.min_volatility_portfolio 
      : portfolioData.equal_weight_portfolio
  ) : null;

  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="font-bold text-slate-200">Simulated Portfolio</div>
          <div className="flex justify-between gap-4 text-cyan-400">
            <span>Expected Return:</span>
            <span className="font-mono font-bold">{data.return_rate}%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Volatility (Risk):</span>
            <span className="font-mono">{data.volatility}%</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>Sharpe Ratio:</span>
            <span className="font-mono font-bold">{data.sharpe}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Control Configuration Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <PieChart className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-white text-lg">Modern Portfolio Theory Optimizer</h3>
            </div>
            <p className="text-xs text-slate-400">
              Mean-variance optimization generating the Markowitz Efficient Frontier, Max Sharpe Tangency portfolio, and downside VaR metrics.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isLoading ? 'Optimizing...' : 'Calculate Efficient Frontier'}</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800/80">
          
          {/* Asset Universe Selector */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Asset Universe (Min 2 stocks):
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {selectedTickers.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700"
                >
                  <span>{t}</span>
                  {selectedTickers.length > 2 && (
                    <button 
                      onClick={() => handleRemoveTicker(t)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}

              <form 
                onSubmit={(e) => { e.preventDefault(); handleAddTicker(newTickerInput); }}
                className="inline-flex items-center"
              >
                <input
                  type="text"
                  placeholder="+ Add symbol..."
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value)}
                  className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 w-28 uppercase"
                />
              </form>
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center space-x-1.5 pt-1 text-[11px] text-slate-500">
              <span>Suggestions:</span>
              {CANDIDATE_TICKERS.filter(t => !selectedTickers.includes(t)).slice(0, 4).map(t => (
                <button
                  key={t}
                  onClick={() => handleAddTicker(t)}
                  className="hover:text-cyan-400 font-mono"
                >
                  +{t}
                </button>
              ))}
            </div>
          </div>

          {/* Capital & Risk Free Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Capital ($)
              </span>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Risk-Free (%)
              </span>
              <input
                type="number"
                step="0.005"
                value={riskFreeRate * 100}
                onChange={(e) => setRiskFreeRate(Number(e.target.value) / 100)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Results Section */}
      {portfolioData && currentResult && (
        <div className="space-y-6">
          
          {/* Strategy Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-fit">
            {[
              { id: 'max_sharpe', label: 'Maximum Sharpe Ratio (Optimal)', icon: Award },
              { id: 'min_vol', label: 'Minimum Volatility (Defensive)', icon: ShieldAlert },
              { id: 'equal_weight', label: '1/N Benchmark', icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeStrategy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStrategy(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Expected Return</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                +{currentResult.metrics.expected_annual_return_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Annualized</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Annual Volatility</span>
              <span className="text-xl font-black text-cyan-400 font-mono">
                {currentResult.metrics.annual_volatility_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Portfolio Std Dev</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sharpe Ratio</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {currentResult.metrics.sharpe_ratio}
              </span>
              <span className="text-[10px] text-slate-500 block">Excess / Risk</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sortino Ratio</span>
              <span className="text-xl font-black text-teal-300 font-mono">
                {currentResult.metrics.sortino_ratio}
              </span>
              <span className="text-[10px] text-slate-500 block">Downside Vol Ratio</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">1-Day VaR (95%)</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                -{currentResult.metrics.var_95_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Value-at-Risk</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">1-Day CVaR (95%)</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                -{currentResult.metrics.cvar_95_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Expected Shortfall</span>
            </div>
          </div>

          {/* Allocation Breakdown and Efficient Frontier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Allocation Table & Capital Distribution */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center justify-between">
                <span>Asset Allocation & Capital Deployment</span>
                <span className="text-xs text-slate-400 font-normal font-mono">
                  ${investmentAmount.toLocaleString()} Total
                </span>
              </h4>

              <div className="space-y-3">
                {currentResult.allocations.map(alloc => (
                  <div key={alloc.ticker} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white font-mono">{alloc.ticker}</span>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-slate-400">{alloc.estimated_shares} shares</span>
                        <span className="text-slate-200 font-bold">${alloc.allocated_cash.toLocaleString()}</span>
                        <span className="text-cyan-400 font-black">{alloc.weight}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${alloc.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Markowitz Efficient Frontier Scatter Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
                  Markowitz Efficient Frontier & Monte Carlo
                </h4>
                <span className="text-[11px] text-cyan-400 font-mono font-semibold">1,500 Portfolios</span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      type="number" 
                      dataKey="volatility" 
                      name="Volatility" 
                      unit="%" 
                      stroke="#64748b" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="return_rate" 
                      name="Expected Return" 
                      unit="%" 
                      stroke="#64748b" 
                      tick={{ fontSize: 10 }}
                    />
                    <ZAxis range={[20, 20]} />
                    <Tooltip content={<CustomScatterTooltip />} />
                    
                    {/* Simulated Monte Carlo points */}
                    <Scatter 
                      name="Simulated Portfolios" 
                      data={portfolioData.simulated_portfolios.slice(0, 400)} 
                      fill="#38bdf8" 
                      opacity={0.35} 
                    />

                    {/* Efficient Frontier curve points */}
                    <Scatter 
                      name="Efficient Frontier" 
                      data={portfolioData.efficient_frontier} 
                      fill="#06b6d4" 
                      line={{ stroke: '#06b6d4', strokeWidth: 2 }} 
                      shape="circle" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Correlation Matrix Heatmap */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Asset Cross-Correlation Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-center">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2 text-left text-slate-500">Asset</th>
                    {portfolioData.tickers.map(t => (
                      <th key={t} className="py-2 px-3 text-slate-400">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.tickers.map(t1 => (
                    <tr key={t1} className="border-b border-slate-800/50">
                      <td className="py-2 text-left font-bold text-slate-300">{t1}</td>
                      {portfolioData.tickers.map(t2 => {
                        const val = portfolioData.correlation_matrix[t1]?.[t2] ?? 1.0;
                        const isHigh = val > 0.7 && t1 !== t2;
                        return (
                          <td 
                            key={t2} 
                            className={`py-2 px-3 ${
                              t1 === t2 
                                ? 'text-slate-600' 
                                : isHigh 
                                ? 'text-amber-400 font-bold bg-amber-500/10' 
                                : 'text-slate-300'
                            }`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
