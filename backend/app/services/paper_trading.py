"""
Northgate AI Stock Predictor - Multi-Tenant Paper Trading & Brokerage Engine
===========================================================================
Provides user-isolated simulated order execution, automated bracket stop-loss enforcement,
position tracking, and persistent SQLite database state.
"""

import os
import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.models.schemas import (
    PaperOrderRequest, PaperPosition, PaperTradeHistory, PaperAccountSummary,
    CashTransactionRecord, WalletTransactionRequest
)
from app.services.market_data import fetch_stock_quote
from app.db.database import (
    get_or_create_portfolio, update_portfolio, get_positions_by_user,
    upsert_position, delete_position, add_trade, get_trades_by_user,
    add_cash_transaction, get_cash_transactions_by_user, reset_user_portfolio_db,
    get_user_by_email
)

DEFAULT_CAPITAL = 100000.0

def _resolve_user_id(user_id: Optional[int] = None) -> int:
    """Resolves to the specified user_id or seamlessly defaults to the Demo Trader account."""
    if user_id is not None:
        return user_id
    demo = get_user_by_email("demo@northgate.ai")
    return demo["id"] if demo else 1

def get_paper_account(user_id: Optional[int] = None) -> PaperAccountSummary:
    """
    Returns current account status for a specific user, updates active positions with live market prices,
    and automatically executes any triggered stop-losses or target prices.
    """
    uid = _resolve_user_id(user_id)
    portfolio = get_or_create_portfolio(uid)
    cash = float(portfolio["cash_balance"])
    initial = float(portfolio["initial_balance"])
    total_dep = float(portfolio.get("total_deposited", DEFAULT_CAPITAL))
    total_wth = float(portfolio.get("total_withdrawn", 0.0))

    positions_raw = get_positions_by_user(uid)
    active_positions: List[PaperPosition] = []
    total_market_val = 0.0

    for pos in positions_raw:
        ticker = pos["ticker"]
        try:
            quote = fetch_stock_quote(ticker)
            current_price = quote.current_price
            company_name = quote.company_name
        except Exception:
            current_price = float(pos["average_entry_price"])
            company_name = pos.get("company_name", f"{ticker} Corp.")

        shares = float(pos["shares"])
        entry = float(pos["average_entry_price"])
        cost_basis = shares * entry
        market_val = shares * current_price
        unrealized = market_val - cost_basis
        unrealized_pct = (unrealized / cost_basis) * 100 if cost_basis > 0 else 0.0

        stop_loss = float(pos["stop_loss_price"]) if pos.get("stop_loss_price") is not None else None
        target_price = float(pos["target_price"]) if pos.get("target_price") is not None else None

        # Check automated bracket triggers
        triggered_reason = None
        if stop_loss and current_price <= stop_loss:
            triggered_reason = f"Automated Stop-Loss Triggered at ${stop_loss:.2f}"
        elif target_price and current_price >= target_price:
            triggered_reason = f"Target Price Profit Reached at ${target_price:.2f}"

        if triggered_reason:
            # Auto-execute closing trade in database
            realized_pnl = unrealized
            realized_pnl_pct = unrealized_pct
            cash += market_val

            closing_trade = {
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
            add_trade(uid, closing_trade)
            delete_position(uid, ticker)

            add_cash_transaction(uid, {
                "id": f"tx_brk_{uuid.uuid4().hex[:8]}",
                "type": "STOCK_SELL",
                "amount": round(market_val, 2),
                "balance_after": round(cash, 2),
                "method": "AUTO_BRACKET",
                "status": "SETTLED",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "description": f"{triggered_reason}: Liquidated {shares} {ticker} @ ${current_price:.2f}"
            })
            update_portfolio(uid, cash, total_dep, total_wth)
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

    total_equity = cash + total_market_val
    total_pnl = total_equity - initial
    total_pnl_pct = (total_pnl / initial) * 100 if initial > 0 else 0.0

    history_raw = get_trades_by_user(uid, limit=25)
    closed_trades = [t for t in history_raw if t.get("realized_pnl") is not None]
    winning_trades = [t for t in closed_trades if float(t["realized_pnl"]) > 0]
    win_rate = (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0.0

    history_objects = [
        PaperTradeHistory(
            id=t["id"],
            ticker=t["ticker"],
            action=t["action"],
            shares=float(t["shares"]),
            execution_price=float(t["execution_price"]),
            total_amount=float(t["total_amount"]),
            realized_pnl=float(t["realized_pnl"]) if t.get("realized_pnl") is not None else None,
            realized_pnl_pct=float(t["realized_pnl_pct"]) if t.get("realized_pnl_pct") is not None else None,
            executed_at=t["executed_at"],
            trigger_reason=t.get("trigger_reason", "Manual Order")
        ) for t in history_raw
    ]

    cash_tx_raw = get_cash_transactions_by_user(uid, limit=50)
    cash_tx_objects = [
        CashTransactionRecord(
            id=tx["id"],
            type=tx["type"],
            amount=float(tx["amount"]),
            balance_after=float(tx["balance_after"]),
            method=tx.get("method", "ACH"),
            status=tx.get("status", "SETTLED"),
            timestamp=tx["timestamp"],
            description=tx.get("description", "")
        ) for tx in cash_tx_raw
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
        trade_history=history_objects,
        cash_transactions=cash_tx_objects,
        total_deposited=round(total_dep, 2),
        total_withdrawn=round(total_wth, 2)
    )

def execute_paper_order(request: PaperOrderRequest, user_id: Optional[int] = None) -> PaperAccountSummary:
    """
    Executes a simulated Buy or Sell order at the current market price with realistic slippage
    within the authenticated user's private SQLite ledger.
    """
    uid = _resolve_user_id(user_id)
    portfolio = get_or_create_portfolio(uid)
    cash = float(portfolio["cash_balance"])
    total_dep = float(portfolio.get("total_deposited", DEFAULT_CAPITAL))
    total_wth = float(portfolio.get("total_withdrawn", 0.0))

    positions_list = get_positions_by_user(uid)
    positions_map = {p["ticker"]: p for p in positions_list}

    ticker = request.ticker.upper().strip()
    quote = fetch_stock_quote(ticker)

    # Realistic 5 basis points execution slippage
    slippage = 0.0005
    exec_price = quote.current_price * (1 + slippage if request.action == "BUY" else 1 - slippage)
    exec_price = round(exec_price, 2)
    total_cost = exec_price * request.shares

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if request.action == "BUY":
        if total_cost > cash:
            if cash <= 0:
                raise ValueError("Account unfunded ($0.00 cash). Please deposit funds via the Cashier Hub to begin trading.")
            raise ValueError(f"Insufficient funds. Order requires ${total_cost:,.2f}, but available cash is ${cash:,.2f}.")

        cash -= total_cost

        if ticker in positions_map:
            prev = positions_map[ticker]
            prev_shares = float(prev["shares"])
            prev_entry = float(prev["average_entry_price"])
            new_shares = prev_shares + request.shares
            new_entry = ((prev_shares * prev_entry) + total_cost) / new_shares
            sl = request.stop_loss_price or prev.get("stop_loss_price")
            tp = request.target_price or prev.get("target_price")
            upsert_position(uid, ticker, quote.company_name, round(new_shares, 4), round(new_entry, 2), sl, tp)
        else:
            upsert_position(uid, ticker, quote.company_name, round(request.shares, 4), exec_price, request.stop_loss_price, request.target_price)

        add_trade(uid, {
            "id": str(uuid.uuid4())[:8],
            "ticker": ticker,
            "action": "BUY",
            "shares": request.shares,
            "execution_price": exec_price,
            "total_amount": round(total_cost, 2),
            "realized_pnl": None,
            "realized_pnl_pct": None,
            "executed_at": now_str,
            "trigger_reason": "Manual Order"
        })

        add_cash_transaction(uid, {
            "id": f"tx_buy_{uuid.uuid4().hex[:8]}",
            "type": "STOCK_BUY",
            "amount": -round(total_cost, 2),
            "balance_after": round(cash, 2),
            "method": "EXCHANGE_SETTLEMENT",
            "status": "SETTLED",
            "timestamp": now_str,
            "description": f"Executed BUY {request.shares} {ticker} @ ${exec_price:.2f}"
        })

    elif request.action == "SELL":
        if ticker not in positions_map:
            raise ValueError(f"Cannot sell {ticker}. No active position found.")

        current_holding = positions_map[ticker]
        prev_shares = float(current_holding["shares"])

        if request.shares > prev_shares:
            raise ValueError(f"Cannot sell {request.shares} shares. You only own {prev_shares} shares.")

        proceeds = total_cost
        cash += proceeds

        entry = float(current_holding["average_entry_price"])
        realized_pnl = (exec_price - entry) * request.shares
        realized_pnl_pct = ((exec_price - entry) / entry) * 100

        if request.shares == prev_shares:
            delete_position(uid, ticker)
        else:
            upsert_position(
                uid,
                ticker,
                current_holding.get("company_name", f"{ticker} Corp."),
                round(prev_shares - request.shares, 4),
                entry,
                current_holding.get("stop_loss_price"),
                current_holding.get("target_price")
            )

        add_trade(uid, {
            "id": str(uuid.uuid4())[:8],
            "ticker": ticker,
            "action": "SELL",
            "shares": request.shares,
            "execution_price": exec_price,
            "total_amount": round(proceeds, 2),
            "realized_pnl": round(realized_pnl, 2),
            "realized_pnl_pct": round(realized_pnl_pct, 2),
            "executed_at": now_str,
            "trigger_reason": "Manual Order"
        })

        add_cash_transaction(uid, {
            "id": f"tx_sell_{uuid.uuid4().hex[:8]}",
            "type": "STOCK_SELL",
            "amount": round(proceeds, 2),
            "balance_after": round(cash, 2),
            "method": "EXCHANGE_SETTLEMENT",
            "status": "SETTLED",
            "timestamp": now_str,
            "description": f"Executed SELL {request.shares} {ticker} @ ${exec_price:.2f}"
        })

    update_portfolio(uid, cash, total_dep, total_wth)
    return get_paper_account(uid)

def deposit_cash(amount: float, method: str = "ACH", note: Optional[str] = None, user_id: Optional[int] = None) -> PaperAccountSummary:
    """Deposit virtual cash into the user's trading account via simulated banking rails."""
    if amount <= 0:
        raise ValueError("Deposit amount must be strictly greater than $0.")

    uid = _resolve_user_id(user_id)
    portfolio = get_or_create_portfolio(uid)
    cash = float(portfolio["cash_balance"]) + amount
    total_dep = float(portfolio.get("total_deposited", DEFAULT_CAPITAL)) + amount
    total_wth = float(portfolio.get("total_withdrawn", 0.0))

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    add_cash_transaction(uid, {
        "id": f"tx_dep_{uuid.uuid4().hex[:8]}",
        "type": "DEPOSIT",
        "amount": round(amount, 2),
        "balance_after": round(cash, 2),
        "method": method.upper(),
        "status": "SETTLED",
        "timestamp": now_str,
        "description": f"Deposit via {method.upper()} (+${amount:,.2f}) {f'[{note}]' if note else ''}".strip()
    })

    update_portfolio(uid, cash, total_dep, total_wth)
    return get_paper_account(uid)

def withdraw_cash(amount: float, method: str = "ACH", note: Optional[str] = None, user_id: Optional[int] = None) -> PaperAccountSummary:
    """Withdraw virtual cash from the user's trading account back to a linked bank."""
    if amount <= 0:
        raise ValueError("Withdrawal amount must be strictly greater than $0.")

    uid = _resolve_user_id(user_id)
    portfolio = get_or_create_portfolio(uid)
    cash = float(portfolio["cash_balance"])
    if amount > cash:
        raise ValueError(f"Insufficient cash balance for withdrawal. Requested ${amount:,.2f}, available cash is ${cash:,.2f}.")

    cash -= amount
    total_dep = float(portfolio.get("total_deposited", DEFAULT_CAPITAL))
    total_wth = float(portfolio.get("total_withdrawn", 0.0)) + amount

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    add_cash_transaction(uid, {
        "id": f"tx_wth_{uuid.uuid4().hex[:8]}",
        "type": "WITHDRAWAL",
        "amount": -round(amount, 2),
        "balance_after": round(cash, 2),
        "method": method.upper(),
        "status": "SETTLED",
        "timestamp": now_str,
        "description": f"Withdrawal to {method.upper()} (-${amount:,.2f}) {f'[{note}]' if note else ''}".strip()
    })

    update_portfolio(uid, cash, total_dep, total_wth)
    return get_paper_account(uid)

def reset_paper_account(user_id: Optional[int] = None, target_balance: Optional[float] = None) -> PaperAccountSummary:
    """Resets the paper trading account in SQLite (defaults to $0.00 for personal users, $100k for demo)."""
    uid = _resolve_user_id(user_id)
    reset_user_portfolio_db(uid, target_balance=target_balance)
    return get_paper_account(uid)
