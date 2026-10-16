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
  BarChart3, 
  Layers, 
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function PredictionChart({ predictionData, onHorizonChange, currentHorizon = 14, isLoading }) {
  const [activeModelView, setActiveModelView] = useState('all'); // 'all', 'ensemble', 'dl', 'ml'

  if (isLoading || !predictionData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 h-[480px] flex flex-col items-center justify-center space-y-4">
        <BrainCircuit className="w-12 h-12 text-cyan-400 animate-pulse" />
        <p className="text-slate-300 font-medium text-sm">Running Deep Learning LSTM & XGBoost inference...</p>
        <span className="text-xs text-slate-500">Calculating neural time-series rollouts and 95% confidence intervals</span>
      </div>
    );
  }

  const {
    ticker,
    current_price,
    predicted_final_price,
    expected_change_pct,
    metrics,
    predictions,
    model_weights,
    feature_importance
  } = predictionData;

  // Format data points for recharts
  const chartData = predictions.map((pt) => {
    return {
      date: pt.date.slice(5), // 'MM-DD'
      fullDate: pt.date,
      actual: pt.actual_close !== null ? pt.actual_close : undefined,
      ensemble: pt.predicted_close,
      dl_lstm: pt.predicted_dl,
      ml_xgb: pt.predicted_ml,
      confidence_band: [pt.lower_bound_95, pt.upper_bound_95],
      lower: pt.lower_bound_95,
      upper: pt.upper_bound_95,
      isForecast: pt.is_forecast
    };
  });

  const minPrice = Math.min(...predictions.map(p => p.lower_bound_95)) * 0.98;
  const maxPrice = Math.max(...predictions.map(p => p.upper_bound_95)) * 1.02;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[180px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
            <span className="font-bold text-slate-200">{dataPoint.fullDate}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              dataPoint.isForecast ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {dataPoint.isForecast ? 'AI Forecast' : 'Historical'}
            </span>
          </div>

          {dataPoint.actual !== undefined && (
            <div className="flex justify-between items-center text-slate-300">
              <span>Actual Close:</span>
              <span className="font-mono font-bold text-white">${dataPoint.actual.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-cyan-400">
            <span>Ensemble Consensus:</span>
            <span className="font-mono font-bold">${dataPoint.ensemble.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-indigo-400">
            <span>PyTorch LSTM (DL):</span>
            <span className="font-mono">${dataPoint.dl_lstm.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-emerald-400">
            <span>XGBoost (ML):</span>
            <span className="font-mono">${dataPoint.ml_xgb.toFixed(2)}</span>
          </div>

          {dataPoint.isForecast && (
            <div className="pt-1 mt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
              <span>95% CI Range:</span>
              <span className="font-mono text-slate-300">${dataPoint.lower.toFixed(2)} - ${dataPoint.upper.toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Chart Container Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BrainCircuit className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-white text-lg">AI Multi-Model Price Forecasting</h3>
            </div>
            <p className="text-xs text-slate-400">
              Consensus blend of 2-layer PyTorch LSTM sequence network, XGBoost regressor, and financial sentiment impulse.
            </p>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 px-2 uppercase">Horizon:</span>
            {[7, 14, 30].map((h) => (
              <button
                key={h}
                onClick={() => onHorizonChange(h)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentHorizon === h
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h} Days
              </button>
            ))}
          </div>

        </div>

        {/* Model Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Display:</span>
          {[
            { id: 'all', label: 'All Models & Bands' },
            { id: 'ensemble', label: 'Consensus Ensemble Only' },
            { id: 'dl', label: 'Deep Learning (LSTM)' },
            { id: 'ml', label: 'Machine Learning (XGBoost)' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveModelView(btn.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activeModelView === btn.id
                  ? 'bg-slate-800 text-white border-cyan-500/60'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Recharts Area/Line Visualization */}
        <div className="h-[380px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
              />
              <YAxis 
                domain={[minPrice, maxPrice]} 
                stroke="#64748b" 
                tick={{ fontSize: 11, fontFamily: 'monospace' }} 
                tickFormatter={(val) => `$${val.toFixed(0)}`}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              {/* Shaded 95% Confidence Interval Band */}
              {(activeModelView === 'all' || activeModelView === 'ensemble') && (
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confidenceGrad)"
                  name="95% Confidence Upper"
                  legendType="none"
                />
              )}

              {/* Actual Historical Price */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#f8fafc"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#f8fafc' }}
                name="Historical Actual"
                connectNulls={false}
              />

              {/* Ensemble Consensus Line */}
              {(activeModelView === 'all' || activeModelView === 'ensemble') && (
                <Line
                  type="monotone"
                  dataKey="ensemble"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#06b6d4' }}
                  name="Consensus Ensemble"
                />
              )}

              {/* Deep Learning PyTorch LSTM Line */}
              {(activeModelView === 'all' || activeModelView === 'dl') && (
                <Line
                  type="monotone"
                  dataKey="dl_lstm"
                  stroke="#818cf8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                  name="PyTorch LSTM (DL)"
                />
              )}

              {/* Machine Learning XGBoost Line */}
              {(activeModelView === 'all' || activeModelView === 'ml') && (
                <Line
                  type="monotone"
                  dataKey="ml_xgb"
                  stroke="#34d399"
                  strokeWidth={1.8}
                  strokeDasharray="2 2"
                  dot={false}
                  name="XGBoost (ML)"
                />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Model Performance & Evaluation Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Directional Accuracy</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{metrics.directional_accuracy_pct}%</span>
          <span className="text-[10px] text-slate-500 block">Out-of-sample test</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">R² Predictive Score</span>
          <span className="text-xl font-black text-cyan-400 font-mono">{metrics.r2_score}</span>
          <span className="text-[10px] text-slate-500 block">Variance explained</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">MAE (Avg Error)</span>
          <span className="text-xl font-black text-slate-200 font-mono">${metrics.mae}</span>
          <span className="text-[10px] text-slate-500 block">Mean Absolute Error</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">RMSE (Volatility Err)</span>
          <span className="text-xl font-black text-slate-200 font-mono">${metrics.rmse}</span>
          <span className="text-[10px] text-slate-500 block">Root Mean Square</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">MAPE (% Deviation)</span>
          <span className="text-xl font-black text-slate-200 font-mono">{metrics.mape}%</span>
          <span className="text-[10px] text-slate-500 block">Relative percentage</span>
        </div>

      </div>

      {/* Feature Importance & Neural Weighting */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Model Architecture & Signal Weights
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weights */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block mb-2">Consensus Ensemble Blending</span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-300">PyTorch Deep Learning LSTM</span>
                <span className="text-indigo-400 font-bold">50.0% Weight</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-300">XGBoost & Random Forest ML</span>
                <span className="text-emerald-400 font-bold">50.0% Weight</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-300">Financial News Sentiment Vector</span>
                <span className="text-cyan-400 font-bold">Dynamically Injected</span>
              </div>
            </div>
          </div>

          {/* Top Features */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block mb-2">Top Predictive Feature Drivers</span>
            <div className="space-y-1.5">
              {Object.entries(feature_importance || {}).map(([feat, val]) => (
                <div key={feat} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">{feat}</span>
                  <div className="flex items-center gap-2 w-1/2 justify-end">
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-cyan-400 h-full rounded-full" 
                        style={{ width: `${Math.min(val * 150, 100)}%` }} 
                      />
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{(val * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
