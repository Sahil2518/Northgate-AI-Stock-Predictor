"""
Northgate AI Stock Predictor - Portfolio Optimization API Router
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import PortfolioOptimizeRequest, PortfolioOptimizeResponse
from app.services.portfolio import optimize_portfolio

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
