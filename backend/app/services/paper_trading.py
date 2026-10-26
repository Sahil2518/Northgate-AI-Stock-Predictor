"""
Northgate AI Stock Predictor - Paper Trading & Simulated Brokerage Engine
========================================================================
Provides simulated order execution, automated bracket stop-loss enforcement,
position tracking, and persistent account state.
"""

import os
import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.models.schemas import (
    PaperOrderRequest, PaperPosition, PaperTradeHistory, PaperAccountSummary
)
from app.services.market_data import fetch_stock_quote

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
STATE_FILE = DATA_DIR / "paper_account.json"
DEFAULT_CAPITAL = 100000.0

def _ensure_storage():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        initial_state = {
            "cash_balance": DEFAULT_CAPITAL,
            "initial_balance": DEFAULT_CAPITAL,
            "positions": {},
            "trade_history": []
        }
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_state, f, indent=2)

def _load_state() -> Dict[str, Any]:
    _ensure_storage()
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "cash_balance": DEFAULT_CAPITAL,
            "initial_balance": DEFAULT_CAPITAL,
            "positions": {},
            "trade_history": []
        }

def _save_state(state: Dict[str, Any]):
    _ensure_storage()
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def get_paper_account() -> PaperAccountSummary:
    """
    Returns current account status, updates active positions with live market prices,
    and automatically executes any triggered stop-losses or target prices.
    """
    state = _load_state()
    cash = float(state.get("cash_balance", DEFAULT_CAPITAL))
    initial = float(state.get("initial_balance", DEFAULT_CAPITAL))
    positions_raw = state.get("positions", {})
    history_raw = state.get("trade_history", [])
    
    active_positions: List[PaperPosition] = []
    positions_to_remove = []
    state_modified = False
    
    total_market_val = 0.0
    
    for ticker, pos in list(positions_raw.items()):
        try:
            quote = fetch_stock_quote(ticker)
            current_price = quote.current_price
            company_name = quote.company_name
        except Exception:
            current_price = pos["average_entry_price"]
            company_name = pos.get("company_name", f"{ticker} Corp.")
            
        shares = float(pos["shares"])
        entry = float(pos["average_entry_price"])
        cost_basis = shares * entry
        market_val = shares * current_price
        unrealized = market_val - cost_basis
        unrealized_pct = (unrealized / cost_basis) * 100 if cost_basis > 0 else 0.0
        
        stop_loss = pos.get("stop_loss_price")
        target_price = pos.get("target_price")
        
        # Check automated bracket triggers
        triggered_reason = None
        if stop_loss and current_price <= stop_loss:
            triggered_reason = f"Automated Stop-Loss Triggered at ${stop_loss:.2f}"
        elif target_price and current_price >= target_price:
            triggered_reason = f"Target Price Profit Reached at ${target_price:.2f}"
            
        if triggered_reason:
            # Auto-execute closing trade
            realized_pnl = unrealized
            realized_pnl_pct = unrealized_pct
            cash += market_val
            
            trade = {
                "id": str(uuid.uuid4())[:8],
                "ticker": ticker,
                "action": "SELL",
                "shares": shares,
                "execution_price": round(current_price, 2),
                "total_amount": round(market_val, 2),
                "realized_pnl": round(realized_pnl, 2),
                "realized_pnl_pct": round(realized_pnl_pct, 2),
                "executed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "trigger_reason": triggered_reason
            }
            history_raw.insert(0, trade)
            positions_to_remove.append(ticker)
            state_modified = True
            continue
            
        total_market_val += market_val
        active_positions.append(
            PaperPosition(
                ticker=ticker,
                company_name=company_name,
                shares=shares,
                average_entry_price=round(entry, 2),
                current_price=round(current_price, 2),
                market_value=round(market_val, 2),
                cost_basis=round(cost_basis, 2),
                unrealized_pnl=round(unrealized, 2),
                unrealized_pnl_pct=round(unrealized_pct, 2),
                stop_loss_price=round(stop_loss, 2) if stop_loss else None,
                target_price=round(target_price, 2) if target_price else None,
                opened_at=pos.get("opened_at", datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))
            )
        )
        
    for t in positions_to_remove:
        del positions_raw[t]
        
    if state_modified:
        state["cash_balance"] = round(cash, 2)
        state["positions"] = positions_raw
        state["trade_history"] = history_raw
        _save_state(state)
        
    total_equity = cash + total_market_val
    total_pnl = total_equity - initial
    total_pnl_pct = (total_pnl / initial) * 100 if initial > 0 else 0.0
    
    # Calculate historical win rate
    closed_trades = [t for t in history_raw if t.get("realized_pnl") is not None]
    winning_trades = [t for t in closed_trades if t["realized_pnl"] > 0]
    win_rate = (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0.0
    
    history_objects = [
        PaperTradeHistory(
            id=t["id"],
            ticker=t["ticker"],
            action=t["action"],
            shares=t["shares"],
            execution_price=t["execution_price"],
            total_amount=t["total_amount"],
            realized_pnl=t.get("realized_pnl"),
            realized_pnl_pct=t.get("realized_pnl_pct"),
            executed_at=t["executed_at"],
            trigger_reason=t.get("trigger_reason", "Manual Order")
        ) for t in history_raw[:25]
    ]
    
    return PaperAccountSummary(
        cash_balance=round(cash, 2),
        portfolio_market_value=round(total_market_val, 2),
        total_equity=round(total_equity, 2),
        initial_balance=initial,
        total_pnl=round(total_pnl, 2),
        total_pnl_pct=round(total_pnl_pct, 2),
        open_positions_count=len(active_positions),
        total_trades_count=len(history_raw),
        win_rate_pct=round(win_rate, 1),
        positions=active_positions,
        trade_history=history_objects
    )

def execute_paper_order(request: PaperOrderRequest) -> PaperAccountSummary:
    """
    Executes a simulated Buy or Sell order at the current market price with realistic slippage.
    """
    state = _load_state()
    cash = float(state.get("cash_balance", DEFAULT_CAPITAL))
    positions = state.get("positions", {})
    history = state.get("trade_history", [])
    
    ticker = request.ticker.upper().strip()
    quote = fetch_stock_quote(ticker)
    
    # Realistic 5 basis points execution slippage
    slippage = 0.0005
    exec_price = quote.current_price * (1 + slippage if request.action == "BUY" else 1 - slippage)
    exec_price = round(exec_price, 2)
    
    total_cost = exec_price * request.shares
    
    if request.action == "BUY":
        if total_cost > cash:
            raise ValueError(f"Insufficient funds. Order requires ${total_cost:,.2f}, but available cash is ${cash:,.2f}.")
            
        cash -= total_cost
        
        # Check if already holding position
        if ticker in positions:
            prev = positions[ticker]
            prev_shares = float(prev["shares"])
            prev_entry = float(prev["average_entry_price"])
            new_shares = prev_shares + request.shares
            new_entry = ((prev_shares * prev_entry) + total_cost) / new_shares
            
            positions[ticker]["shares"] = round(new_shares, 4)
            positions[ticker]["average_entry_price"] = round(new_entry, 2)
            if request.stop_loss_price:
                positions[ticker]["stop_loss_price"] = request.stop_loss_price
            if request.target_price:
                positions[ticker]["target_price"] = request.target_price
        else:
            positions[ticker] = {
                "shares": round(request.shares, 4),
                "average_entry_price": exec_price,
                "company_name": quote.company_name,
                "stop_loss_price": request.stop_loss_price,
                "target_price": request.target_price,
                "opened_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            }
            
        trade_record = {
            "id": str(uuid.uuid4())[:8],
            "ticker": ticker,
            "action": "BUY",
            "shares": request.shares,
            "execution_price": exec_price,
            "total_amount": round(total_cost, 2),
            "realized_pnl": None,
            "realized_pnl_pct": None,
            "executed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "trigger_reason": "Manual Order"
        }
        history.insert(0, trade_record)
        
    elif request.action == "SELL":
        if ticker not in positions:
            raise ValueError(f"Cannot sell {ticker}. No active position found.")
            
        current_holding = positions[ticker]
        prev_shares = float(current_holding["shares"])
        
        if request.shares > prev_shares:
            raise ValueError(f"Cannot sell {request.shares} shares. You only own {prev_shares} shares.")
            
        proceeds = total_cost
        cash += proceeds
        
        entry = float(current_holding["average_entry_price"])
        realized_pnl = (exec_price - entry) * request.shares
        realized_pnl_pct = ((exec_price - entry) / entry) * 100
        
        if request.shares == prev_shares:
            del positions[ticker]
        else:
            positions[ticker]["shares"] = round(prev_shares - request.shares, 4)
            
        trade_record = {
            "id": str(uuid.uuid4())[:8],
            "ticker": ticker,
            "action": "SELL",
            "shares": request.shares,
            "execution_price": exec_price,
            "total_amount": round(proceeds, 2),
            "realized_pnl": round(realized_pnl, 2),
            "realized_pnl_pct": round(realized_pnl_pct, 2),
            "executed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "trigger_reason": "Manual Order"
        }
        history.insert(0, trade_record)
        
    state["cash_balance"] = round(cash, 2)
    state["positions"] = positions
    state["trade_history"] = history
    _save_state(state)
    
    return get_paper_account()

def reset_paper_account() -> PaperAccountSummary:
    """Resets the paper trading account back to $100,000 cash balance."""
    initial_state = {
        "cash_balance": DEFAULT_CAPITAL,
        "initial_balance": DEFAULT_CAPITAL,
        "positions": {},
        "trade_history": []
    }
    _save_state(initial_state)
    return get_paper_account()
