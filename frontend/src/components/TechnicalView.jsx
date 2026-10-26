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
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-8 h-[380px] flex flex-col items-center justify-center space-y-3">
        <Activity className="w-8 h-8 text-sky-400 animate-pulse" />
        <p className="text-slate-200 font-medium text-xs">Computing technical oscillators & momentum vectors...</p>
        <span className="text-[11px] text-slate-500 font-mono">Evaluating 14-day RSI, MACD signal convergence, and Bollinger volatility bands</span>
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

  const minVal = chartData.length > 0 ? Math.min(...chartData.map(d => d.bbLower || d.close)) * 0.98 : 0;
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.bbUpper || d.close)) * 1.02 : 100;

  return (
    <div className="space-y-6">
      
      {/* Indicator Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* RSI */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">RSI (14-Day)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              rsi_14 >= 70 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                : rsi_14 <= 30 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-[#182137] text-sky-400'
            }`}>
              {rsi_condition}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">{rsi_14}</div>
          <div className="w-full bg-[#080B11] h-1.5 rounded-full overflow-hidden border border-[#1E273B]">
            <div 
              className={`h-full rounded-full ${
                rsi_14 >= 70 ? 'bg-rose-500' : rsi_14 <= 30 ? 'bg-emerald-500' : 'bg-sky-400'
              }`} 
              style={{ width: `${Math.min(rsi_14, 100)}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Oversold: 30</span>
            <span>Overbought: 70</span>
          </div>
        </div>

        {/* MACD */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">MACD (12, 26, 9)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              macd_crossover.includes('Bullish')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {macd_crossover}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            {macd > 0 ? '+' : ''}{macd.toFixed(2)}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Signal: {macd_signal.toFixed(2)}</span>
            <span className={macd - macd_signal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              Hist: {(macd - macd_signal).toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">Momentum divergence vector</span>
        </div>

        {/* Bollinger Bands */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Bollinger Bands</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#182137] text-sky-400">
              {bb_position}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">${current_price.toFixed(2)}</div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Upper: ${bb_upper.toFixed(1)}</span>
            <span>Lower: ${bb_lower.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">2.0σ Standard Deviation Band</span>
        </div>

        {/* Volatility & ATR */}
        <div className="bg-[#0E131F] border border-[#1E273B] rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">ATR (14-Day)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#182137] text-amber-400">
              {(volatility_annualized * 100).toFixed(1)}% Annual Vol
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">${atr_14.toFixed(2)}</div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Trend: {sma_trend}</span>
            <span>SMA200: ${sma_200.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Average True Range risk barrier</span>
        </div>

      </div>

      {/* Interactive Technical History Chart */}
      <div className="bg-[#0E131F] border border-[#1E273B] rounded-xl p-5 shadow-xl shadow-black/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E273B]">
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
              90-Day Technical Historical Indicators ({ticker})
            </h4>
            <span className="text-[11px] text-slate-400 font-sans">Daily Close with Moving Averages & Volatility Envelope</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setOverlaySMA(!overlaySMA)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                overlaySMA 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' 
                  : 'bg-[#080B11] text-slate-500 border border-[#1E273B]'
              }`}
            >
              SMA 20/50
            </button>
            <button
              onClick={() => setOverlayBB(!overlayBB)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                overlayBB 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                  : 'bg-[#080B11] text-slate-500 border border-[#1E273B]'
              }`}
            >
              Bollinger Bands
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E273B" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
              <YAxis 
                domain={[minVal, maxVal]} 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                orientation="right"
                fontFamily="JetBrains Mono"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#080B11', 
                  borderColor: '#1E273B', 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* Price Line */}
              <Line type="monotone" dataKey="close" stroke="#ffffff" strokeWidth={2} dot={false} name="Close Price" />

              {/* Moving Averages */}
              {overlaySMA && (
                <>
                  <Line type="monotone" dataKey="sma20" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="SMA 20" />
                  <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="SMA 50" />
                </>
              )}

              {/* Bollinger Bands */}
              {overlayBB && (
                <>
                  <Line type="monotone" dataKey="bbUpper" stroke="#818cf8" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Upper BB" />
                  <Line type="monotone" dataKey="bbLower" stroke="#818cf8" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Lower BB" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
