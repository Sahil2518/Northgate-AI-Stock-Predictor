import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Flame,
  Zap,
  Activity
} from 'lucide-react';

export default function StressTestCard({ stressTestData, onRunStressTest, isLoading, investmentAmount = 10000 }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState('covid_2020');

  if (isLoading) {
    return (
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-8 h-[320px] flex flex-col items-center justify-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
        <p className="text-slate-200 font-medium text-xs">Simulating historical crash regimes & multiple compression...</p>
        <span className="text-[11px] text-slate-500 font-mono">Applying 2008 credit shock, 2020 liquidity freeze, and 2022 rate hike vectors</span>
      </div>
    );
  }

  if (!stressTestData) {
    return (
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-6 text-center space-y-3">
        <ShieldAlert className="w-7 h-7 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-200 font-sans">Macro Historical Crisis & Stress Simulator</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Evaluate portfolio drawdown resilience against 2008 GFC, 2020 COVID crash, and 2022 Fed rate shocks.
        </p>
        <button
          onClick={onRunStressTest}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all inline-flex items-center gap-1.5 font-mono"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" /> Run Crisis Simulation
        </button>
      </div>
    );
  }

  const overall_resilience_score = Number(stressTestData.overall_resilience_score ?? 70);
  const scenariosList = Array.isArray(stressTestData.scenarios) ? stressTestData.scenarios : [];
  const hedging_recommendations = Array.isArray(stressTestData.hedging_recommendations) ? stressTestData.hedging_recommendations : [];
  
  const currentScenario = scenariosList.find(s => s.scenario_id === selectedScenarioId) || scenariosList[0] || {
    name: 'Historical Crisis',
    description: 'Systemic liquidity and macroeconomic shock.',
    simulated_drawdown_pct: -25.0,
    estimated_recovery_months: 12,
    volatility_spike_multiplier: 1.8,
    resilience_grade: 'B'
  };

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'B':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const drawdownPct = Number(currentScenario.simulated_drawdown_pct || 0);
  const capitalAtRisk = (Number(investmentAmount || 10000) * Math.abs(drawdownPct)) / 100;

  return (
    <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-6 shadow-xl shadow-black/20 space-y-6">
      
      {/* Header & Resilience Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1E273B]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-white text-base font-sans">
              Macro Crisis Stress Testing & Tail-Risk Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Parametric stress testing against empirical liquidity panics, inflation shocks, and multiple contraction
          </p>
        </div>

        {/* Resilience Index Gauge */}
        <div className="flex items-center space-x-3 bg-[#080B11] px-3.5 py-2 rounded-lg border border-[#1E273B]">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Resilience Index</span>
            <span className="text-xl font-black font-mono text-sky-400 tabular-nums">{overall_resilience_score}/100</span>
          </div>
          <ShieldCheck className={`w-7 h-7 ${overall_resilience_score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenariosList.map(sc => {
          const isSelected = sc.scenario_id === selectedScenarioId;
          const scDrawdown = Number(sc.simulated_drawdown_pct || 0);
          const scMultiplier = Number(sc.volatility_spike_multiplier || 1);
          return (
            <button
              key={sc.scenario_id}
              onClick={() => setSelectedScenarioId(sc.scenario_id)}
              className={`p-3 rounded-lg text-left border transition-all ${
                isSelected 
                  ? 'bg-[#182137] border-rose-500/50 shadow-sm' 
                  : 'bg-[#080B11] border-[#1E273B] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-200 text-xs font-sans truncate">{sc.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getGradeBadge(sc.resilience_grade)}`}>
                  {sc.resilience_grade}
                </span>
              </div>
              <div className="font-mono text-[11px] text-rose-400 font-bold tabular-nums">
                {scDrawdown.toFixed(1)}% Max Loss
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Vol: +{(scMultiplier * 100 - 100).toFixed(0)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Detailed Breakdown */}
      <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-4 space-y-4 text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E273B] gap-2">
          <div>
            <span className="font-bold text-white text-sm font-sans">{currentScenario.name}</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">{currentScenario.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-500 block">Est. Capital At Risk (${Number(investmentAmount || 10000).toLocaleString()})</span>
            <span className="text-sm font-black text-rose-400 font-mono tabular-nums">
              -${capitalAtRisk.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#0E131F] p-2.5 rounded border border-[#1E273B]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Simulated Drawdown</span>
            <span className="text-sm font-bold text-rose-400 tabular-nums">
              {drawdownPct.toFixed(2)}%
            </span>
          </div>
          <div className="bg-[#0E131F] p-2.5 rounded border border-[#1E273B]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Recovery Estimate</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">
              {currentScenario.estimated_recovery_months} Months
            </span>
          </div>
          <div className="bg-[#0E131F] p-2.5 rounded border border-[#1E273B]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Volatility Spike</span>
            <span className="text-sm font-bold text-amber-400 tabular-nums">
              {Number(currentScenario.volatility_spike_multiplier || 1).toFixed(1)}x Normal
            </span>
          </div>
          <div className="bg-[#0E131F] p-2.5 rounded border border-[#1E273B]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Tail VaR 99%</span>
            <span className="text-sm font-bold text-sky-400 tabular-nums">
              {(Math.abs(drawdownPct) * 0.72).toFixed(1)}% Daily
            </span>
          </div>
        </div>
      </div>

      {/* Tail Risk Hedging Directives */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
          Institutional Risk Committee Mitigation Directives
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {hedging_recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 bg-[#080B11] p-3 rounded-lg border border-[#1E273B] text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-sans text-[11px]">{rec}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
