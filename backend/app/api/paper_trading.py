"""
Northgate AI Stock Predictor - Paper Trading API Router
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import (
    PaperOrderRequest, PaperAccountSummary, BrokerStatusResponse,
    WalletTransactionRequest, CashTransactionRecord
)
from app.services.paper_trading import (
    get_paper_account, execute_paper_order, reset_paper_account
)
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

@router.post("/wallet/deposit", response_model=PaperAccountSummary)
def deposit_funds(req: WalletTransactionRequest):
    """
    Deposit funds into trading account wallet via simulated ACH, Fedwire, or linked banking rails.
    """
    try:
        adapter = get_broker_adapter()
        return adapter.deposit(req)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deposit transaction failed: {str(e)}")

@router.post("/wallet/withdraw", response_model=PaperAccountSummary)
def withdraw_funds(req: WalletTransactionRequest):
    """
    Withdraw available cash from trading account wallet back to linked bank account.
    """
    try:
        adapter = get_broker_adapter()
        return adapter.withdraw(req)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Withdrawal transaction failed: {str(e)}")

@router.get("/wallet/transactions", response_model=List[CashTransactionRecord])
def get_wallet_transactions():
    """
    Retrieve cash ledger statement of all deposits, withdrawals, and trade settlements.
    """
    try:
        adapter = get_broker_adapter()
        portfolio = adapter.get_portfolio()
        return portfolio.cash_transactions or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch wallet transactions: {str(e)}")

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
