import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  PieChart, 
  Newspaper, 
  Activity, 
  Search,
  ShieldCheck,
  Briefcase,
  Command,
  Sliders,
  Terminal
} from 'lucide-react';

const QUICK_TICKERS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META', 'SPY'];

export default function Navbar({ 
  currentTicker, 
  onSelectTicker, 
  activeTab, 
  setActiveTab,
  isLive 
}) {
  const [searchInput, setSearchInput] = useState('');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
      searchInputRef.current?.blur();
    }
  };

  const navItems = [
    { id: 'overview', label: 'Advisory Overview', icon: ShieldCheck },
    { id: 'prediction', label: 'Price Forecaster', icon: BrainCircuit },
    { id: 'sentiment', label: 'News Sentiment', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio Optimizer', icon: PieChart },
    { id: 'paper', label: 'Paper Trading Desk', icon: Briefcase },
    { id: 'technicals', label: 'Technical Engine', icon: Activity },
  ];

  return (
    <header className="border-b border-[#1E273B] bg-[#090C12]/95 backdrop-blur-md sticky top-0 z-50">
      
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#131A2B] border border-[#2A3650] flex items-center justify-center text-sky-400 group-hover:border-sky-500/50 transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-slate-100 font-sans">
                NORTHGATE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#131A2B] text-sky-400 border border-[#2A3650]">
                TERMINAL v2.4
              </span>
            </div>
          </div>

          {/* Institutional Ticker Command Palette Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search symbol (e.g. NVDA, AAPL)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-14 py-1.5 bg-[#0E131F] border border-[#1E273B] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 uppercase transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-[#131A2B] border border-[#1E273B] rounded">
                  /
                </kbd>
              </div>
            </form>
          </div>

          {/* Engine Status / System Latency */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#0E131F] border border-[#1E273B] text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-slate-300 text-[11px] font-mono">
                {isLive ? 'SYS: ONLINE' : 'SYS: CONNECTING'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Linear / Financial Desk Style) */}
        <div className="flex items-center justify-between overflow-x-auto border-t border-[#1E273B]/70 py-1.5 gap-2 scrollbar-none">
          
          {/* Quick Universe Selector */}
          <div className="flex items-center space-x-1 shrink-0 mr-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1 hidden lg:inline">
              Ticker:
            </span>
            {QUICK_TICKERS.map((sym) => {
              const isSelected = sym === currentTicker;
              return (
                <button
                  key={sym}
                  onClick={() => onSelectTicker(sym)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131A2B]'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          {/* Segmented Desktop Tabs */}
          <nav className="flex items-center space-x-1 shrink-0 bg-[#0E131F] p-0.5 rounded-lg border border-[#1E273B]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#182137] text-white font-semibold shadow-sm text-sky-400 border border-[#2A3650]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131A2B]/70 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>

    </header>
  );
}
