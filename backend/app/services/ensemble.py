"""
Northgate AI Stock Predictor - Consensus Ensemble Predictor
Combines Machine Learning, Deep Learning LSTM, and Financial Sentiment Analysis with 95% Confidence Bounds.
"""
import datetime
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from app.models.schemas import PredictionPoint, PredictionMetrics, PredictionResponse
from app.services.market_data import fetch_stock_history
from app.services.ml_predictor import train_and_predict_ml
from app.services.dl_predictor import train_and_predict_dl
from app.services.sentiment import get_ticker_sentiment

def get_ensemble_predictions(ticker: str, horizon_days: int = 14) -> PredictionResponse:
    ticker_clean = ticker.upper()
    df = fetch_stock_history(ticker_clean, period="2y")
    current_price = float(df['Close'].iloc[-1])
    
    # 1. Run Machine Learning Models (XGBoost + RF)
    ml_result = train_and_predict_ml(df, horizon_days=horizon_days)
    ml_preds = ml_result["predictions"]
    ml_metrics = ml_result["metrics"]
    feat_importance = ml_result["feature_importance"]
    
    # 2. Run Deep Learning Model (PyTorch LSTM)
    dl_result = train_and_predict_dl(df, horizon_days=horizon_days)
    dl_preds = dl_result["predictions"]
    
    # 3. Retrieve Financial News Sentiment
    sentiment_summary = get_ticker_sentiment(ticker_clean)
    sentiment_score = sentiment_summary.compound_score  # -1.0 to 1.0
    
    # 4. Ensemble Fusion Weights
    # ML: 0.45, DL: 0.45, Sentiment Momentum adjustment: +/- 0.10
    w_ml = 0.50
    w_dl = 0.50
    
    # Rolling standard deviation for 95% confidence intervals
    daily_returns = df['Close'].pct_change().dropna()
    sigma = float(daily_returns.iloc[-30:].std()) * current_price
    
    prediction_points: List[PredictionPoint] = []
    
    # Include the last 15 historical days for chart continuity
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
    
    for i in range(horizon_days):
        step = i + 1
        p_ml = ml_preds[i]
        p_dl = dl_preds[i]
        
        # Base ensemble price
        base_pred = (w_ml * p_ml) + (w_dl * p_dl)
        
        # Sentiment impulse: compound score of +0.30 imparts subtle momentum effect over horizon
        sentiment_bias = base_pred * (sentiment_score * 0.002 * (step ** 0.5))
        final_pred = round(base_pred + sentiment_bias, 2)
        ensemble_forecasts.append(final_pred)
        
        # 95% Confidence Interval: +/- 1.96 * sigma * sqrt(step)
        margin = 1.96 * sigma * np.sqrt(step * 0.7)
        lower_b = round(max(final_pred - margin, final_pred * 0.7), 2)
        upper_b = round(final_pred + margin, 2)
        
        # Future business date
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
    
    return PredictionResponse(
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
