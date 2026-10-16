import React, { useState } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  PieChart, 
  Newspaper, 
  Activity, 
  Search,
  ShieldCheck,
  Zap
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const navItems = [
    { id: 'overview', label: 'AI Advisory', icon: ShieldCheck },
    { id: 'prediction', label: 'Price Forecaster', icon: BrainCircuit },
    { id: 'sentiment', label: 'News Sentiment', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio Optimizer', icon: PieChart },
    { id: 'technicals', label: 'Technical Engine', icon: Activity },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">NORTHGATE</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> AI CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Predictive Equity Intelligence & Portfolio Optimization</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search symbol (e.g. NVDA, AAPL, MSFT)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase"
              />
            </form>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium">{isLive ? 'Models Synchronized' : 'Connecting Engine'}</span>
            </div>
          </div>
        </div>

        {/* Quick Tickers & Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-3 pt-1 border-t border-slate-900/60 gap-3">
          
          {/* Quick Stock Selector Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-1 hidden lg:inline">Universe:</span>
            {QUICK_TICKERS.map((sym) => {
              const isSelected = sym === currentTicker;
              return (
                <button
                  key={sym}
                  onClick={() => onSelectTicker(sym)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </header>
  );
}
