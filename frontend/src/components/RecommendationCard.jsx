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
  Scale, 
  Briefcase, 
  Zap,
  Activity,
  Newspaper,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function RecommendationCard({ recommendation, quote, onOpenPaperTrade }) {
  if (!recommendation) {
    return (
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-8 animate-pulse text-center space-y-3">
        <div className="h-5 bg-[#182137] rounded w-1/4 mx-auto" />
        <div className="h-4 bg-[#182137]/60 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  const rating = typeof recommendation.recommendation === 'string' 
    ? recommendation.recommendation 
    : 'HOLD';
  const confidence_score = Number(recommendation.confidence_score ?? 75);
  const risk_level = recommendation.risk_level || 'Moderate';
  
  const currentPrice = Number(quote?.current_price || recommendation.current_price || 0);
  const target_price_7d = Number(recommendation.target_price_7d || currentPrice);
  const target_price_30d = Number(recommendation.target_price_30d || currentPrice);
  const potential_upside_pct = Number(recommendation.potential_upside_pct || 0);
  const stop_loss_price = Number(recommendation.stop_loss_price || (currentPrice * 0.95));
  const risk_reward_ratio = Number(recommendation.risk_reward_ratio || 2.0);
  
  const signals = recommendation.signals || {};
  const summary_analysis = recommendation.summary_analysis || 'Quantitative multi-factor analysis computed.';

  // Refined institutional badge styling
  const getRatingBadge = (r) => {
    switch (r) {
      case 'STRONG BUY':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          indicator: 'bg-emerald-400',
          icon: TrendingUp,
          text: 'STRONG BUY'
        };
      case 'BUY':
        return {
          pill: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
          indicator: 'bg-teal-400',
          icon: TrendingUp,
          text: 'BUY'
        };
      case 'STRONG SELL':
        return {
          pill: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          indicator: 'bg-rose-400',
          icon: TrendingDown,
          text: 'STRONG SELL'
        };
      case 'SELL':
        return {
          pill: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
          indicator: 'bg-orange-400',
          icon: TrendingDown,
          text: 'SELL'
        };
      default:
        return {
          pill: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          indicator: 'bg-amber-400',
          icon: AlertTriangle,
          text: 'HOLD'
        };
    }
  };

  const badge = getRatingBadge(rating);
  const isPositiveUpside = potential_upside_pct >= 0;

  return (
    <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-6 shadow-xl shadow-black/20 space-y-6">
      
      {/* Top Advisory Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1E273B]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${badge.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.indicator}`} />
              {badge.text}
            </span>

            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-[#080B11] text-slate-300 border border-[#1E273B]">
              Conviction: <strong className="text-white">{confidence_score}%</strong>
            </span>

            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-[#080B11] text-slate-300 border border-[#1E273B]">
              Risk: <strong className={risk_level === 'High' ? 'text-rose-400' : 'text-slate-200'}>{risk_level}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
            Quantitative Investment Thesis & Signal Consensus
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
            {summary_analysis}
          </p>
        </div>

        {/* 1-Click Action to Paper Broker */}
        {onOpenPaperTrade && (
          <div className="shrink-0">
            <button
              onClick={() => onOpenPaperTrade(recommendation)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 font-sans shadow-md hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Route Order to Paper Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Target Price & Risk-to-Reward Execution Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Current Quote */}
        <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            Reference Price
          </span>
          <span className="text-base sm:text-lg font-black text-white font-mono tabular-nums">
            ${currentPrice > 0 ? currentPrice.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Spot Market</span>
        </div>

        {/* 7-Day Target */}
        <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            7-Day Target
          </span>
          <span className="text-base sm:text-lg font-black text-sky-400 font-mono tabular-nums">
            ${target_price_7d > 0 ? target_price_7d.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Short Horizon</span>
        </div>

        {/* 30-Day Target */}
        <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            30-Day Target
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tabular-nums">
            ${target_price_30d > 0 ? target_price_30d.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Primary Target</span>
        </div>

        {/* Forecasted Upside */}
        <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            Forecast Return
          </span>
          <span className={`text-base sm:text-lg font-black font-mono tabular-nums ${
            isPositiveUpside ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isPositiveUpside ? '+' : ''}{potential_upside_pct.toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Expected Return</span>
        </div>

        {/* Stop Loss Floor */}
        <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            Stop-Loss Floor
          </span>
          <span className="text-base sm:text-lg font-black text-rose-400 font-mono tabular-nums">
            ${stop_loss_price > 0 ? stop_loss_price.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">2.0x ATR Buffer</span>
        </div>

        {/* Risk / Reward Ratio */}
        <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            Risk / Reward
          </span>
          <span className="text-base sm:text-lg font-black text-sky-400 font-mono tabular-nums">
            {risk_reward_ratio.toFixed(2)} : 1
          </span>
          <span className="text-[10px] text-slate-500 block">Upside vs Risk</span>
        </div>

      </div>

      {/* 4-Pillar Quantitative Scorecard Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Consensus Signal Decomposition</span>
          <span className="text-[11px] text-slate-500 font-mono font-normal">Weights: AI 35% · News 25% · Tech 25% · Risk 15%</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Pillar 1: AI Return */}
          <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Brain className="w-3.5 h-3.5 text-sky-400" />
                AI Model Forecast
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {signals?.ai_return !== undefined ? `${signals.ai_return > 0 ? '+' : ''}${Number(signals.ai_return).toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="w-full bg-[#182137] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-sky-400 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.max(10, (signals?.ai_return || 0) * 5 + 50))}%` }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 block">PyTorch LSTM + XGBoost Ensemble</span>
          </div>

          {/* Pillar 2: News Sentiment */}
          <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                News Sentiment
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {signals?.sentiment_score !== undefined ? `${signals.sentiment_score > 0 ? '+' : ''}${Number(signals.sentiment_score).toFixed(2)}` : '0.00'}
              </span>
            </div>
            <div className="w-full bg-[#182137] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.max(10, ((signals?.sentiment_score || 0) + 1) * 50))}%` }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 block">VADER Polarity & Catalyst Flow</span>
          </div>

          {/* Pillar 3: Technical Oscillators */}
          <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Technical Trend
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {signals?.technical_score !== undefined ? `${Number(signals.technical_score).toFixed(0)}/100` : '—'}
              </span>
            </div>
            <div className="w-full bg-[#182137] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-400 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.max(10, signals?.technical_score || 50))}%` }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 block">RSI, MACD & Moving Averages</span>
          </div>

          {/* Pillar 4: Risk & Volatility */}
          <div className="bg-[#080B11] border border-[#1E273B] rounded-lg p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Risk Profile
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {risk_level} Risk
              </span>
            </div>
            <div className="w-full bg-[#182137] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full" 
                style={{ width: risk_level === 'Low' ? '30%' : risk_level === 'Moderate' ? '60%' : '85%' }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 block">ATR Volatility & Drawdown Tail</span>
          </div>

        </div>
      </div>

    </div>
  );
}
