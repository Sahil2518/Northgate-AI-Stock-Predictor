import React from 'react';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink, 
  Clock, 
  Radio
} from 'lucide-react';

export default function SentimentView({ sentimentData, ticker = 'AAPL', isLoading }) {
  const articlesList = Array.isArray(sentimentData?.articles) ? sentimentData.articles : [];

  if (isLoading || !sentimentData) {
    return (
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-8 h-[380px] flex flex-col items-center justify-center space-y-3">
        <Newspaper className="w-8 h-8 text-sky-400 animate-pulse" />
        <p className="text-slate-200 font-medium text-xs">Aggregating real-time financial news & corporate filings...</p>
        <span className="text-[11px] text-slate-500 font-mono">Applying VADER financial lexicon sentiment classifier</span>
      </div>
    );
  }

  const compound_score = Number(sentimentData.compound_score ?? 0);
  const sentiment_label = sentimentData.sentiment_label || 'Neutral';
  const bullish_pct = Number(sentimentData.bullish_pct ?? 33);
  const neutral_pct = Number(sentimentData.neutral_pct ?? 34);
  const bearish_pct = Number(sentimentData.bearish_pct ?? 33);
  const articles_count = Number(sentimentData.articles_count || articlesList.length);
  const sentiment_trend = sentimentData.sentiment_trend || 'Steady';

  const getLabelBadge = (label) => {
    if (typeof label === 'string' && label.includes('Bullish')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (typeof label === 'string' && label.includes('Bearish')) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const getScoreColor = (score) => {
    if (score > 0.15) return 'text-emerald-400';
    if (score < -0.15) return 'text-rose-400';
    return 'text-amber-400';
  };

  return (
    <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-6 shadow-xl shadow-black/20 space-y-6">
      
      {/* Header & Polarity Score */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#1E273B]">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-base font-sans">
              Financial News & NLP Sentiment Velocity
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time corporate news headline analysis calibrated with institutional financial lexicons for {ticker}
          </p>
        </div>

        {/* Polarity Metric Box */}
        <div className="flex items-center gap-4 bg-[#080B11] px-4 py-2 rounded-lg border border-[#1E273B]">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Compound Polarity</span>
            <span className={`text-xl font-bold font-mono tabular-nums ${getScoreColor(compound_score)}`}>
              {compound_score > 0 ? '+' : ''}{compound_score.toFixed(2)}
            </span>
          </div>

          <div className="border-l border-[#1E273B] pl-4">
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border inline-block ${getLabelBadge(sentiment_label)}`}>
              {sentiment_label}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Flow: {sentiment_trend}</span>
          </div>
        </div>
      </div>

      {/* Distribution Ratio Bar */}
      <div className="space-y-2 bg-[#080B11] p-3.5 rounded-lg border border-[#1E273B]">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Bullish {bullish_pct}%
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Minus className="w-3.5 h-3.5" /> Neutral {neutral_pct}%
          </span>
          <span className="text-rose-400 flex items-center gap-1 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" /> Bearish {bearish_pct}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-[#182137] overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${bullish_pct}%` }} />
          <div className="bg-slate-600 h-full transition-all duration-500" style={{ width: `${neutral_pct}%` }} />
          <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${bearish_pct}%` }} />
        </div>
      </div>

      {/* Live Financial Headline Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] font-mono">
            Analyzed Media Articles ({articles_count})
          </span>
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Feed
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {articlesList.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-mono">
              No recent news articles ingested. Feed is synchronizing.
            </div>
          ) : (
            articlesList.map((art, idx) => {
              const isBullish = art.sentiment === 'Bullish';
              const isBearish = art.sentiment === 'Bearish';
              const artScore = Number(art.score ?? 0);
              return (
                <div 
                  key={idx}
                  className="bg-[#080B11] border border-[#1E273B] hover:border-[#2A3650] rounded-lg p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <a
                      href={art.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-200 hover:text-sky-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{art.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                    </a>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span className="text-slate-400">{art.publisher || 'Financial Wire'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {art.published_at || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isBullish 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : isBearish 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {art.sentiment || 'Neutral'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {artScore > 0 ? '+' : ''}{artScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
