import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Target, 
  Percent, 
  Brain,
  Scale
} from 'lucide-react';

export default function RecommendationCard({ recommendation, quote }) {
  if (!recommendation) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 animate-pulse text-center">
        <div className="h-6 bg-slate-800 rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-slate-800/60 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  const {
    recommendation: rating,
    confidence_score,
    risk_level,
    target_price_7d,
    target_price_30d,
    potential_upside_pct,
    stop_loss_price,
    risk_reward_ratio,
    signals,
    summary_analysis,
    ai_thesis,
    last_updated
  } = recommendation;

  const currentPrice = quote?.current_price || recommendation.current_price;

  const getRatingStyles = (r) => {
    switch (r) {
      case 'STRONG BUY':
        return {
          bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30',
          glow: 'glow-emerald',
          icon: TrendingUp
        };
      case 'BUY':
        return {
          bg: 'from-teal-500/20 to-cyan-500/10 border-teal-500/40 text-teal-300',
          badge: 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25',
          glow: 'glow-emerald',
          icon: TrendingUp
        };
      case 'STRONG SELL':
        return {
          bg: 'from-rose-500/20 to-red-500/10 border-rose-500/50 text-rose-400',
          badge: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
          glow: 'glow-rose',
          icon: TrendingDown
        };
      case 'SELL':
        return {
          bg: 'from-orange-500/20 to-rose-500/10 border-orange-500/40 text-orange-300',
          badge: 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/25',
          glow: 'glow-rose',
          icon: TrendingDown
        };
      default:
        return {
          bg: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300',
          badge: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25',
          glow: 'glow-cyan',
          icon: AlertTriangle
        };
    }
  };

  const styles = getRatingStyles(rating);
  const RatingIcon = styles.icon;

  const getRiskBadge = (risk) => {
    if (risk === 'Low') return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    if (risk === 'Moderate') return 'bg-cyan-950 text-cyan-400 border-cyan-800';
    if (risk === 'High') return 'bg-orange-950 text-orange-400 border-orange-800';
    return 'bg-rose-950 text-rose-400 border-rose-800';
  };

  return (
    <div className="space-y-6">
      {/* Primary Decision Banner */}
      <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${styles.bg} p-6 sm:p-8 backdrop-blur-xl ${styles.glow}`}>
        
        {/* Background accent icon */}
        <div className="absolute right-4 -bottom-6 opacity-5 pointer-events-none select-none">
          <RatingIcon className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Rating Title & Confidence */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full font-black text-sm tracking-wider uppercase ${styles.badge}`}>
                {rating}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadge(risk_level)}`}>
                Risk Level: {risk_level}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{recommendation.ticker}</span>
              <span className="text-slate-400 font-normal text-xl sm:text-2xl">· {recommendation.company_name}</span>
            </h2>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {summary_analysis}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            
            {/* Current Price */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Price</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">${currentPrice.toFixed(2)}</span>
            </div>

            {/* 30D Target */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">30D Target</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">${target_price_30d.toFixed(2)}</span>
              <span className={`text-[11px] font-bold block ${potential_upside_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {potential_upside_pct >= 0 ? '+' : ''}{potential_upside_pct.toFixed(1)}%
              </span>
            </div>

            {/* Suggested Stop Loss */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Stop Loss</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">${stop_loss_price.toFixed(2)}</span>
              <span className="text-[11px] text-slate-500 font-semibold block">2x ATR Floor</span>
            </div>

            {/* AI Confidence */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">AI Confidence</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{confidence_score}%</span>
              <span className="text-[11px] text-slate-400 font-semibold block">Consensus Score</span>
            </div>

          </div>
        </div>

        {/* AI Investment Thesis */}
        <div className="mt-6 pt-5 border-t border-slate-800/70">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Autonomous Synthesis & Investment Thesis
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {ai_thesis}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Factor Signal Breakdown Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          Multi-Factor Decision Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signals.map((factor, idx) => {
            const isPos = factor.score > 0;
            const isNeg = factor.score < 0;
            return (
              <div 
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {factor.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      factor.signal.includes('Buy') 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : factor.signal.includes('Sell')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {factor.signal}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm mb-2">{factor.factor_name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{factor.explanation}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Factor Weight: {(factor.weight * 100).toFixed(0)}%</span>
                  <span className={`font-mono font-bold ${
                    isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {factor.score > 0 ? '+' : ''}{factor.score.toFixed(0)} / 100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
