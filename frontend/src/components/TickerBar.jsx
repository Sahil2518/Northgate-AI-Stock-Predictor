import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TickerBar({ watchlist = [], currentTicker, onSelectTicker }) {
  if (!watchlist || watchlist.length === 0) return null;

  return (
    <div className="bg-slate-950/60 border-b border-slate-800/80 py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          MARKETS LIVE:
        </span>
        <div className="flex items-center space-x-6 overflow-x-auto">
          {watchlist.map((item) => {
            const isPositive = item.change >= 0;
            const isSelected = item.ticker === currentTicker;
            return (
              <button
                key={item.ticker}
                onClick={() => onSelectTicker(item.ticker)}
                className={`flex items-center space-x-2 text-xs py-1 px-2.5 rounded-lg transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-slate-800 border border-cyan-500/50 shadow-sm' 
                    : 'hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <span className="font-bold text-slate-200">{item.ticker}</span>
                <span className="text-slate-300 font-mono">${item.current_price.toFixed(2)}</span>
                <span className={`flex items-center font-semibold text-[11px] ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{item.change_percent.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
