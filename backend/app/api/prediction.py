"""
Northgate AI Stock Predictor - Prediction API Router
"""
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import PredictionResponse
from app.services.ensemble import get_ensemble_predictions

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
