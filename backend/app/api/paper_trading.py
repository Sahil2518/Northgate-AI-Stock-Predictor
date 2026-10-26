"""
Northgate AI Stock Predictor - Paper Trading API Router
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PaperOrderRequest, PaperAccountSummary, BrokerStatusResponse
)
from app.services.paper_trading import get_paper_account, execute_paper_order, reset_paper_account
from app.services.broker_adapter import get_broker_adapter

router = APIRouter(prefix="/paper-trading", tags=["Paper Trading & Brokerage"])

@router.get("/account", response_model=PaperAccountSummary)
def get_account():
    """
    Retrieve real-time paper trading account status, open positions,
    unrealized/realized P&L, and trade history ledger.
    """
    try:
        adapter = get_broker_adapter()
        return adapter.get_portfolio()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch paper trading account: {str(e)}")

@router.post("/order", response_model=PaperAccountSummary)
def place_order(order: PaperOrderRequest):
    """
    Execute a simulated Buy or Sell order with realistic execution slippage
    and automated bracket stop-loss attachment.
    """
    try:
        adapter = get_broker_adapter()
        return adapter.place_order(order)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order execution failed: {str(e)}")

@router.post("/reset", response_model=PaperAccountSummary)
def reset_account():
    """Reset virtual capital balance back to initial $100,000.00."""
    try:
        return reset_paper_account()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset account: {str(e)}")

@router.get("/broker-status", response_model=BrokerStatusResponse)
def get_broker_status():
    """Check active broker engine connection and routing capabilities."""
    try:
        adapter = get_broker_adapter()
        return adapter.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check broker status: {str(e)}")
