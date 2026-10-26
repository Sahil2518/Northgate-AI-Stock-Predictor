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
  Award,
  Activity
} from 'lucide-react';
import StressTestCard from './StressTestCard';

const CANDIDATE_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY', 'JPM', 'V'];

export default function PortfolioOptimizer({ 
  portfolioData, 
  onOptimize, 
  isLoading,
  stressTestData,
  onRunStressTest,
  isStressLoading
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
        <div className="bg-[#080B11]/95 border border-[#1E273B] p-3 rounded-lg shadow-2xl text-xs space-y-1 font-mono">
          <div className="font-bold text-slate-200 font-sans">Simulated Allocation Vector</div>
          <div className="flex justify-between gap-4 text-sky-400">
            <span>Exp. Return:</span>
            <span className="font-bold tabular-nums">+{data.return_rate}%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Volatility:</span>
            <span className="tabular-nums">{data.volatility}%</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>Sharpe Ratio:</span>
            <span className="font-bold tabular-nums">{data.sharpe}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Control Configuration Panel */}
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-6 shadow-xl shadow-black/20 space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#1E273B]">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-white text-base font-sans">
                Modern Portfolio Theory Optimizer (Markowitz Framework)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              SciPy quadratic solver calculating the Efficient Frontier, Max Sharpe Tangency vector, and downside CVaR
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg font-semibold text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-sans shadow-md hover:shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isLoading ? 'Computing Frontier...' : 'Run Portfolio Optimization'}</span>
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Asset Universe Selector */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
              Selected Asset Universe (Minimum 2 Assets):
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedTickers.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#080B11] text-sky-300 border border-[#1E273B]"
                >
                  <span>{t}</span>
                  {selectedTickers.length > 2 && (
                    <button 
                      onClick={() => handleRemoveTicker(t)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
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
                  placeholder="+ Add ticker..."
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value)}
                  className="px-2.5 py-1 bg-[#080B11] border border-[#1E273B] rounded-md text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 w-24 uppercase"
                />
              </form>
            </div>

            {/* Quick Universe Suggestions */}
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono pt-0.5">
              <span>Quick Add:</span>
              {CANDIDATE_TICKERS.filter(t => !selectedTickers.includes(t)).slice(0, 5).map(t => (
                <button
                  key={t}
                  onClick={() => handleAddTicker(t)}
                  className="hover:text-sky-400 font-semibold"
                >
                  +{t}
                </button>
              ))}
            </div>
          </div>

          {/* Capital Allocation & Risk-Free Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">
                Portfolio Capital ($)
              </span>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-[#080B11] border border-[#1E273B] rounded-md text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">
                Risk-Free Rate (%)
              </span>
              <input
                type="number"
                step="0.005"
                value={(riskFreeRate * 100).toFixed(1)}
                onChange={(e) => setRiskFreeRate(Number(e.target.value) / 100)}
                className="w-full px-3 py-1.5 bg-[#080B11] border border-[#1E273B] rounded-md text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Results Section */}
      {portfolioData && currentResult && (
        <div className="space-y-6">
          
          {/* Strategy Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#0E131F] p-1 rounded-lg border border-[#1E273B] w-fit">
            {[
              { id: 'max_sharpe', label: 'Max Sharpe Tangency (Optimal)', icon: Award },
              { id: 'min_vol', label: 'Minimum Variance (Defensive)', icon: ShieldAlert },
              { id: 'equal_weight', label: '1/N Benchmark (Equal Weight)', icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeStrategy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStrategy(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#182137] text-sky-300 font-semibold border border-sky-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Key Portfolio Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Expected Return</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tabular-nums">
                +{currentResult.metrics.expected_annual_return_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Annualized</span>
            </div>

            <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Annual Volatility</span>
              <span className="text-base sm:text-lg font-black text-sky-400 font-mono tabular-nums">
                {currentResult.metrics.annual_volatility_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Portfolio Risk</span>
            </div>

            <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Sharpe Ratio</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tabular-nums">
                {currentResult.metrics.sharpe_ratio}
              </span>
              <span className="text-[10px] text-slate-500 block">Risk-Adjusted</span>
            </div>

            <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Sortino Ratio</span>
              <span className="text-base sm:text-lg font-black text-teal-300 font-mono tabular-nums">
                {currentResult.metrics.sortino_ratio}
              </span>
              <span className="text-[10px] text-slate-500 block">Downside Adjusted</span>
            </div>

            <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">1-Day VaR (95%)</span>
              <span className="text-base sm:text-lg font-black text-rose-400 font-mono tabular-nums">
                -{currentResult.metrics.var_95_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Value-at-Risk</span>
            </div>

            <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">1-Day CVaR (95%)</span>
              <span className="text-base sm:text-lg font-black text-rose-400 font-mono tabular-nums">
                -{currentResult.metrics.cvar_95_pct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Expected Shortfall</span>
            </div>
          </div>

          {/* Allocation Breakdown and Efficient Frontier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Allocation Table & Capital Distribution */}
            <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20 space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between font-sans">
                <span>Optimized Asset Weights & Capital Outlay</span>
                <span className="text-xs text-slate-400 font-normal font-mono">
                  ${investmentAmount.toLocaleString()} Total
                </span>
              </h4>

              <div className="space-y-3">
                {currentResult.allocations.map(alloc => (
                  <div key={alloc.ticker} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-white">{alloc.ticker}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">{alloc.estimated_shares} sh</span>
                        <span className="text-slate-200 font-semibold">${alloc.allocated_cash.toLocaleString()}</span>
                        <span className="text-sky-400 font-bold">{alloc.weight}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#080B11] h-1.5 rounded-full overflow-hidden border border-[#1E273B]">
                      <div 
                        className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${alloc.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Markowitz Efficient Frontier Scatter Chart */}
            <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
                  Markowitz Efficient Frontier & Monte Carlo Surface
                </h4>
                <span className="text-[11px] text-sky-400 font-mono font-semibold">1,500 Portfolios</span>
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E273B" />
                    <XAxis 
                      type="number" 
                      dataKey="volatility" 
                      name="Volatility" 
                      unit="%" 
                      stroke="#64748b" 
                      tick={{ fontSize: 10 }}
                      fontFamily="JetBrains Mono"
                    />
                    <YAxis 
                      type="number" 
                      dataKey="return_rate" 
                      name="Expected Return" 
                      unit="%" 
                      stroke="#64748b" 
                      tick={{ fontSize: 10 }}
                      fontFamily="JetBrains Mono"
                    />
                    <ZAxis range={[15, 15]} />
                    <Tooltip content={<CustomScatterTooltip />} />
                    
                    {/* Simulated Monte Carlo points */}
                    <Scatter 
                      name="Simulated Portfolios" 
                      data={portfolioData.simulated_portfolios.slice(0, 350)} 
                      fill="#38bdf8" 
                      opacity={0.3} 
                    />

                    {/* Efficient Frontier curve points */}
                    <Scatter 
                      name="Efficient Frontier" 
                      data={portfolioData.efficient_frontier} 
                      fill="#38bdf8" 
                      line={{ stroke: '#38bdf8', strokeWidth: 2 }} 
                      shape="circle" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Cross-Correlation Matrix */}
          <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-sans">
              Asset Empirical Correlation Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-center">
                <thead>
                  <tr className="border-b border-[#1E273B]">
                    <th className="py-2 text-left text-slate-500">Asset</th>
                    {portfolioData.tickers.map(t => (
                      <th key={t} className="py-2 px-3 text-slate-400">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E273B]/50">
                  {portfolioData.tickers.map(t1 => (
                    <tr key={t1} className="hover:bg-[#131A2B]/40">
                      <td className="py-2 text-left font-bold text-slate-200">{t1}</td>
                      {portfolioData.tickers.map(t2 => {
                        const val = portfolioData.correlation_matrix[t1]?.[t2] ?? 1.0;
                        const isHigh = val > 0.7 && t1 !== t2;
                        return (
                          <td 
                            key={t2} 
                            className={`py-2 px-3 tabular-nums ${
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

          {/* Historical Crisis Stress Simulator */}
          <StressTestCard
            stressTestData={stressTestData}
            onRunStressTest={() => onRunStressTest && onRunStressTest(selectedTickers, investmentAmount)}
            isLoading={isStressLoading}
            investmentAmount={investmentAmount}
          />

        </div>
      )}

    </div>
  );
}
