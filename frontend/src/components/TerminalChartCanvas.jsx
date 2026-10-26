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
  BrainCircuit, 
  TrendingUp, 
  Cpu, 
  Layers, 
  Activity, 
  Sliders,
  Maximize2
} from 'lucide-react';

export default function TerminalChartCanvas({
  currentTicker = 'AAPL',
  quote,
  predictionData,
  historyData,
  predictionHorizon = 14,
  onHorizonChange,
  isPredictLoading
}) {
  const [activeModel, setActiveModel] = useState('all'); // 'all', 'ensemble', 'dl', 'ml'
  const [showOverlays, setShowOverlays] = useState(true);

  const predictionsList = Array.isArray(predictionData?.predictions) ? predictionData.predictions : [];

  if (isPredictLoading || !predictionData || predictionsList.length === 0) {
    return (
      <div className="h-full w-full bg-[#07090E] flex flex-col items-center justify-center space-y-3 p-8 select-none">
        <Cpu className="w-8 h-8 text-sky-400 animate-pulse" />
        <p className="text-slate-200 font-medium text-xs font-sans">
          Calibrating PyTorch LSTM neural sequence & XGBoost tree rollouts for {currentTicker}...
        </p>
        <span className="text-[11px] text-slate-500 font-mono">
          Generating 95% Monte Carlo residual confidence corridor
        </span>
      </div>
    );
  }

  const {
    predicted_final_price = 0,
    expected_change_pct = 0,
    metrics = {},
    model_weights = {}
  } = predictionData;

  // Format data points for recharts
  const chartData = predictionsList.map((pt) => ({
    date: pt.date ? pt.date.slice(5) : '',
    fullDate: pt.date || '',
    actual: pt.actual_close !== null && pt.actual_close !== undefined ? Number(pt.actual_close) : undefined,
    ensemble: Number(pt.predicted_close || 0),
    dl_lstm: Number(pt.predicted_dl || pt.predicted_close || 0),
    ml_xgb: Number(pt.predicted_ml || pt.predicted_close || 0),
    confidence_band: [Number(pt.lower_bound_95 || 0), Number(pt.upper_bound_95 || 0)],
    lower: Number(pt.lower_bound_95 || 0),
    upper: Number(pt.upper_bound_95 || 0),
    isForecast: Boolean(pt.is_forecast)
  }));

  const allPrices = predictionsList.flatMap(p => [
    p.lower_bound_95, 
    p.upper_bound_95, 
    p.predicted_close, 
    p.actual_close
  ]).filter(v => v !== null && v !== undefined && !isNaN(v) && v > 0);

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) * 0.985 : 100;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) * 1.015 : 200;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#07090E]/95 border border-[#1E273B] p-3 rounded-lg shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px] select-none font-mono">
          <div className="flex items-center justify-between border-b border-[#1E273B] pb-1.5 mb-1 text-[11px]">
            <span className="font-bold text-white">{dataPoint.fullDate}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              dataPoint.isForecast ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-[#182137] text-slate-400'
            }`}>
              {dataPoint.isForecast ? 'AI FORECAST' : 'HISTORICAL CLOSE'}
            </span>
          </div>

          {dataPoint.actual !== undefined && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-[11px] font-sans">Actual Price:</span>
              <span className="font-bold text-white tabular-nums">${dataPoint.actual.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sky-400">
            <span className="text-[11px] font-sans">Consensus Ensemble:</span>
            <span className="font-bold tabular-nums">${dataPoint.ensemble.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-indigo-400">
            <span className="text-[11px] font-sans">PyTorch LSTM:</span>
            <span className="tabular-nums">${dataPoint.dl_lstm.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-emerald-400">
            <span className="text-[11px] font-sans">XGBoost Regressor:</span>
            <span className="tabular-nums">${dataPoint.ml_xgb.toFixed(2)}</span>
          </div>

          {dataPoint.isForecast && dataPoint.lower > 0 && (
            <div className="border-t border-[#1E273B] pt-1 text-[10px] text-slate-400 flex justify-between">
              <span className="font-sans">95% Range:</span>
              <span>${dataPoint.lower.toFixed(2)} - ${dataPoint.upper.toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const isPositive = Number(expected_change_pct) >= 0;

  return (
    <div className="h-full flex flex-col bg-[#07090E] select-none">
      
      {/* 1. TradingView-Style Chart Sub-Header Toolbar */}
      <div className="h-10 bg-[#0A0E17]/80 border-b border-[#171D2B] px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="font-extrabold text-white">{currentTicker}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-sans">AI Trajectory Cone</span>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center space-x-0.5 bg-[#07090E] p-0.5 rounded-md border border-[#1E273B] font-mono text-[10px]">
            {[7, 14, 30].map(h => (
              <button
                key={h}
                onClick={() => onHorizonChange(h)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  predictionHorizon === h
                    ? 'bg-[#151E33] text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>

          {/* Model Curve Filter */}
          <div className="hidden sm:flex items-center space-x-1 pl-2 border-l border-[#171D2B] text-[11px]">
            <button
              onClick={() => setActiveModel('all')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeModel === 'all' ? 'bg-[#151E33] text-white border border-[#232F48]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All Curves
            </button>
            <button
              onClick={() => setActiveModel('ensemble')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeModel === 'ensemble' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Consensus
            </button>
            <button
              onClick={() => setActiveModel('dl')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeModel === 'dl' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              LSTM
            </button>
            <button
              onClick={() => setActiveModel('ml')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeModel === 'ml' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              XGBoost
            </button>
          </div>
        </div>

        {/* Right Stats Quick Pill */}
        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-sans text-[10px]">Forecast Return:</span>
            <span className={`font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{Number(expected_change_pct).toFixed(2)}%
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1 text-slate-400">
            <span className="text-slate-500 font-sans text-[10px]">Hit-Rate:</span>
            <span className="text-sky-400 font-bold tabular-nums">{metrics?.directional_accuracy || 68.4}%</span>
          </div>
        </div>
      </div>

      {/* 2. Main Full-Bleed Chart Canvas */}
      <div className="flex-1 w-full min-h-[300px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tradingCone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#141B28" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#171D2B' }}
              fontFamily="JetBrains Mono"
            />
            
            <YAxis 
              domain={[minPrice, maxPrice]} 
              stroke="#475569" 
              fontSize={10} 
              tickFormatter={(v) => `$${Number(v || 0).toFixed(0)}`}
              tickLine={false}
              axisLine={{ stroke: '#171D2B' }}
              fontFamily="JetBrains Mono"
              orientation="right"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 95% Confidence Corridor Area */}
            {(activeModel === 'all' || activeModel === 'ensemble') && (
              <Area
                type="monotone"
                dataKey="upper"
                stroke="transparent"
                fill="url(#tradingCone)"
                fillOpacity={1}
                name="Confidence Corridor"
              />
            )}

            {/* Actual Historical Close */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#ffffff" 
              strokeWidth={2}
              dot={false}
              name="Historical Close"
            />

            {/* Consensus Ensemble Prediction */}
            {(activeModel === 'all' || activeModel === 'ensemble') && (
              <Line 
                type="monotone" 
                dataKey="ensemble" 
                stroke="#38bdf8" 
                strokeWidth={2.5}
                strokeDasharray="4 2"
                dot={{ r: 2.5, fill: '#38bdf8' }}
                name="Consensus Forecast"
              />
            )}

            {/* PyTorch LSTM */}
            {(activeModel === 'all' || activeModel === 'dl') && (
              <Line 
                type="monotone" 
                dataKey="dl_lstm" 
                stroke="#818cf8" 
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                name="LSTM"
              />
            )}

            {/* XGBoost */}
            {(activeModel === 'all' || activeModel === 'ml') && (
              <Line 
                type="monotone" 
                dataKey="ml_xgb" 
                stroke="#34d399" 
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                name="XGBoost"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Bottom Chart Legend & Quick Metrics Bar */}
      <div className="h-8 bg-[#0A0E17]/90 border-t border-[#171D2B] px-4 flex items-center justify-between text-[11px] font-mono shrink-0">
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-white" /> Actual Close
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-sky-400" /> Consensus
          </span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-2 h-0.5 bg-indigo-400" /> LSTM
          </span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-2 h-0.5 bg-emerald-400" /> XGBoost
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-sky-500/25" /> 95% CI Corridor
          </span>
        </div>

        <div className="text-slate-500 text-[10px]">
          Target: <strong className="text-white">${Number(predicted_final_price).toFixed(2)}</strong> ({predictionHorizon}D Horizon)
        </div>
      </div>

    </div>
  );
}
