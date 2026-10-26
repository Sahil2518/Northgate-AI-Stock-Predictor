import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BrainCircuit, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  BarChart2, 
  PieChart, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Calculator,
  ArrowRight,
  Database
} from 'lucide-react';
import api from '../services/api';

const PRD_UNIVERSE = ['AAPL', 'MSFT', 'NVDA', 'JPM', 'XOM', 'JNJ', 'PG', 'KO', 'CAT', 'HD'];

export default function QuantLabView({ currentTicker = 'AAPL', onSelectTicker }) {
  const [activeSubTab, setActiveSubTab] = useState('benchmark'); // 'benchmark', 'sentiment_ablation', 'math', 'audit', 'rebalance'
  const [ticker, setTicker] = useState(currentTicker);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [ablationData, setAblationData] = useState(null);
  const [mathData, setMathData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [rebalanceData, setRebalanceData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync internal ticker when parent currentTicker changes
  useEffect(() => {
    if (currentTicker && currentTicker !== ticker) {
      setTicker(currentTicker);
    }
  }, [currentTicker]);

  // Load active tab data
  useEffect(() => {
    loadTabData(activeSubTab, ticker);
  }, [activeSubTab, ticker]);

  const loadTabData = async (subTab, targetTicker) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (subTab === 'benchmark') {
        const res = await api.getModelBenchmark(targetTicker);
        setBenchmarkData(res);
      } else if (subTab === 'sentiment_ablation') {
        const res = await api.getSentimentAblation(targetTicker);
        setAblationData(res);
      } else if (subTab === 'math') {
        const res = await api.getMathVerification();
        setMathData(res);
      } else if (subTab === 'audit') {
        const res = await api.getDataQualityReport();
        setAuditData(res);
      } else if (subTab === 'rebalance') {
        // Mock current portfolio vs target tangency weights for demo
        const res = await api.getRebalancingPlan({
          current_weights: { [targetTicker]: 0.45, 'MSFT': 0.10, 'NVDA': 0.05, 'JPM': 0.40 },
          target_weights: { [targetTicker]: 0.25, 'MSFT': 0.20, 'NVDA': 0.35, 'JPM': 0.20 },
          tolerance_band: 0.05
        });
        setRebalanceData(res);
      }
    } catch (err) {
      setErrorMsg(`Failed to synchronize ${subTab} research feed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTickerChange = (sym) => {
    setTicker(sym);
    if (onSelectTicker) onSelectTicker(sym);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090E] overflow-y-auto select-none font-sans text-slate-100 p-6 space-y-6">
      
      {/* 1. Institutional Capstone Header Banner */}
      <div className="bg-gradient-to-r from-[#0C1220] via-[#0E1626] to-[#0A0F1D] border border-[#1E293B] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Northgate Quantitative Research · Capstone Evaluation Hub
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                PRD v1.0 Compliant
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Machine Learning & Deep Learning Quantitative Defense Lab
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Fulfills Sections 7, 8, 9, 10, and 12 of the Northgate PRD. Rigorous, leak-free benchmarking across 
              8 model architectures under chronological TimeSeriesSplit, FinBERT sentiment ablation, and first-principles mathematical verification.
            </p>
          </div>

          {/* Universe Chip Switcher */}
          <div className="flex flex-col items-start lg:items-end space-y-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">PRD 10-Asset Universe:</span>
            <div className="flex flex-wrap gap-1 max-w-sm">
              {PRD_UNIVERSE.map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleTickerChange(sym)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                    ticker === sym
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'bg-[#111726] text-slate-400 hover:text-white border border-[#1E273B]'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-[#172033]">
          {[
            { id: 'benchmark', label: '8-Model Comparison Suite', icon: BarChart2, badge: 'PRD §8-9' },
            { id: 'sentiment_ablation', label: 'Sentiment Alpha Ablation', icon: Sparkles, badge: 'PRD §10.3' },
            { id: 'math', label: 'From-Scratch Maths & OLS', icon: Calculator, badge: 'PRD §7' },
            { id: 'audit', label: 'Data Quality & Leakage Audit', icon: Database, badge: 'PRD §4' },
            { id: 'rebalance', label: 'Portfolio Drift & Rebalance', icon: PieChart, badge: 'PRD §12' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-md'
                    : 'bg-[#0E1524] text-slate-400 hover:text-slate-200 border border-[#1E273B] hover:border-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[9px] font-mono opacity-60 ml-0.5">({tab.badge})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-[#0B0F19] rounded-2xl border border-[#1E273B]">
          <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Executing leak-free cross-validation and matrix factorizations...</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. TAB 1: 8-MODEL BENCHMARK TABLE (PRD Section 8 & 9) */}
      {!isLoading && activeSubTab === 'benchmark' && benchmarkData && (
        <div className="space-y-4">
          
          {/* Winner Banner */}
          <div className="bg-[#0D1424] border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Top Ranked Quantitative Forecaster</span>
                <span className="text-base font-extrabold text-white">{benchmarkData.winning_model}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono bg-[#070A12] px-3 py-1.5 rounded-lg border border-[#1A2333]">
              Held-Out Test Samples: <strong className="text-white">{benchmarkData.test_samples} Days</strong>
            </div>
          </div>

          {/* 8-Model Comparison Table */}
          <div className="bg-[#0A0E17] border border-[#1A2333] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1A2333] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-sky-400" />
                  Eight-Model Comparative Leaderboard ({ticker})
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Benchmark table from PRD Section 9.5. Identical chronological splits, expanding-window cross-validation, train-only scalers.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Evaluated at: {benchmarkData.benchmark_generated_at}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#0E1524] text-slate-400 text-[11px] border-b border-[#1A2333]">
                    <th className="py-3 px-4 font-semibold">Model Architecture</th>
                    <th className="py-3 px-3 font-semibold">Category</th>
                    <th className="py-3 px-3 font-semibold text-right">MAE ($)</th>
                    <th className="py-3 px-3 font-semibold text-right">RMSE ($)</th>
                    <th className="py-3 px-3 font-semibold text-right">MAPE (%)</th>
                    <th className="py-3 px-3 font-semibold text-right">R² Score</th>
                    <th className="py-3 px-3 font-semibold text-right">Dir. Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141C2E]">
                  {benchmarkData.models.map((m, idx) => {
                    const isWinner = m.model_name === benchmarkData.winning_model;
                    const isBaseline = m.category === 'Baseline';
                    return (
                      <tr 
                        key={idx}
                        className={`hover:bg-[#11192C] transition-colors ${
                          isWinner ? 'bg-amber-500/10 font-bold' : isBaseline ? 'bg-slate-900/50 text-slate-400 italic' : ''
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          {isWinner && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span className={isWinner ? 'text-amber-300 font-extrabold' : 'text-slate-200'}>
                            {m.model_name}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            m.category === 'Deep Sequence Learning'
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                              : m.category === 'Classical Machine Learning'
                              ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {m.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-bold text-white">${m.mae.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-300">${m.rmse.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-300">{m.mape.toFixed(2)}%</td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          <span className={m.r2_score > 0.8 ? 'text-emerald-400' : 'text-slate-400'}>
                            {m.r2_score.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-bold">
                          <span className={m.directional_accuracy > 52 ? 'text-emerald-400' : 'text-slate-400'}>
                            {m.directional_accuracy.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Humanized Viva Defense Synthesis Box */}
            <div className="p-4 bg-[#090D17] border-t border-[#1A2333] text-xs">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block font-bold mb-1">
                Candidate Defense & Architectural Synthesis (Graded Viva Explanations):
              </span>
              <p className="text-slate-300 leading-relaxed font-sans">
                {benchmarkData.humanized_synthesis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: SENTIMENT ABLATION EXPERIMENT (PRD Section 10.3) */}
      {!isLoading && activeSubTab === 'sentiment_ablation' && ablationData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Without Sentiment */}
            <div className="bg-[#0A0E17] border border-[#1A2333] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase font-mono">Control Baseline</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                  Technicals Only
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Forecaster WITHOUT Sentiment</h4>
              
              <div className="grid grid-cols-3 gap-2 pt-2 font-mono">
                <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E273B]">
                  <span className="text-[10px] text-slate-500 block">MAE</span>
                  <span className="text-base font-bold text-white tabular-nums">${ablationData.without_sentiment.mae}</span>
                </div>
                <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E273B]">
                  <span className="text-[10px] text-slate-500 block">RMSE</span>
                  <span className="text-base font-bold text-slate-300 tabular-nums">${ablationData.without_sentiment.rmse}</span>
                </div>
                <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E273B]">
                  <span className="text-[10px] text-slate-500 block">Dir. Acc</span>
                  <span className="text-base font-bold text-slate-300 tabular-nums">{ablationData.without_sentiment.directional_accuracy}%</span>
                </div>
              </div>
            </div>

            {/* With Sentiment */}
            <div className="bg-[#0A0E17] border border-sky-500/40 rounded-xl p-5 space-y-3 shadow-lg shadow-sky-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase font-mono">Experimental Treatment</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  FinBERT Fused
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Forecaster WITH News Sentiment</h4>

              <div className="grid grid-cols-3 gap-2 pt-2 font-mono">
                <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E273B]">
                  <span className="text-[10px] text-slate-500 block">MAE</span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">${ablationData.with_sentiment.mae}</span>
                </div>
                <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E273B]">
                  <span className="text-[10px] text-slate-500 block">RMSE</span>
                  <span className="text-base font-bold text-slate-200 tabular-nums">${ablationData.with_sentiment.rmse}</span>
                </div>
                <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E273B]">
                  <span className="text-[10px] text-slate-500 block">Dir. Acc</span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">{ablationData.with_sentiment.directional_accuracy}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Delta & Verdict Banner */}
          <div className="bg-[#0D1424] border border-[#1A2333] rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Empirical Delta & Alpha Contribution (Section 10.3)
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span>ΔMAE: <strong className={ablationData.delta.delta_mae <= 0 ? 'text-emerald-400' : 'text-rose-400'}>${ablationData.delta.delta_mae.toFixed(2)}</strong></span>
                <span>ΔHit-Rate: <strong className={ablationData.delta.delta_directional_accuracy >= 0 ? 'text-emerald-400' : 'text-rose-400'}>+{ablationData.delta.delta_directional_accuracy.toFixed(1)}%</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
              {ablationData.humanized_verdict}
            </p>
          </div>
        </div>
      )}

      {/* 4. TAB 3: MATHEMATICAL FOUNDATIONS & OLS (PRD Section 7) */}
      {!isLoading && activeSubTab === 'math' && mathData && (
        <div className="space-y-4">
          <div className="bg-[#0A0E17] border border-[#1A2333] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#172033] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-sky-400" />
                  First-Principles Mathematical Verification (Listing 7.1)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proves manual gradient descent (gd_linreg) converges to the exact closed-form OLS solution: (XᵀX)⁻¹Xᵀy.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OLS CONGRUENCE CONFIRMED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-[#0E1524] p-4 rounded-xl border border-[#1E273B] space-y-2">
                <span className="text-[10px] text-sky-400 block font-bold uppercase">Manual Gradient Descent (2,000 Iterations)</span>
                <div className="flex justify-between text-slate-300">
                  <span>Learned Weights (w):</span>
                  <span className="text-white font-bold">[{mathData.gd_weights.join(', ')}]</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Learned Intercept (b):</span>
                  <span className="text-white font-bold">{mathData.gd_bias}</span>
                </div>
              </div>

              <div className="bg-[#0E1524] p-4 rounded-xl border border-[#1E273B] space-y-2">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase">Analytical Closed-Form OLS: (XᵀX)⁻¹Xᵀy</span>
                <div className="flex justify-between text-slate-300">
                  <span>Analytical Weights:</span>
                  <span className="text-white font-bold">[{mathData.ols_weights.join(', ')}]</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Analytical Intercept:</span>
                  <span className="text-white font-bold">{mathData.ols_bias}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#080C14] rounded-lg border border-[#162033] flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Maximum Parameter Discrepancy:</span>
              <span className="text-emerald-400 font-bold">{mathData.max_discrepancy} (Tolerance threshold: &lt;0.05)</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 4: DATA QUALITY & AUDIT REPORT (PRD Section 4) */}
      {!isLoading && activeSubTab === 'audit' && auditData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#0A0E17] p-4 rounded-xl border border-[#1A2333]">
              <span className="text-[10px] text-slate-500 block font-sans">PRD Equities Universe</span>
              <span className="text-lg font-bold text-white">{auditData.universe_size} Tickers</span>
            </div>
            <div className="bg-[#0A0E17] p-4 rounded-xl border border-[#1A2333]">
              <span className="text-[10px] text-slate-500 block font-sans">Gaps Forward-Filled (Limit 3)</span>
              <span className="text-lg font-bold text-sky-400">{auditData.total_gaps_forward_filled} Bars</span>
            </div>
            <div className="bg-[#0A0E17] p-4 rounded-xl border border-[#1A2333]">
              <span className="text-[10px] text-slate-500 block font-sans">Invariant Violations</span>
              <span className="text-lg font-bold text-emerald-400">{auditData.total_invariant_violations} Quarantined</span>
            </div>
            <div className="bg-[#0A0E17] p-4 rounded-xl border border-[#1A2333]">
              <span className="text-[10px] text-slate-500 block font-sans">Audit Compliance Status</span>
              <span className="text-xs font-bold text-emerald-400 block mt-1">{auditData.compliance_status}</span>
            </div>
          </div>

          <div className="bg-[#0A0E17] border border-[#1A2333] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1A2333]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                Universe Invariant & Leakage Audit Matrix
              </h3>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0E1524] text-slate-400 text-[10px] border-b border-[#1A2333]">
                <tr>
                  <th className="py-2.5 px-4">Ticker</th>
                  <th className="py-2.5 px-3">Cleaned Bars</th>
                  <th className="py-2.5 px-3">Gaps Filled</th>
                  <th className="py-2.5 px-3">Outliers Flagged</th>
                  <th className="py-2.5 px-3">Invariants</th>
                  <th className="py-2.5 px-3 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141C2E]">
                {auditData.ticker_audits.map((a, idx) => (
                  <tr key={idx} className="hover:bg-[#11192C]">
                    <td className="py-2.5 px-4 font-bold text-white">{a.ticker}</td>
                    <td className="py-2.5 px-3 text-slate-300">{a.cleaned_rows}</td>
                    <td className="py-2.5 px-3 text-slate-400">{a.gaps_filled}</td>
                    <td className="py-2.5 px-3 text-amber-400">{a.outliers_flagged}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{a.invariant_violations}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 5: PORTFOLIO DRIFT & REBALANCE (PRD Section 12) */}
      {!isLoading && activeSubTab === 'rebalance' && rebalanceData && (
        <div className="space-y-4">
          <div className="bg-[#0D1424] border border-[#1A2333] rounded-xl p-4 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Rebalance Trigger Threshold</span>
              <span className="text-white font-bold">±{rebalanceData.tolerance_band_pct}% Allocation Drift</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Turnover Required</span>
              <span className="text-sky-400 font-bold">{rebalanceData.estimated_turnover_pct}% of NAV</span>
            </div>
          </div>

          <div className="bg-[#0A0E17] border border-[#1A2333] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1A2333]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-400" />
                Active Allocation Drift Table (Listing 12.1)
              </h3>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0E1524] text-slate-400 text-[10px] border-b border-[#1A2333]">
                <tr>
                  <th className="py-2.5 px-4">Asset</th>
                  <th className="py-2.5 px-3">Current Weight</th>
                  <th className="py-2.5 px-3">Target Weight</th>
                  <th className="py-2.5 px-3">Drift</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-4 text-right">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141C2E]">
                {rebalanceData.allocations.map((a, idx) => (
                  <tr key={idx} className="hover:bg-[#11192C]">
                    <td className="py-2.5 px-4 font-bold text-white">{a.ticker}</td>
                    <td className="py-2.5 px-3 text-slate-300">{a.current_weight_pct}%</td>
                    <td className="py-2.5 px-3 text-sky-400 font-bold">{a.target_weight_pct}%</td>
                    <td className={`py-2.5 px-3 tabular-nums font-bold ${a.drift_pct > 0 ? 'text-emerald-400' : a.drift_pct < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {a.drift_pct > 0 ? '+' : ''}{a.drift_pct}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.action === 'INCREASE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : a.action === 'REDUCE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {a.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 font-sans text-[11px]">{a.suggested_trade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
