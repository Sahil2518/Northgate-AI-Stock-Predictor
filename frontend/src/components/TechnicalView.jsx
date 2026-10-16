import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Sliders 
} from 'lucide-react';

export default function TechnicalView({ 
  technicalData, 
  historyData, 
  ticker, 
  isLoading 
}) {
  const [overlaySMA, setOverlaySMA] = useState(true);
  const [overlayBB, setOverlayBB] = useState(true);

  if (isLoading || !technicalData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 h-[400px] flex flex-col items-center justify-center space-y-4">
        <Activity className="w-12 h-12 text-cyan-400 animate-pulse" />
        <p className="text-slate-300 font-medium text-sm">Computing algorithmic technical indicators...</p>
      </div>
    );
  }

  const {
    current_price,
    rsi_14,
    rsi_condition,
    macd,
    macd_signal,
    macd_crossover,
    sma_20,
    sma_50,
    sma_200,
    sma_trend,
    bb_upper,
    bb_lower,
    bb_position,
    atr_14,
    volatility_annualized
  } = technicalData;

  const chartData = (historyData?.prices || []).slice(-90).map(p => ({
    date: p.date.slice(5),
    fullDate: p.date,
    close: p.close,
    sma20: p.sma_20,
    sma50: p.sma_50,
    bbUpper: p.bb_upper,
    bbLower: p.bb_lower,
    rsi: p.rsi,
    macd: p.macd
  }));

  const minVal = chartData.length > 0 ? Math.min(...chartData.map(d => d.bbLower || d.close)) * 0.97 : 0;
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.bbUpper || d.close)) * 1.03 : 100;

  return (
    <div className="space-y-6">
      
      {/* Indicator Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* RSI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RSI (14-Day)</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
              rsi_14 >= 70 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                : rsi_14 <= 30 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800 text-cyan-400'
            }`}>
              {rsi_condition}
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-2">{rsi_14}</div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
            <div 
              className={`h-full rounded-full ${
                rsi_14 >= 70 ? 'bg-rose-500' : rsi_14 <= 30 ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} 
              style={{ width: `${Math.min(rsi_14, 100)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-medium">30 Oversold · 70 Overbought</span>
        </div>

        {/* MACD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MACD Signal</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
              macd > macd_signal 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {macd_crossover}
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-2">{macd}</div>
          <div className="text-xs text-slate-400 flex justify-between font-mono">
            <span>Signal Line:</span>
            <span className="text-slate-200">{macd_signal}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-medium">12/26 EMA Divergence</span>
        </div>

        {/* Moving Average Structure */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MA Structure</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {sma_trend}
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-2">${current_price.toFixed(2)}</div>
          <div className="text-xs text-slate-400 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>SMA 50:</span>
              <span className="text-slate-200">${sma_50}</span>
            </div>
            <div className="flex justify-between">
              <span>SMA 200:</span>
              <span className="text-slate-200">${sma_200}</span>
            </div>
          </div>
        </div>

        {/* Bollinger Bands & Volatility */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bollinger Bands</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-800 text-slate-300">
              {bb_position}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white mb-2">
            ${bb_lower.toFixed(0)} - ${bb_upper.toFixed(0)}
          </div>
          <div className="text-xs text-slate-400 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>ATR (14D):</span>
              <span className="text-slate-200">${atr_14}</span>
            </div>
            <div className="flex justify-between">
              <span>Ann. Vol:</span>
              <span className="text-slate-200">{(volatility_annualized * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Technical Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Technical Price Action & Bands (90-Day Lookback)
            </h3>
            <p className="text-xs text-slate-400">
              Interactive visualization of Moving Averages and Bollinger Volatility Envelopes for {ticker}.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setOverlaySMA(!overlaySMA)}
              className={`px-3 py-1 rounded-lg border font-medium transition-all ${
                overlaySMA ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              SMA 20/50
            </button>
            <button
              onClick={() => setOverlayBB(!overlayBB)}
              className={`px-3 py-1 rounded-lg border font-medium transition-all ${
                overlayBB ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              Bollinger Bands
            </button>
          </div>
        </div>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis 
                domain={[minVal, maxVal]} 
                stroke="#64748b" 
                tick={{ fontSize: 11, fontFamily: 'monospace' }} 
                tickFormatter={(val) => `$${val.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }} />

              {/* Close Price */}
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#f8fafc" 
                strokeWidth={2.5} 
                dot={false} 
                name="Close Price" 
              />

              {/* Moving Averages */}
              {overlaySMA && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="sma20" 
                    stroke="#38bdf8" 
                    strokeWidth={1.5} 
                    dot={false} 
                    name="SMA 20" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma50" 
                    stroke="#eab308" 
                    strokeWidth={1.5} 
                    dot={false} 
                    name="SMA 50" 
                  />
                </>
              )}

              {/* Bollinger Bands */}
              {overlayBB && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="bbUpper" 
                    stroke="#a855f7" 
                    strokeWidth={1} 
                    strokeDasharray="3 3" 
                    dot={false} 
                    name="BB Upper (2σ)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bbLower" 
                    stroke="#a855f7" 
                    strokeWidth={1} 
                    strokeDasharray="3 3" 
                    dot={false} 
                    name="BB Lower (2σ)" 
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
