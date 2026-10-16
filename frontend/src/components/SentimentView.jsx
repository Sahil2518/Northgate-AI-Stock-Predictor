import React from 'react';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  BarChart2,
  Sparkles
} from 'lucide-react';

export default function SentimentView({ sentimentData, ticker, isLoading }) {
  if (isLoading || !sentimentData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 h-[400px] flex flex-col items-center justify-center space-y-4">
        <Newspaper className="w-12 h-12 text-cyan-400 animate-pulse" />
        <p className="text-slate-300 font-medium text-sm">Aggregating live financial news and calculating NLP sentiment...</p>
      </div>
    );
  }

  const {
    compound_score,
    sentiment_label,
    bullish_pct,
    neutral_pct,
    bearish_pct,
    articles_count,
    sentiment_trend,
    articles
  } = sentimentData;

  const getLabelColor = (label) => {
    if (label.includes('Bullish')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (label.includes('Bearish')) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const getScoreColor = (score) => {
    if (score > 0.15) return 'text-emerald-400';
    if (score < -0.15) return 'text-rose-400';
    return 'text-amber-400';
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Newspaper className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-white text-lg">Financial News & NLP Sentiment Velocity</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Natural Language Processing sentiment engine using VADER financial lexicon to analyze real-time headlines and regulatory filings for {ticker}.
            </p>
          </div>

          {/* Compound Score Metric Box */}
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Compound Polarity</span>
              <span className={`text-2xl font-black font-mono ${getScoreColor(compound_score)}`}>
                {compound_score > 0 ? '+' : ''}{compound_score.toFixed(2)}
              </span>
            </div>

            <div className="border-l border-slate-800 pl-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${getLabelColor(sentiment_label)}`}>
                {sentiment_label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Trend: {sentiment_trend}</span>
            </div>
          </div>

        </div>

        {/* Sentiment Distribution Ratio Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Bullish ({bullish_pct}%)
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Minus className="w-3.5 h-3.5" /> Neutral ({neutral_pct}%)
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Bearish ({bearish_pct}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
            <div 
              style={{ width: `${bullish_pct}%` }} 
              className="bg-emerald-500 transition-all duration-500" 
              title={`Bullish: ${bullish_pct}%`}
            />
            <div 
              style={{ width: `${neutral_pct}%` }} 
              className="bg-slate-600 transition-all duration-500" 
              title={`Neutral: ${neutral_pct}%`}
            />
            <div 
              style={{ width: `${bearish_pct}%` }} 
              className="bg-rose-500 transition-all duration-500" 
              title={`Bearish: ${bearish_pct}%`}
            />
          </div>
        </div>

      </div>

      {/* Analyzed Articles Feed */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Real-Time Analyzed Headline Feeds ({articles.length} Reports)
        </h4>

        <div className="space-y-3">
          {articles.map((item, idx) => {
            const isBullish = item.sentiment_label === 'Bullish';
            const isBearish = item.sentiment_label === 'Bearish';
            return (
              <div 
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-300">{item.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {item.published_at}
                    </span>
                  </div>

                  <h5 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug">
                    {item.title}
                  </h5>

                  {item.summary && (
                    <p className="text-xs text-slate-400 font-sans">{item.summary}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${
                      isBullish 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : isBearish 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {item.sentiment_label}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold block mt-0.5 ${getScoreColor(item.sentiment_score)}`}>
                      Score: {item.sentiment_score > 0 ? '+' : ''}{item.sentiment_score.toFixed(2)}
                    </span>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/60"
                    title="Open article"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
