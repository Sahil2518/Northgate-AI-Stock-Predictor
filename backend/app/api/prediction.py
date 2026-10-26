"""
Northgate AI Stock Predictor - Prediction API Router
"""
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import PredictionResponse
from app.services.ensemble import get_ensemble_predictions
from app.services.model_benchmark import run_eight_model_benchmark
from app.services.sentiment_ablation import run_sentiment_ablation_experiment

router = APIRouter(prefix="/predict", tags=["AI Price Forecasting"])

@router.get("/{ticker}", response_model=PredictionResponse)
def predict_stock_price(
    ticker: str,
    horizon: int = Query(14, ge=3, le=60, description="Forecast horizon in days")
):
    """
    Generate consensus AI price predictions combining XGBoost machine learning,
    PyTorch deep learning LSTM, and news sentiment momentum with 95% confidence bounds.
    """
    try:
        return get_ensemble_predictions(ticker, horizon_days=horizon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed for {ticker}: {str(e)}")

@router.get("/benchmark/{ticker}")
def get_eight_model_benchmark(ticker: str):
    """
    Execute rigorous 8-model quantitative benchmark comparing:
    Ridge Regression, Random Forest, XGBoost, SVR, LSTM, GRU, BiLSTM, and Transformer
    against a Naive Random Walk baseline under leak-free chronological splits.
    Fulfills PRD Sections 8.1, 9.1, and 9.5.
    """
    try:
        return run_eight_model_benchmark(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"8-model benchmark failed for {ticker}: {str(e)}")

@router.get("/sentiment-impact/{ticker}")
def get_sentiment_ablation_impact(ticker: str):
    """
    Execute with-vs-without news sentiment ablation study measuring delta MAE,
    delta RMSE, and delta Directional Accuracy. Fulfills PRD Section 10.3.
    """
    try:
        return run_sentiment_ablation_experiment(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment ablation failed for {ticker}: {str(e)}")
