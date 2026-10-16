"""
Northgate AI Stock Predictor - Recommendations & Advisory API Router
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.config import settings
from app.models.schemas import StockRecommendationResponse
from app.services.advisor import generate_stock_recommendation

router = APIRouter(prefix="/recommendations", tags=["AI Advisory & Recommendations"])

@router.get("/{ticker}", response_model=StockRecommendationResponse)
def get_recommendation(ticker: str):
    """
    Generate multi-factor Buy/Hold/Sell decision synthesized across
    AI predictive models, technical indicators, news sentiment velocity, and risk parameters.
    """
    try:
        return generate_stock_recommendation(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed for {ticker}: {str(e)}")

@router.get("/universe/summary", response_model=List[StockRecommendationResponse])
def get_universe_recommendations():
    """Generate recommendations for the core asset universe."""
    recs = []
    for ticker in settings.DEFAULT_TICKERS[:5]:
        try:
            recs.append(generate_stock_recommendation(ticker))
        except Exception:
            continue
    return recs
