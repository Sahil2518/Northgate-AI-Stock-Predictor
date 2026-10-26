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
    
    # Supported major stock tickers & asset universe (Indian NSE bluechips + Global leaders)
    DEFAULT_TICKERS: list[str] = [
        "RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS",
        "SBIN", "ITC", "ICICIBANK", "AAPL", "NVDA", "MSFT", "TSLA"
    ]
    
    # Market Configuration
    DEFAULT_CURRENCY: str = "INR"
    DEFAULT_CURRENCY_SYMBOL: str = "₹"
    EXCHANGE_TIMEZONE: str = "Asia/Kolkata"
    
    # Broker Integration Configuration
    BROKER_TYPE: str = os.getenv("BROKER_TYPE", "LOCAL_PAPER")  # "DHAN", "ANGEL_ONE", "ALPACA", "LOCAL_PAPER"
    LIVE_EXECUTION_ENABLED: bool = os.getenv("LIVE_EXECUTION_ENABLED", "false").lower() == "true"
    
    # Dhan HQ Credentials
    DHAN_CLIENT_ID: str = os.getenv("DHAN_CLIENT_ID", "")
    DHAN_ACCESS_TOKEN: str = os.getenv("DHAN_ACCESS_TOKEN", "")
    
    # Angel One SmartAPI Credentials
    ANGEL_API_KEY: str = os.getenv("ANGEL_API_KEY", "")
    ANGEL_CLIENT_CODE: str = os.getenv("ANGEL_CLIENT_CODE", "")
    ANGEL_PIN: str = os.getenv("ANGEL_PIN", "")
    ANGEL_TOTP_KEY: str = os.getenv("ANGEL_TOTP_KEY", "")

    CACHE_EXPIRATION_SECONDS: int = 300  # 5 minutes cache for heavy market history
    QUOTE_CACHE_EXPIRATION_SECONDS: int = 4  # 4 seconds cache for live ticking quotes
    NEWS_CACHE_EXPIRATION_SECONDS: int = 900  # 15 minutes cache for news

settings = Settings()
