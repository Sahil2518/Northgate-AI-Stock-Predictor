import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  RefreshCw, 
  Copy, 
  Check, 
  TrendingUp, 
  Sliders, 
  Maximize2, 
  Terminal, 
  Activity,
  Wallet
} from 'lucide-react';

const QUICK_TICKERS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META', 'SPY'];

export default function TerminalTopBar({
  currentTicker,
  onSelectTicker,
  quote,
  recommendation,
  onRefresh,
  onOpenWallet,
  cashBalance = 100000,
  isLoading
}) {
  const [searchInput, setSearchInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, text: 'Closed', estTime: '' });
  const searchInputRef = useRef(null);

  // Global hotkey: '/' or 'Ctrl+K' focuses ticker search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' && document.activeElement !== searchInputRef.current) || 
          (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate US Market Session (NYSE / NASDAQ hours: 09:30 - 16:00 EST, Mon-Fri)
  useEffect(() => {
    const updateMarketStatus = () => {
      try {
        const now = new Date();
        const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
        const estDate = new Date(estStr);
        const day = estDate.getDay();
        const hours = estDate.getHours();
        const minutes = estDate.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        const isWeekday = day >= 1 && day <= 5;
        const isOpen = isWeekday && totalMinutes >= 570 && totalMinutes < 960;
        const isPreMarket = isWeekday && totalMinutes >= 240 && totalMinutes < 570;
        const isPostMarket = isWeekday && totalMinutes >= 960 && totalMinutes < 1200;

        let statusText = 'Closed';
        if (isOpen) {
          const minsToClose = 960 - totalMinutes;
          const h = Math.floor(minsToClose / 60);
          const m = minsToClose % 60;
          statusText = `Market Open · Closes in ${h}h ${m}m`;
        } else if (isPreMarket) {
          statusText = 'Pre-Market';
        } else if (isPostMarket) {
          statusText = 'After-Hours';
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
      searchInputRef.current?.blur();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTicker);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const price = Number(quote?.current_price || 0);
  const change = Number(quote?.change || 0);
  const changePct = Number(quote?.change_percent || 0);
  const isPositive = change >= 0;

  return (
    <header className="h-14 bg-[#0A0E17] border-b border-[#171D2B] flex items-center justify-between px-4 select-none shrink-0 z-20">
      
      {/* Left: Ticker Search & Mega-Cap Chips */}
      <div className="flex items-center space-x-3">
        
        {/* Command Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search asset..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-[#07090E] border border-[#1E273B] rounded-lg text-xs font-mono font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 uppercase transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 bg-[#111726] px-1 py-0.5 rounded border border-[#1E273B]">
            /
          </kbd>
        </form>

        {/* Rapid Universe Chips */}
        <div className="hidden lg:flex items-center space-x-1 pl-1 border-l border-[#171D2B]">
          {QUICK_TICKERS.map((sym) => {
            const isSelected = sym === currentTicker;
            return (
              <button
                key={sym}
                onClick={() => onSelectTicker(sym)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>

      </div>

      {/* Center: Live Asset Price & Ticker Banner */}
      <div className="flex items-center space-x-4">
        <div className="flex items-baseline space-x-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-base text-white font-sans tracking-tight">
              {currentTicker}
            </span>
            <span className="text-[11px] text-slate-400 font-sans truncate max-w-[140px] sm:max-w-[200px] hidden md:inline">
              {quote?.company_name || 'Loading...'}
            </span>
          </div>

          <span className="font-mono font-bold text-lg text-white tabular-nums tracking-tight">
            ${price > 0 ? price.toFixed(2) : '—'}
          </span>

          {price > 0 && (
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tabular-nums ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPositive ? '+' : ''}{changePct.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Right: Live Market Clock & Actions */}
      <div className="flex items-center space-x-3">
        {/* Wallet / Cashier Trigger Pill */}
        <button
          type="button"
          onClick={onOpenWallet}
          title="Open Cashier & Wallet Hub (Deposit / Withdraw)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0D1424] hover:bg-[#152038] border border-[#232F48] hover:border-emerald-500/40 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-all shadow-sm group"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-[11px] tabular-nums">
            ${Number(cashBalance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400 font-sans hidden md:inline">Cash</span>
        </button>

        {/* Market Session Status */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#07090E] border border-[#171D2B] text-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-medium text-slate-300 text-[11px] font-mono">{marketStatus.text}</span>
          <span className="text-slate-500 font-mono text-[10px] hidden xl:inline">({marketStatus.estTime})</span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            title="Copy Ticker"
            className="p-1.5 rounded-md hover:bg-[#111726] text-slate-400 hover:text-slate-200 border border-[#171D2B] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onRefresh}
            title="Sync Live Intelligence"
            className={`p-1.5 rounded-md hover:bg-[#111726] text-slate-400 hover:text-slate-200 border border-[#171D2B] transition-colors ${
              isLoading ? 'animate-spin text-sky-400' : ''
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </header>
  );
}
