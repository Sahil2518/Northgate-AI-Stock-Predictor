"""
Northgate AI Stock Predictor - Embedded Relational Database (SQLite)
==================================================================
Manages multi-tenant user accounts, isolated portfolios, positions,
trade executions, and cash movement ledgers.
"""

import sqlite3
import datetime
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.security import hash_password

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "northgate.db"

def get_db():
    """Provides a thread-safe SQLite connection with dictionary row access."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes the database schema and seeds the default Demo Trader account."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'trader',
                created_at TEXT NOT NULL
            );
        """)

        # 2. Portfolios Table (1:1 with Users)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS portfolios (
                user_id INTEGER PRIMARY KEY,
                cash_balance REAL DEFAULT 100000.0,
                initial_balance REAL DEFAULT 100000.0,
                total_deposited REAL DEFAULT 100000.0,
                total_withdrawn REAL DEFAULT 0.0,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # 3. Positions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ticker TEXT NOT NULL,
                company_name TEXT NOT NULL,
                shares REAL NOT NULL,
                average_entry_price REAL NOT NULL,
                stop_loss_price REAL,
                target_price REAL,
                opened_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, ticker)
            );
        """)

        # 4. Trades Ledger Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                ticker TEXT NOT NULL,
                action TEXT NOT NULL,
                shares REAL NOT NULL,
                execution_price REAL NOT NULL,
                total_amount REAL NOT NULL,
                realized_pnl REAL,
                realized_pnl_pct REAL,
                executed_at TEXT NOT NULL,
                trigger_reason TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # 5. Cashier Ledger Table (Deposits, Withdrawals, Order Clearances)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cash_transactions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                balance_after REAL NOT NULL,
                method TEXT NOT NULL,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        conn.commit()

        # Seed Demo Trader if not present
        cursor.execute("SELECT id FROM users WHERE email = 'demo@northgate.ai';")
        demo_user = cursor.fetchone()
        if not demo_user:
            demo_now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO users (email, hashed_password, full_name, role, created_at)
                VALUES (?, ?, ?, 'demo', ?);
            """, (
                "demo@northgate.ai",
                hash_password("demotrader2026"),
                "Demo Institutional Trader",
                demo_now
            ))
            demo_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO portfolios (user_id, cash_balance, initial_balance, total_deposited, total_withdrawn, updated_at)
                VALUES (?, 100000.0, 100000.0, 100000.0, 0.0, ?);
            """, (demo_id, demo_now))

            cursor.execute("""
                INSERT INTO cash_transactions (id, user_id, type, amount, balance_after, method, status, timestamp, description)
                VALUES (?, ?, 'ACCOUNT_RESET', 100000.0, 100000.0, 'INITIAL_ALLOCATION', 'SETTLED', ?, 'Initial Demo Trading Capital ($100k Sandbox)');
            """, (f"tx_demo_{uuid.uuid4().hex[:8]}", demo_id, demo_now))
            conn.commit()

# Initialize immediately when module is loaded
init_db()

# ----------------- User Queries -----------------

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?);", (email.strip(),))
        row = cursor.fetchone()
        return dict(row) if row else None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def create_user(email: str, password: str, full_name: str, role: str = "trader") -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, created_at)
            VALUES (?, ?, ?, ?, ?);
        """, (
            email.lower().strip(),
            hash_password(password),
            full_name.strip(),
            role,
            now
        ))
        user_id = cursor.lastrowid

        # Initialize user's $100k isolated virtual portfolio
        cursor.execute("""
            INSERT INTO portfolios (user_id, cash_balance, initial_balance, total_deposited, total_withdrawn, updated_at)
            VALUES (?, 100000.0, 100000.0, 100000.0, 0.0, ?);
        """, (user_id, now))

        cursor.execute("""
            INSERT INTO cash_transactions (id, user_id, type, amount, balance_after, method, status, timestamp, description)
            VALUES (?, ?, 'ACCOUNT_RESET', 100000.0, 100000.0, 'INITIAL_ALLOCATION', 'SETTLED', ?, 'Initial Trading Capital ($100k Sandbox)');
        """, (f"tx_init_{uuid.uuid4().hex[:8]}", user_id, now))

        conn.commit()
        return get_user_by_id(user_id)

# ----------------- Isolated Portfolio Queries -----------------

def get_or_create_portfolio(user_id: int) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM portfolios WHERE user_id = ?;", (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO portfolios (user_id, cash_balance, initial_balance, total_deposited, total_withdrawn, updated_at)
            VALUES (?, 100000.0, 100000.0, 100000.0, 0.0, ?);
        """, (user_id, now))
        conn.commit()
        cursor.execute("SELECT * FROM portfolios WHERE user_id = ?;", (user_id,))
        return dict(cursor.fetchone())

def update_portfolio(user_id: int, cash: float, total_deposited: float, total_withdrawn: float):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE portfolios 
            SET cash_balance = ?, total_deposited = ?, total_withdrawn = ?, updated_at = ?
            WHERE user_id = ?;
        """, (round(cash, 2), round(total_deposited, 2), round(total_withdrawn, 2), now, user_id))
        conn.commit()

def get_positions_by_user(user_id: int) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM positions WHERE user_id = ? ORDER BY id DESC;", (user_id,))
        return [dict(r) for r in cursor.fetchall()]

def upsert_position(user_id: int, ticker: str, company_name: str, shares: float, avg_entry: float, stop_loss: Optional[float] = None, target_price: Optional[float] = None):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO positions (user_id, ticker, company_name, shares, average_entry_price, stop_loss_price, target_price, opened_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, ticker) DO UPDATE SET
                shares = excluded.shares,
                average_entry_price = excluded.average_entry_price,
                stop_loss_price = excluded.stop_loss_price,
                target_price = excluded.target_price;
        """, (user_id, ticker.upper().strip(), company_name, shares, avg_entry, stop_loss, target_price, now))
        conn.commit()

def delete_position(user_id: int, ticker: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM positions WHERE user_id = ? AND ticker = ?;", (user_id, ticker.upper().strip()))
        conn.commit()

def add_trade(user_id: int, trade: Dict[str, Any]):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO trades (id, user_id, ticker, action, shares, execution_price, total_amount, realized_pnl, realized_pnl_pct, executed_at, trigger_reason)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            trade["id"],
            user_id,
            trade["ticker"],
            trade["action"],
            trade["shares"],
            trade["execution_price"],
            trade["total_amount"],
            trade.get("realized_pnl"),
            trade.get("realized_pnl_pct"),
            trade["executed_at"],
            trade.get("trigger_reason", "Manual Order")
        ))
        conn.commit()

def get_trades_by_user(user_id: int, limit: int = 25) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trades WHERE user_id = ? ORDER BY executed_at DESC LIMIT ?;", (user_id, limit))
        return [dict(r) for r in cursor.fetchall()]

def add_cash_transaction(user_id: int, tx: Dict[str, Any]):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cash_transactions (id, user_id, type, amount, balance_after, method, status, timestamp, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            tx["id"],
            user_id,
            tx["type"],
            tx["amount"],
            tx["balance_after"],
            tx.get("method", "ACH"),
            tx.get("status", "SETTLED"),
            tx["timestamp"],
            tx.get("description", "")
        ))
        conn.commit()

def get_cash_transactions_by_user(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cash_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?;", (user_id, limit))
        return [dict(r) for r in cursor.fetchall()]

def reset_user_portfolio_db(user_id: int):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM positions WHERE user_id = ?;", (user_id,))
        cursor.execute("DELETE FROM trades WHERE user_id = ?;", (user_id,))
        cursor.execute("DELETE FROM cash_transactions WHERE user_id = ?;", (user_id,))
        cursor.execute("""
            UPDATE portfolios 
            SET cash_balance = 100000.0, initial_balance = 100000.0, total_deposited = 100000.0, total_withdrawn = 0.0, updated_at = ?
            WHERE user_id = ?;
        """, (now, user_id))
        cursor.execute("""
            INSERT INTO cash_transactions (id, user_id, type, amount, balance_after, method, status, timestamp, description)
            VALUES (?, ?, 'ACCOUNT_RESET', 100000.0, 100000.0, 'INITIAL_ALLOCATION', 'SETTLED', ?, 'Virtual Trading Account Reset to $100,000');
        """, (f"tx_rst_{uuid.uuid4().hex[:8]}", user_id, now))
        conn.commit()
