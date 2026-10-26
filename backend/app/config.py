"""
Northgate AI Stock Predictor - Configuration Settings
"""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Northgate AI Stock Predictor"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # Supported major stock tickers & asset universe
    DEFAULT_TICKERS: list[str] = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", 
        "TSLA", "META", "JPM", "V", "SPY"
    ]
    
    CACHE_EXPIRATION_SECONDS: int = 300  # 5 minutes cache for heavy market history
    QUOTE_CACHE_EXPIRATION_SECONDS: int = 4  # 4 seconds cache for live ticking quotes
    NEWS_CACHE_EXPIRATION_SECONDS: int = 900  # 15 minutes cache for news

settings = Settings()
