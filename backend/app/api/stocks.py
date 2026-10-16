"""
Northgate AI Stock Predictor - Stocks API Router
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.config import settings
from app.models.schemas import StockQuote, StockHistoryResponse, TechnicalIndicatorSummary
from app.services.market_data import fetch_stock_quote, fetch_stock_history, get_history_with_indicators
from app.services.technical import get_technical_summary

router = APIRouter(prefix="/stocks", tags=["Stocks & Market Data"])

@router.get("/quote/{ticker}", response_model=StockQuote)
def get_quote(ticker: str):
    """Retrieve real-time market quote, fundamental ratios, and 52-week statistics."""
    try:
        return fetch_stock_quote(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quote for {ticker}: {str(e)}")

@router.get("/history/{ticker}", response_model=StockHistoryResponse)
def get_history(
    ticker: str,
    period: str = Query("1y", pattern="^(1mo|3mo|6mo|1y|2y|5y)$", description="Historical lookback window")
):
    """Retrieve historical OHLCV price series enriched with technical indicators."""
    try:
        return get_history_with_indicators(ticker, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history for {ticker}: {str(e)}")

@router.get("/technicals/{ticker}", response_model=TechnicalIndicatorSummary)
def get_technicals(ticker: str):
    """Compute RSI, MACD, Bollinger Bands, ATR, Moving Average trend status."""
    try:
        df = fetch_stock_history(ticker, period="1y")
        return get_technical_summary(df, ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute technicals for {ticker}: {str(e)}")

@router.get("/watchlist", response_model=List[StockQuote])
def get_watchlist():
    """Retrieve quotes for default universe of major watchlist equities."""
    quotes = []
    for ticker in settings.DEFAULT_TICKERS[:8]:
        try:
            quotes.append(fetch_stock_quote(ticker))
        except Exception:
            continue
    return quotes
