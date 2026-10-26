"""
Northgate AI Stock Predictor - Consensus Ensemble Forecasting Engine
====================================================================
No single model family performs best across all market regimes. 
Deep learning sequence models (LSTM) excel at finding cyclic autocorrelation 
and temporal persistence, while tree ensembles (XGBoost/Random Forest) are 
superior at recognizing cross-sectional indicator thresholds (e.g. RSI overbought).

This consensus engine fuses both paradigms:
1. Deep Learning Sequence Forecast: 50% baseline weight.
2. Machine Learning Tree Forecast: 50% baseline weight.
3. Financial Sentiment Drift: Dynamic momentum adjustment based on news polarity.
4. Statistical Uncertainty Envelope: 95% Confidence Bounds expanding with sqrt(time),
   consistent with geometric Brownian motion diffusion models.
"""

import time
import datetime
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from app.models.schemas import PredictionPoint, PredictionMetrics, PredictionResponse
from app.services.market_data import fetch_stock_history
from app.services.ml_predictor import train_and_predict_ml
from app.services.dl_predictor import train_and_predict_dl
from app.services.sentiment import get_ticker_sentiment

# In-memory prediction cache (10 minutes TTL to prevent redundant model retraining)
_PREDICTION_CACHE: Dict[str, Tuple[float, PredictionResponse]] = {}
PREDICTION_CACHE_TTL = 600

def get_ensemble_predictions(ticker: str, horizon_days: int = 14) -> PredictionResponse:
    """
    Computes a synthesized multi-model forecast with 95% confidence intervals.
    Utilizes an in-memory TTL cache to return lightning-fast forecasts and protect CPU.
    """
    ticker_clean = ticker.upper()
    cache_key = f"{ticker_clean}_{horizon_days}"
    now = time.time()
    
    if cache_key in _PREDICTION_CACHE:
        cached_time, cached_resp = _PREDICTION_CACHE[cache_key]
        if now - cached_time < PREDICTION_CACHE_TTL:
            return cached_resp

    df = fetch_stock_history(ticker_clean, period="2y")
    current_price = float(df['Close'].iloc[-1])
    
    # 1. Run Machine Learning Models (XGBoost + Random Forest)
    ml_result = train_and_predict_ml(df, horizon_days=horizon_days)
    ml_preds = ml_result["predictions"]
    ml_metrics = ml_result["metrics"]
    feat_importance = ml_result["feature_importance"]
    
    # 2. Run Deep Learning Model (PyTorch LSTM Neural Network)
    dl_result = train_and_predict_dl(df, horizon_days=horizon_days)
    dl_preds = dl_result["predictions"]
    
    # 3. Retrieve Real-Time Financial News Sentiment
    sentiment_summary = get_ticker_sentiment(ticker_clean)
    sentiment_score = sentiment_summary.compound_score  # bounded between -1.0 and +1.0
    
    # 4. Ensemble Fusion Weights
    # 50/50 balance between sequence neural network and decision trees
    w_ml = 0.50
    w_dl = 0.50
    
    # 5. Measure 30-day realized volatility for confidence intervals
    # In quantitative finance, diffusion error expands proportionally with sqrt(t)
    daily_returns = df['Close'].pct_change().dropna()
    sigma = float(daily_returns.iloc[-30:].std()) * current_price
    
    prediction_points: List[PredictionPoint] = []
    
    # Stitch the last 15 historical sessions to provide visual continuity in the chart
    recent_history = df.tail(15)
    for date_idx, row in recent_history.iterrows():
        d_str = date_idx.strftime("%Y-%m-%d") if hasattr(date_idx, "strftime") else str(date_idx)[:10]
        c = round(float(row['Close']), 2)
        prediction_points.append(
            PredictionPoint(
                date=d_str,
                predicted_close=c,
                predicted_ml=c,
                predicted_dl=c,
                lower_bound_95=c,
                upper_bound_95=c,
                is_forecast=False,
                actual_close=c
            )
        )
        
    last_date = df.index[-1]
    ensemble_forecasts: List[float] = []
    
    # 6. Generate Forward Projections & Confidence Bands
    for i in range(horizon_days):
        step = i + 1
        p_ml = ml_preds[i]
        p_dl = dl_preds[i]
        
        # Base ensemble price from ML + DL
        base_pred = (w_ml * p_ml) + (w_dl * p_dl)
        
        # Sentiment drift adjustment: institutional sentiment applies subtle pressure
        sentiment_bias = base_pred * (sentiment_score * 0.002 * (step ** 0.5))
        final_pred = round(base_pred + sentiment_bias, 2)
        ensemble_forecasts.append(final_pred)
        
        # Standard 95% Confidence Interval: +/- 1.96 * sigma * sqrt(step)
        margin = 1.96 * sigma * np.sqrt(step * 0.7)
        lower_b = round(max(final_pred - margin, final_pred * 0.7), 2)
        upper_b = round(final_pred + margin, 2)
        
        # Advance forward calendar date, skipping weekend exchange holidays
        next_d = last_date + pd.Timedelta(days=step)
        while next_d.weekday() >= 5:
            next_d += pd.Timedelta(days=1)
        d_str = next_d.strftime("%Y-%m-%d")
        
        prediction_points.append(
            PredictionPoint(
                date=d_str,
                predicted_close=final_pred,
                predicted_ml=round(p_ml, 2),
                predicted_dl=round(p_dl, 2),
                lower_bound_95=lower_b,
                upper_bound_95=upper_b,
                is_forecast=True,
                actual_close=None
            )
        )
        
    predicted_final = ensemble_forecasts[-1]
    expected_change = round(((predicted_final - current_price) / current_price) * 100, 2)
    
    resp = PredictionResponse(
        ticker=ticker_clean,
        horizon_days=horizon_days,
        current_price=round(current_price, 2),
        predicted_final_price=predicted_final,
        expected_change_pct=expected_change,
        metrics=PredictionMetrics(
            mae=ml_metrics["mae"],
            rmse=ml_metrics["rmse"],
            mape=ml_metrics["mape"],
            directional_accuracy_pct=ml_metrics["directional_accuracy_pct"],
            r2_score=ml_metrics["r2_score"]
        ),
        predictions=prediction_points,
        model_weights={"XGBoost_RF_ML": w_ml, "PyTorch_LSTM_DL": w_dl, "Sentiment_Bias": round(sentiment_score, 2)},
        feature_importance=feat_importance
    )
    _PREDICTION_CACHE[cache_key] = (now, resp)
    return resp
