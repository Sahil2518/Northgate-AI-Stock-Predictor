import React from 'react';
import { 
  BarChart2, 
  BrainCircuit, 
  Newspaper, 
  PieChart, 
  Briefcase, 
  Activity, 
  Terminal, 
  Settings, 
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function TerminalSidebar({ activeTab, setActiveTab, isLive }) {
  const tools = [
    { id: 'workspace', label: 'Trading Terminal', icon: BarChart2, badge: 'PRO' },
    { id: 'prediction', label: 'AI Sequence Forecaster', icon: BrainCircuit },
    { id: 'sentiment', label: 'News Catalyst Flow', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio Optimizer & Stress Test', icon: PieChart },
    { id: 'paper', label: 'Simulated Execution Ledger', icon: Briefcase },
    { id: 'technicals', label: 'Technical Analysis Lab', icon: Activity },
  ];

  return (
    <aside className="w-16 bg-[#07090E] border-r border-[#171D2B] flex flex-col items-center justify-between py-3 shrink-0 select-none z-30">
      
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => setActiveTab('workspace')}
          title="Northgate Quantitative Terminal"
          className="w-10 h-10 rounded-xl bg-[#111726] border border-[#232F48] flex items-center justify-center text-sky-400 hover:border-sky-500/50 hover:bg-[#162035] transition-all group"
        >
          <Terminal className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
        </button>

        <div className="w-8 h-[1px] bg-[#171D2B]" />

        {/* Primary Tool Rail Icons */}
        <nav className="flex flex-col items-center space-y-2">
          {tools.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                  isActive
                    ? 'bg-[#151E33] text-sky-400 border border-sky-500/40 shadow-md shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1422] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-sky-400 rounded-r-full shadow-sm shadow-sky-400/50" />
                )}
                
                {/* Micro Tooltip */}
                <span className="absolute left-14 px-2 py-1 bg-[#0E1422] border border-[#232F48] rounded-md text-[11px] font-sans text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Settings */}
      <div className="flex flex-col items-center space-y-3">
        {/* System Health Dot */}
        <div 
          title={isLive ? 'FastAPI Neural Rest Engine: Online' : 'Connecting Engine...'}
          className="relative p-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group"
        >
          <span className={`w-2 h-2 rounded-full block ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="absolute left-14 px-2 py-1 bg-[#0E1422] border border-[#232F48] rounded-md text-[10px] font-mono text-slate-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
            {isLive ? 'SYS: ONLINE (<35ms)' : 'SYS: CONNECTING'}
          </span>
        </div>

        <button 
          title="Terminal Settings & Keybindings"
          className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-[#0E1422]"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
}
