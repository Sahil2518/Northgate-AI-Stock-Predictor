"""
Northgate AI Stock Predictor - Data Schemas & API Models
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# ----------------- Stock & Historical Schemas -----------------

class StockQuote(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    previous_close: float
    change: float
    change_percent: float
    day_high: float
    day_low: float
    fifty_two_week_high: float
    fifty_two_week_low: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    beta: Optional[float] = None
    dividend_yield: Optional[float] = None
    currency: str = "USD"
    last_updated: str

class HistoricalPricePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None

class StockHistoryResponse(BaseModel):
    ticker: str
    timeframe: str
    prices: List[HistoricalPricePoint]

# ----------------- Technical Indicators -----------------

class TechnicalIndicatorSummary(BaseModel):
    ticker: str
    current_price: float
    rsi_14: float
    rsi_condition: str  # "Overbought", "Neutral", "Oversold"
    macd: float
    macd_signal: float
    macd_crossover: str  # "Bullish Crossover", "Bearish Crossover", "Neutral"
    sma_20: float
    sma_50: float
    sma_200: float
    sma_trend: str  # "Golden Cross", "Death Cross", "Bullish", "Bearish"
    bb_upper: float
    bb_lower: float
    bb_position: str  # "Above Upper", "Inside Bands", "Below Lower"
    atr_14: float
    volatility_annualized: float

# ----------------- Prediction Schemas -----------------

class PredictionPoint(BaseModel):
    date: str
    predicted_close: float
    predicted_ml: float
    predicted_dl: float
    lower_bound_95: float
    upper_bound_95: float
    is_forecast: bool = True
    actual_close: Optional[float] = None

class PredictionMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float
    directional_accuracy_pct: float
    r2_score: float

class PredictionResponse(BaseModel):
    ticker: str
    horizon_days: int
    current_price: float
    predicted_final_price: float
    expected_change_pct: float
    metrics: PredictionMetrics
    predictions: List[PredictionPoint]
    model_weights: Dict[str, float]
    feature_importance: Dict[str, float]

# ----------------- News & Sentiment Schemas -----------------

class NewsArticle(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    sentiment_label: str  # "Bullish", "Neutral", "Bearish"
    sentiment_score: float  # -1.0 to 1.0
    summary: Optional[str] = None

class SentimentSummary(BaseModel):
    ticker: str
    compound_score: float
    sentiment_label: str  # "Strong Bullish", "Bullish", "Neutral", "Bearish", "Strong Bearish"
    bullish_pct: float
    neutral_pct: float
    bearish_pct: float
    articles_count: int
    sentiment_trend: str  # "Improving", "Stable", "Deteriorating"
    articles: List[NewsArticle]

# ----------------- Portfolio Optimization Schemas -----------------

class PortfolioOptimizeRequest(BaseModel):
    tickers: List[str] = Field(default=["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"], min_length=2)
    investment_amount: float = Field(default=10000.0, gt=0)
    risk_free_rate: float = Field(default=0.045, ge=0.0, le=0.20)
    timeframe_years: int = Field(default=2, ge=1, le=5)
    slippage_bps: float = Field(default=5.0, ge=0.0, le=100.0, description="Execution slippage in basis points")
    fee_per_trade: float = Field(default=0.0, ge=0.0, description="Broker commission fee per rebalance")

class OptimizedPortfolioAllocation(BaseModel):
    ticker: str
    weight: float
    allocated_cash: float
    estimated_shares: float

class PortfolioMetrics(BaseModel):
    expected_annual_return_pct: float
    annual_volatility_pct: float
    sharpe_ratio: float
    sortino_ratio: float
    var_95_pct: float  # 1-day Value-at-Risk at 95% confidence
    cvar_95_pct: float  # Conditional VaR (Expected Shortfall)

class PortfolioResult(BaseModel):
    name: str
    description: str
    metrics: PortfolioMetrics
    allocations: List[OptimizedPortfolioAllocation]

class EfficientFrontierPoint(BaseModel):
    volatility: float
    return_rate: float
    sharpe: float

class SimulatedPortfolioPoint(BaseModel):
    volatility: float
    return_rate: float
    sharpe: float

class PortfolioOptimizeResponse(BaseModel):
    tickers: List[str]
    investment_amount: float
    risk_free_rate: float
    max_sharpe_portfolio: PortfolioResult
    min_volatility_portfolio: PortfolioResult
    equal_weight_portfolio: PortfolioResult
    efficient_frontier: List[EfficientFrontierPoint]
    simulated_portfolios: List[SimulatedPortfolioPoint]
    correlation_matrix: Dict[str, Dict[str, float]]

# ----------------- Recommendation / Advisory Schemas -----------------

class SignalFactor(BaseModel):
    factor_name: str
    category: str  # "Machine Learning", "Technical Analysis", "News Sentiment", "Risk/Volatility"
    signal: str    # "Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"
    score: float   # -100 to +100
    weight: float
    explanation: str

class StockRecommendationResponse(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    recommendation: str  # "STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"
    confidence_score: float  # 0 to 100
    risk_level: str  # "Low", "Moderate", "High", "Very High"
    target_price_7d: float
    target_price_30d: float
    potential_upside_pct: float
    stop_loss_price: float
    risk_reward_ratio: float
    signals: List[SignalFactor]
    summary_analysis: str
    sentiment_impact: str
    ai_thesis: str
    last_updated: str

# ----------------- Crisis Stress Testing Schemas -----------------

class StressTestScenarioResult(BaseModel):
    scenario_id: str
    name: str
    historical_benchmark: str
    market_drawdown_pct: float
    portfolio_drawdown_pct: float
    estimated_dollar_loss: float
    recovery_months_est: int
    resilience_grade: str  # "A+", "A", "B", "C", "D"
    vulnerability_notes: str

class StressTestResponse(BaseModel):
    portfolio_name: str
    investment_amount: float
    overall_resilience_score: float  # 0 to 100
    scenarios: List[StressTestScenarioResult]
    hedging_recommendations: List[str]

class StressTestRequest(BaseModel):
    tickers: List[str] = Field(default=["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"])
    weights: Optional[List[float]] = None
    investment_amount: float = Field(default=10000.0, gt=0)

# ----------------- Paper Trading & Execution Simulator Schemas -----------------

class PaperOrderRequest(BaseModel):
    ticker: str
    action: str = Field(..., pattern="^(BUY|SELL)$")
    shares: float = Field(..., gt=0)
    order_type: str = Field(default="MARKET", pattern="^(MARKET|LIMIT)$")
    limit_price: Optional[float] = None
    stop_loss_price: Optional[float] = None
    target_price: Optional[float] = None

class PaperPosition(BaseModel):
    ticker: str
    company_name: str
    shares: float
    average_entry_price: float
    current_price: float
    market_value: float
    cost_basis: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    stop_loss_price: Optional[float] = None
    target_price: Optional[float] = None
    opened_at: str

class PaperTradeHistory(BaseModel):
    id: str
    ticker: str
    action: str
    shares: float
    execution_price: float
    total_amount: float
    realized_pnl: Optional[float] = None
    realized_pnl_pct: Optional[float] = None
    executed_at: str
    trigger_reason: str  # "Manual Order", "Stop-Loss Triggered", "Target Reached"

# ----------------- Wallet & Cashier Schemas -----------------

class WalletTransactionRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    method: str = Field(default="ACH", description="Payment or transfer method: ACH, WIRE, CARD, CHECKING")
    note: Optional[str] = Field(default=None, description="Optional memo or reference")

class CashTransactionRecord(BaseModel):
    id: str
    type: str  # "DEPOSIT", "WITHDRAWAL", "STOCK_BUY", "STOCK_SELL", "ACCOUNT_RESET"
    amount: float
    balance_after: float
    method: str
    status: str  # "SETTLED", "COMPLETED"
    timestamp: str
    description: str

class PaperAccountSummary(BaseModel):
    cash_balance: float
    portfolio_market_value: float
    total_equity: float
    initial_balance: float
    total_pnl: float
    total_pnl_pct: float
    open_positions_count: int
    total_trades_count: int
    win_rate_pct: float
    positions: List[PaperPosition]
    trade_history: List[PaperTradeHistory]
    cash_transactions: Optional[List[CashTransactionRecord]] = []
    total_deposited: Optional[float] = 0.0
    total_withdrawn: Optional[float] = 0.0

class BrokerStatusResponse(BaseModel):
    active_broker: str
    is_live_connected: bool
    paper_mode: bool
    latency_ms: float
    supported_features: List[str]

# ----------------- User Authentication & Profile Schemas -----------------

class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    full_name: str = Field(..., min_length=2, description="User full display name")

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Password")

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


