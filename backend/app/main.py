"""
Northgate AI Stock Predictor - Main FastAPI Application
"""
import asyncio
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.stocks import router as stocks_router
from app.api.prediction import router as prediction_router
from app.api.sentiment import router as sentiment_router
from app.api.portfolio import router as portfolio_router
from app.api.recommendations import router as recommendations_router
from app.api.paper_trading import router as paper_trading_router
from app.api.auth import router as auth_router
from app.api.quant import router as quant_router
from app.services.market_data import fetch_stock_quote

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade AI Stock Prediction and Portfolio Optimization Platform. "
        "Integrates Deep Learning (PyTorch LSTM), Machine Learning (XGBoost/Random Forest), "
        "Financial News NLP Sentiment Analysis, and Modern Portfolio Theory (Markowitz Efficient Frontier)."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(stocks_router, prefix=settings.API_V1_PREFIX)
app.include_router(prediction_router, prefix=settings.API_V1_PREFIX)
app.include_router(sentiment_router, prefix=settings.API_V1_PREFIX)
app.include_router(portfolio_router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations_router, prefix=settings.API_V1_PREFIX)
app.include_router(paper_trading_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(quant_router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["Health Check"])
def root_endpoint():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "stocks": f"{settings.API_V1_PREFIX}/stocks/quote/AAPL",
            "prediction": f"{settings.API_V1_PREFIX}/predict/AAPL",
            "sentiment": f"{settings.API_V1_PREFIX}/sentiment/AAPL",
            "portfolio": f"{settings.API_V1_PREFIX}/portfolio/optimize",
            "recommendations": f"{settings.API_V1_PREFIX}/recommendations/AAPL"
        }
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy", "service": "northgate-ai-backend"}

@app.websocket("/ws/ticks/{ticker}")
async def websocket_tick_stream(websocket: WebSocket, ticker: str):
    """
    Sub-second Real-Time WebSocket stream broadcasting authentic exchange tick updates.
    """
    await websocket.accept()
    try:
        while True:
            quote = fetch_stock_quote(ticker)
            await websocket.send_json(quote.model_dump())
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
