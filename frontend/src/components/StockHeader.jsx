import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Briefcase, 
  Copy, 
  Check, 
  Share2, 
  BarChart2, 
  TrendingUp, 
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';

export default function StockHeader({ 
  quote, 
  currentTicker, 
  recommendation, 
  onOpenPaperTrade, 
  onRefresh, 
  isLoading 
}) {
  const [copied, setCopied] = useState(false);
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, text: 'Market Closed', estTime: '' });

  // Calculate US Market Session (NYSE / NASDAQ hours: 09:30 - 16:00 EST, Mon-Fri)
  useEffect(() => {
    const updateMarketStatus = () => {
      try {
        const now = new Date();
        const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
        const estDate = new Date(estStr);
        const day = estDate.getDay(); // 0 is Sun, 6 is Sat
        const hours = estDate.getHours();
        const minutes = estDate.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        // 9:30 AM = 570 mins, 4:00 PM = 960 mins
        const isWeekday = day >= 1 && day <= 5;
        const isOpen = isWeekday && totalMinutes >= 570 && totalMinutes < 960;
        const isPreMarket = isWeekday && totalMinutes >= 240 && totalMinutes < 570;
        const isPostMarket = isWeekday && totalMinutes >= 960 && totalMinutes < 1200;

        let statusText = 'Closed';
        if (isOpen) {
          const minsToClose = 960 - totalMinutes;
          const h = Math.floor(minsToClose / 60);
          const m = minsToClose % 60;
          statusText = `Open · Closes in ${h}h ${m}m`;
        } else if (isPreMarket) {
          statusText = 'Pre-Market Session';
        } else if (isPostMarket) {
          statusText = 'After-Hours Session';
        } else {
          statusText = 'Weekend / Closed';
        }

        const formattedTime = estDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          timeZoneName: 'short' 
        });

        setMarketStatus({ isOpen, text: statusText, estTime: formattedTime });
      } catch (e) {
        setMarketStatus({ isOpen: false, text: 'US Equity Hours', estTime: 'EST' });
      }
    };

    updateMarketStatus();
    const timer = setInterval(updateMarketStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyTicker = () => {
    navigator.clipboard.writeText(currentTicker);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const price = quote?.current_price ?? 0;
  const change = quote?.change ?? 0;
  const changePct = quote?.change_percent ?? 0;
  const isPositive = change >= 0;

  // 52-Week Range Calculations
  const low52 = quote?.fifty_two_week_low || price * 0.75;
  const high52 = quote?.fifty_two_week_high || price * 1.25;
  const range52Percent = high52 > low52 
    ? Math.min(100, Math.max(0, ((price - low52) / (high52 - low52)) * 100))
    : 50;

  // Format Large Currency (Market Cap)
  const formatMarketCap = (val) => {
    if (!val) return '—';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  // Format Volume
  const formatVolume = (val) => {
    if (!val) return '—';
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-lg shadow-black/20">
      
      {/* Top Meta Line: Exchange, Sector, Market Clock, Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1E273B]/80 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-[#182137] text-slate-200 font-semibold border border-[#242E42] tracking-wider text-[11px]">
            NASDAQ
          </span>
          <span className="text-slate-500 font-mono">USD</span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {quote?.company_name || currentTicker}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Equity Asset</span>
        </div>

        {/* Live Market Clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#080B11] px-2.5 py-1 rounded-md border border-[#1E273B]">
            <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-medium text-slate-300 text-[11px]">{marketStatus.text}</span>
            <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">({marketStatus.estTime})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyTicker}
              title="Copy Ticker Symbol"
              className="p-1.5 rounded-md hover:bg-[#182137] text-slate-400 hover:text-slate-200 border border-[#1E273B] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh Market Data"
                className={`p-1.5 rounded-md hover:bg-[#182137] text-slate-400 hover:text-slate-200 border border-[#1E273B] transition-colors ${isLoading ? 'animate-spin text-sky-400' : ''}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Stock Price & Core Indicators Row */}
      <div className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Ticker & Massive Tabular Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              {currentTicker}
            </h1>
            <span className="text-slate-400 text-sm font-medium truncate max-w-xs sm:max-w-md">
              {quote?.company_name || 'Loading Asset Name...'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums tracking-tight">
              ${price.toFixed(2)}
            </span>

            <div className={`flex items-center gap-1 text-sm sm:text-base font-semibold font-mono tabular-nums px-2.5 py-0.5 rounded-md ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}${Math.abs(change).toFixed(2)}</span>
              <span>({isPositive ? '+' : ''}{changePct.toFixed(2)}%)</span>
              <span className="text-[10px] text-slate-400 font-sans uppercase ml-1">Today</span>
            </div>

            {recommendation && (
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-sans uppercase tracking-wider ${
                  recommendation.recommendation.includes('BUY')
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : recommendation.recommendation.includes('SELL')
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-amber-500 text-slate-950'
                }`}>
                  {recommendation.recommendation}
                </span>

                {onOpenPaperTrade && (
                  <button
                    onClick={() => onOpenPaperTrade(recommendation)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-[#182137] text-sky-300 hover:bg-[#202c49] border border-sky-500/30 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                    <span>Quick Trade</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 52-Week Range Visual Slider */}
        <div className="w-full lg:w-80 bg-[#080B11] border border-[#1E273B] rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
            <span>52-Week Range</span>
            <span className="font-mono text-slate-300">
              ${low52.toFixed(2)} — ${high52.toFixed(2)}
            </span>
          </div>

          <div className="relative w-full h-2 bg-[#182137] rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500/70 via-amber-500/70 to-emerald-500/80 rounded-full"
              style={{ width: '100%' }}
            />
          </div>

          <div className="relative w-full h-3">
            <div 
              className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${range52Percent}%` }}
            >
              <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md border-2 border-[#0E131F]" />
              <span className="text-[9px] font-mono font-bold text-slate-300 tracking-tighter mt-0.5">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Institutional Key Ratios Grid */}
      <div className="pt-3 border-t border-[#1E273B]/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        
        <div className="bg-[#080B11]/60 px-3 py-2 rounded-md border border-[#1E273B]/60">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Market Cap</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {formatMarketCap(quote?.market_cap)}
          </span>
        </div>

        <div className="bg-[#080B11]/60 px-3 py-2 rounded-md border border-[#1E273B]/60">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">P/E Ratio (TTM)</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {quote?.pe_ratio ? `${quote.pe_ratio.toFixed(2)}x` : '—'}
          </span>
        </div>

        <div className="bg-[#080B11]/60 px-3 py-2 rounded-md border border-[#1E273B]/60">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Day's Range</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            ${quote?.day_low ? quote.day_low.toFixed(2) : '—'} - ${quote?.day_high ? quote.day_high.toFixed(2) : '—'}
          </span>
        </div>

        <div className="bg-[#080B11]/60 px-3 py-2 rounded-md border border-[#1E273B]/60">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Volume</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {formatVolume(quote?.volume)}
          </span>
        </div>

        <div className="bg-[#080B11]/60 px-3 py-2 rounded-md border border-[#1E273B]/60">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Avg Volume</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {formatVolume(quote?.avg_volume)}
          </span>
        </div>

        <div className="bg-[#080B11]/60 px-3 py-2 rounded-md border border-[#1E273B]/60">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">30D Forecast Target</span>
          <span className="font-mono font-bold text-sky-400 tabular-nums">
            {recommendation?.target_price_30d ? `$${recommendation.target_price_30d.toFixed(2)}` : '—'}
          </span>
        </div>

      </div>

    </div>
  );
}
