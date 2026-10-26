"""
Northgate AI Stock Predictor - Portfolio Optimization API Router
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PortfolioOptimizeRequest, PortfolioOptimizeResponse,
    StressTestRequest, StressTestResponse
)
from app.services.portfolio import optimize_portfolio, run_portfolio_stress_test

router = APIRouter(prefix="/portfolio", tags=["Portfolio Optimization"])

@router.post("/optimize", response_model=PortfolioOptimizeResponse)
def optimize_asset_portfolio(request: PortfolioOptimizeRequest):
    """
    Perform Modern Portfolio Theory (Markowitz) mean-variance optimization.
    Calculates Maximum Sharpe Ratio (Tangency), Minimum Volatility, Monte Carlo simulation,
    Efficient Frontier curve, VaR 95%, and CVaR 95%.
    """
    try:
        return optimize_portfolio(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio optimization failed: {str(e)}")

@router.post("/stress-test", response_model=StressTestResponse)
def stress_test_portfolio(request: StressTestRequest):
    """
    Simulate portfolio performance under historical crisis stress scenarios:
    2020 COVID-19 crash, 2022 Fed rate hike shock, 2008 Lehman collapse, and stagflation.
    """
    try:
        return run_portfolio_stress_test(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress test simulation failed: {str(e)}")

