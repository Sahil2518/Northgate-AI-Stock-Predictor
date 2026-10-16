"""
Northgate AI Stock Predictor - Sentiment API Router
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import SentimentSummary
from app.services.sentiment import get_ticker_sentiment

router = APIRouter(prefix="/sentiment", tags=["News & Sentiment Analysis"])

@router.get("/{ticker}", response_model=SentimentSummary)
def get_sentiment(ticker: str):
    """
    Retrieve real-time financial news sentiment, bullish/bearish ratio,
    compound sentiment score, and classified article headlines.
    """
    try:
        return get_ticker_sentiment(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed for {ticker}: {str(e)}")
