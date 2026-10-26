import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TickerBar({ watchlist = [], currentTicker, onSelectTicker }) {
  if (!watchlist || watchlist.length === 0) return null;

  return (
    <div className="bg-[#080B11] border-b border-[#1E273B] py-1.5 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-3 text-xs">
        
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          FEED:
        </span>

        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none py-0.5">
          {watchlist.map((item) => {
            const isPositive = (item.change_percent ?? 0) >= 0;
            const isSelected = item.ticker === currentTicker;
            return (
              <button
                key={item.ticker}
                onClick={() => onSelectTicker(item.ticker)}
                className={`flex items-center space-x-2 px-2 py-0.5 rounded transition-all shrink-0 font-mono text-[11px] ${
                  isSelected 
                    ? 'bg-[#182137] text-white border border-[#2A3650]' 
                    : 'hover:bg-[#0E131F] text-slate-300 border border-transparent'
                }`}
              >
                <span className="font-bold text-slate-100">{item.ticker}</span>
                <span className="text-slate-400 tabular-nums">{item.currency_symbol || (item.currency === 'USD' ? '$' : '₹')}{item.current_price.toFixed(2)}</span>
                <span className={`flex items-center font-semibold tabular-nums text-[10px] ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isPositive ? '+' : ''}{(item.change_percent ?? 0).toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
