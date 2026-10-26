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
  Zap
} from 'lucide-react';

export default function StressTestCard({ stressTestData, onRunStressTest, isLoading, investmentAmount = 10000 }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState('covid_2020');

  if (isLoading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 h-[340px] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 animate-pulse" />
        <p className="text-slate-300 font-medium text-sm">Simulating black-swan and historical crisis stress regimes...</p>
        <span className="text-xs text-slate-500">Injecting 2008 credit shock, 2020 COVID flash crash, and 2022 rate hike drawdown</span>
      </div>
    );
  }

  if (!stressTestData) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300">Historical Crisis & Stress Testing</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Simulate how your current asset allocation holds up against historical market crashes.
        </p>
        <button
          onClick={onRunStressTest}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all inline-flex items-center gap-1.5"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" /> Run Crisis Simulation
        </button>
      </div>
    );
  }

  const { overall_resilience_score, scenarios, hedging_recommendations } = stressTestData;
  const currentScenario = scenarios.find(s => s.scenario_id === selectedScenarioId) || scenarios[0];

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'B':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-white text-lg">Crisis Stress Testing & Tail-Risk Simulation</h3>
          </div>
          <p className="text-xs text-slate-400">
            Stress-tests your portfolio against historical systemic panics, liquidity shocks, and multiple compression.
          </p>
        </div>

        {/* Overall Resilience Score Gauge */}
        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resilience Index</span>
            <span className="text-2xl font-black font-mono text-cyan-400">{overall_resilience_score}/100</span>
          </div>
          <ShieldCheck className={`w-8 h-8 ${overall_resilience_score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarios.map(sc => {
          const isSelected = sc.scenario_id === selectedScenarioId;
          return (
            <button
              key={sc.scenario_id}
              onClick={() => setSelectedScenarioId(sc.scenario_id)}
              className={`p-3 rounded-2xl text-left border transition-all ${
                isSelected 
                  ? 'bg-slate-800 border-rose-500/60 shadow-lg shadow-rose-500/10' 
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-200 line-clamp-1">{sc.name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getGradeBadge(sc.resilience_grade)}`}>
                  {sc.resilience_grade}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-rose-400">
                {sc.portfolio_drawdown_pct}% Drawdown
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Scenario Breakdown */}
      {currentScenario && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{currentScenario.name}</h4>
              <span className="text-[11px] text-slate-500 font-mono">Historical Benchmark: {currentScenario.historical_benchmark}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getGradeBadge(currentScenario.resilience_grade)}`}>
                Grade {currentScenario.resilience_grade}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Projected Drawdown</span>
              <span className="text-xl font-black text-rose-400 font-mono">{currentScenario.portfolio_drawdown_pct}%</span>
              <span className="text-[10px] text-slate-500 block">Peak-to-Trough Shock</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Est. Capital Drawdown</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                -${currentScenario.estimated_dollar_loss.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">On ${investmentAmount.toLocaleString()} capital</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Recovery Timeline</span>
              <span className="text-xl font-black text-cyan-400 font-mono">{currentScenario.recovery_months_est} Mos</span>
              <span className="text-[10px] text-slate-500 block">Historical Mean Recovery</span>
            </div>

          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
            <span className="text-slate-300 font-semibold">Crisis Mechanics: </span>
            {currentScenario.vulnerability_notes}
          </p>
        </div>
      )}

      {/* Tailored Hedging Recommendations */}
      {hedging_recommendations && hedging_recommendations.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Institutional Risk Hedging Guidance:
          </span>
          <div className="space-y-1.5">
            {hedging_recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
