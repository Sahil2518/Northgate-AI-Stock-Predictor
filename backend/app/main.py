"""
Northgate AI Stock Predictor - Main FastAPI Application
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.stocks import router as stocks_router
from app.api.prediction import router as prediction_router
from app.api.sentiment import router as sentiment_router
from app.api.portfolio import router as portfolio_router
from app.api.recommendations import router as recommendations_router
from app.api.paper_trading import router as paper_trading_router

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

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
