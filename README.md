# Northgate AI Stock Predictor & Institutional Trading Terminal

> **Production-Grade AI Equity Intelligence, Multi-Model Time-Series Forecasting, Modern Portfolio Optimization, and Multi-Tenant Execution Terminal**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.14+-EE4C2C.svg?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.2+-2962FF.svg?style=flat)](https://xgboost.readthedocs.io)
[![SQLite](https://img.shields.io/badge/SQLite-Multi--Tenant-003B57.svg?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![JWT](https://img.shields.io/badge/JWT-HS256_Auth-black.svg?style=flat&logo=jsonwebtokens)](https://jwt.io)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Tests-15%2F15%20Passing-success.svg?style=flat&logo=pytest&logoColor=white)](https://docs.pytest.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🏛️ System Architecture Overview

```
                      ┌─────────────────────────────────────────────────────────────┐
                      │    Northgate Pro Multi-Pane Terminal (React 19 + Tailwind)   │
                      │ ┌───────────────┬────────────────────────────┬────────────┐ │
                      │ │ 56px Nav Rail │ Chart Canvas (Confidence)  │ AI Order   │ │
                      │ │ Asset Bar     │ Bottom Dock (Positions)    │ Ticket     │ │
                      │ └───────────────┴────────────────────────────┴────────────┘ │
                      │    [ 1-Click Demo / JWT Session ]  [ Cashier & Wallet Hub ]  │
                      └──────────────────────────────┬──────────────────────────────┘
                                                     │ HTTP / JSON REST + Bearer Token
                                                     ▼
                      ┌─────────────────────────────────────────────────────────────┐
                      │            FastAPI Async High-Speed REST Engine             │
                      │   [ JWT Authenticator ] ── [ PBKDF2 Cryptographic Hasher ]   │
                      └──────┬───────────────┬───────────────┬───────────────┬──────┘
                             │               │               │               │
         ┌───────────────────▼──┐   ┌────────▼─────────┐   ┌─▼───────────────┴──┐    │
         │ Market Data Pipeline │   │ NLP News Engine  │   │ Modern Portfolio   │    │
         │ (yFinance + Cache)   │   │ (VADER + Lexicon)│   │ (SciPy Optimizer)  │    │
         └───────────┬──────────┘   └────────┬─────────┘   └────────┬───────────┘    │
                     │                       │                      │                │
         ┌───────────▼───────────────────────▼───────────┐          │                │
         │          Consensus Ensemble Predictor         │          │                │
         │  ┌────────────────────┬────────────────────┐  │          │                │
         │  │ PyTorch LSTM (DL)  │ XGBoost & RF (ML)  │  │          │                │
         │  └────────────────────┴────────────────────┘  │          │                │
         │     + 95% Confidence Bounds (Monte Carlo)     │          │                │
         └───────────────────────────┬───────────────────┘          │                │
                                     │                              │                │
                                     ▼                              ▼                ▼
                      ┌──────────────────────────────────────────────┐ ┌────────────────────┐
                      │    Intelligent Buy / Hold / Sell Advisor     │ │ Embedded SQLite DB │
                      │ (Risk-Adjusted Target Price · ATR Stop-Loss) │ │ (Isolated Users,   │
                      └──────────────────────┬───────────────────────┘ │  Portfolios &      │
                                             │                         │  Cash Ledgers)     │
                                             ▼                         └────────────────────┘
                      ┌──────────────────────────────────────────────┐
                      │ Institutional Broker Adapter (Alpaca / Local)│
                      │  [ Automated ATR Stop-Loss Bracket Engine ]  │
                      └──────────────────────────────────────────────┘
```

---

## 🚀 Core Capabilities

### 1. 🖥️ TradingView Pro Multi-Pane Workstation
* **Institutional 4-Pane Grid**: Engineered for high-density financial analytics in a dark `#07090E` theme.
* **Top Command Bar ([`TerminalTopBar.jsx`](file:///c:/Users/Sahil/OneDrive/Desktop/Stock%20predictor/frontend/src/components/TerminalTopBar.jsx))**: Live New York market clock (NYSE/NASDAQ open/pre-market/after-hours status countdown), real-time spot price + % pill, quick ticker selector (`AAPL`, `NVDA`, `MSFT`, `TSLA`, `GOOGL`, `AMZN`, `SPY`), live cash balance pill, and active user session badge.
* **Predictive Chart Canvas ([`TerminalChartCanvas.jsx`](file:///c:/Users/Sahil/OneDrive/Desktop/Stock%20predictor/frontend/src/components/TerminalChartCanvas.jsx))**: Recharts visualization rendering actual historical closes alongside PyTorch & XGBoost forward projections and semi-transparent **95% Confidence Interval cones**.
* **Collapsible Bottom Dock ([`TerminalDock.jsx`](file:///c:/Users/Sahil/OneDrive/Desktop/Stock%20predictor/frontend/src/components/TerminalDock.jsx))**: 4 multi-tab drawers:
  1. *Open Positions & P&L*: Real-time market value, cost basis, unrealized P&L %, and 1-click liquidation.
  2. *Signal Decomposition*: 4-pillar radar metrics (AI Expected Return, News Sentiment, Technical Momentum, Risk Profile).
  3. *News Flow Wire*: Real-time headlines categorized with bullish/bearish confidence tags.
  4. *Macro Crisis Stress Test*: Tail-risk drawdowns and portfolio resilience grades.
* **Execution Ticket ([`TerminalOrderPanel.jsx`](file:///c:/Users/Sahil/OneDrive/Desktop/Stock%20predictor/frontend/src/components/TerminalOrderPanel.jsx))**: BUY/SELL toggle, dynamic ATR bracket stop-loss calculation, take-profit profit bounds, slippage modeling (15 bps), commission estimation, and quick cash funding trigger.

---

### 2. 🔐 Multi-Tenant JWT Auth & 1-Click Demo System
* **1-Click Demo Access**: Automatically launches with pre-seeded \$100,000 buying power as `Demo Institutional Trader` (`demo@northgate.ai`). Evaluators, recruiters, and mentors can immediately test features with **zero typing or registration friction**.
* **Enterprise Cryptography**: Passwords encrypted using **PBKDF2-HMAC-SHA256** (100,000 iterations + 16-byte unique cryptographic salt) with constant-time verification.
* **JWT Bearer Security**: Generates **HS256 access tokens** with automated authorization header injection via Axios interceptors.
* **Complete User Isolation**: Embedded **SQLite relational database** (`northgate.db`) guarantees that each registered user has an independent portfolio balance, position ledger, order history, and cashier statements.

---

### 3. 💳 Funding & Cashier Hub (Simulated & Live Broker Gateway)
* **Instant Cashier Modal ([`WalletModal.jsx`](file:///c:/Users/Sahil/OneDrive/Desktop/Stock%20predictor/frontend/src/components/WalletModal.jsx))**:
  * **Deposit Rails**: Rapid preset chips (`+$1k`, `+$5k`, `+$10k`, `+$25k`, `+$50k`), custom amounts, and simulated ACH / Fedwire settlement.
  * **Withdrawal Hub**: Settled funds verification, quick allocation percentages (`25%`, `50%`, `75%`, `100% Max`), and bank account destination validation.
  * **Cash Movement Ledger**: Audited statement logging all deposits, withdrawals, and stock order clearance debits/credits.
* **Pluggable Live Broker Adapter ([`broker_adapter.py`](file:///c:/Users/Sahil/OneDrive/Desktop/Stock%20predictor/backend/app/services/broker_adapter.py))**: Pre-built connector for **Alpaca Markets API** allowing seamless transition from sandbox trading to real NASDAQ/NYSE execution with SEC/FINRA clearing and SIPC account protection.

---

### 4. 🧠 Multi-Model AI Stock Price Forecasting
* **Deep Learning (PyTorch LSTM)**: 2-layer Recurrent Neural Network with Dropout regularization, trained with Huber loss for robust handling of market tail-volatility.
* **Machine Learning (XGBoost & Random Forest)**: Gradient boosted trees capturing non-linear interactions across technical features (RSI, MACD, Bollinger bandwidth, ATR, Moving Average ratios, and volume momentum).
* **Consensus Ensemble**: Synthesizes deep sequence modeling and tree ensembles with an NLP sentiment momentum impulse.
* **Statistical Confidence Bounds**: Computes 95% Confidence Interval bounds ($1.96 \times \sigma_{\text{residual}} \times \sqrt{t}$) for forward horizons (7, 14, 30 days).

---

### 5. 📰 Financial News NLP Sentiment Analysis
* Aggregates real-time financial headlines and corporate press releases.
* Lexicon-enhanced **VADER sentiment engine** calibrated specifically for equity terminology (e.g., *"revenue beat"*, *"guidance raised"*, *"antitrust lawsuit"*, *"downgrade"*, *"all-time high"*).
* Produces compound polarity scores (-1.0 to +1.0), bullish/neutral/bearish percentage distribution, and sentiment velocity trends.

---

### 6. 📊 Modern Portfolio Theory (Markowitz Mean-Variance Framework)
* Solves Markowitz quadratic optimization to find the **Efficient Frontier**:
  $$\max_{\mathbf{w}} \frac{\mathbf{w}^T \boldsymbol{\mu} - R_f}{\sqrt{\mathbf{w}^T \boldsymbol{\Sigma} \mathbf{w}}} \quad \text{s.t.} \quad \sum_{i=1}^n w_i = 1, \quad 0 \le w_i \le 1$$
* Generates **Maximum Sharpe Ratio**, **Minimum Volatility**, and **1/N Equal Weight Benchmark** portfolios.
* Simulates 1,500 random portfolio vectors using **Monte Carlo simulation**.
* Calculates Annualized Volatility, Sharpe Ratio, Sortino Ratio, 1-Day 95% Value-at-Risk ($VaR_{95\%}$), and Conditional VaR ($CVaR_{95\%}$).

---

### 7. 🎯 Multi-Factor Intelligent Advisor
A rigorous quantitative decision engine synthesizing 4 weighted pillars:
1. **AI Predictive Return (35%)**: Forecasted 30-day percentage return.
2. **News Sentiment Velocity (25%)**: Normalized media catalyst score.
3. **Technical Momentum (25%)**: RSI mean-reversion, MACD crossovers, and MA ratios.
4. **Risk & Volatility Profile (15%)**: ATR volatility, Beta coefficient, and historical drawdown risk.
* **Output**: Strong Buy, Buy, Hold, Sell, Strong Sell with dynamic ATR stop-loss floor and Risk-to-Reward ratio.

---

### 8. 🌪️ Macro Crisis Stress Testing Simulator
Stresses custom equity allocations against 4 severe macroeconomic shock distributions:
* **2020 COVID-19 Liquidity Shock** (-34.0% drawdown, +150% volatility spike)
* **2022 Fed Aggressive Rate Shock** (-24.5% drawdown, +65% volatility spike)
* **2008 Global Financial Crisis** (-56.8% drawdown, +220% volatility spike)
* **1970s Stagflation & Energy Shock** (-18.2% drawdown, +45% volatility spike)

---

## 📁 Repository Structure

```
Stock predictor/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI REST API routers
│   │   │   ├── auth.py           # JWT registration, login & demo token endpoints
│   │   │   ├── stocks.py         # Real-time quotes & technical bars
│   │   │   ├── prediction.py     # Multi-model AI price forecasting
│   │   │   ├── sentiment.py      # NLP News sentiment analysis
│   │   │   ├── portfolio.py      # Markowitz optimizer & crisis stress testing
│   │   │   ├── recommendations.py# Buy/Hold/Sell multi-factor advisor
│   │   │   └── paper_trading.py  # Simulated brokerage, wallet cashier & order execution
│   │   ├── core/
│   │   │   └── security.py       # PBKDF2-HMAC hashing & JWT creation/verification
│   │   ├── db/
│   │   │   └── database.py       # SQLite database engine, tables & multi-tenant queries
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic data schemas & request validation
│   │   ├── services/
│   │   │   ├── market_data.py    # yFinance ingestion & synthetic fallback engine
│   │   │   ├── technical.py      # RSI, MACD, Bollinger Bands, ATR mathematics
│   │   │   ├── sentiment.py      # VADER equity-lexicon NLP engine
│   │   │   ├── ml_predictor.py   # XGBoost & Random Forest regressors
│   │   │   ├── dl_predictor.py   # PyTorch LSTM neural network
│   │   │   ├── ensemble.py       # Consensus forecasting aggregator
│   │   │   ├── portfolio.py      # SciPy quadratic solver & Monte Carlo simulator
│   │   │   ├── advisor.py        # 4-pillar quantitative recommendation logic
│   │   │   ├── paper_trading.py  # Virtual trading engine & automated bracket enforcement
│   │   │   └── broker_adapter.py # Alpaca Markets / Local simulation connector
│   │   ├── config.py             # Global configurations & watchlist universe
│   │   └── main.py               # Application entrypoint & middleware configuration
│   ├── tests/
│   │   └── test_backend.py       # 15 automated pytest cases (AI, MPT, Wallet, Auth)
│   ├── conftest.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TerminalSidebar.jsx     # 56px compact navigation rail
│   │   │   ├── TerminalTopBar.jsx      # Asset command bar with live market clock & session
│   │   │   ├── TerminalChartCanvas.jsx # Interactive Recharts canvas with confidence cones
│   │   │   ├── TerminalDock.jsx        # Bottom multi-tab dock (Positions, Signals, News, Crisis)
│   │   │   ├── TerminalOrderPanel.jsx  # Pinned right execution ticket with ATR brackets
│   │   │   ├── WalletModal.jsx         # Funding cashier modal (Deposit, Withdraw, Ledger)
│   │   │   ├── AuthModal.jsx           # Identity & session manager (1-Click Demo, Sign In, Register)
│   │   │   ├── ErrorBoundary.jsx       # Universal React error boundary
│   │   │   ├── PredictionChart.jsx     # Deep-dive forecaster tab
│   │   │   ├── SentimentView.jsx       # NLP sentiment catalyst tab
│   │   │   ├── PortfolioOptimizer.jsx  # Markowitz frontier tab
│   │   │   ├── PaperTradingDesk.jsx    # Standalone execution ledger tab
│   │   │   └── TechnicalView.jsx       # Technical indicator lab tab
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with JWT bearer interceptors
│   │   ├── App.jsx                     # Master TradingView 4-pane workstation layout
│   │   └── index.css                   # Dark theme & styling
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── start_backend.bat                   # One-click Windows backend launcher
├── start_frontend.bat                  # One-click Windows frontend launcher
├── run_all.bat                         # One-click dual launcher
├── run_all.ps1                         # PowerShell dual launcher
└── README.md
```

---

## ⚡ Quick Start Guide

### Option 1: Native Local Run (Windows / macOS / Linux)

#### 1. Launch Backend API:
```bash
# In project root:
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend runs on: `http://127.0.0.1:8000`
* Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

#### 2. Launch Frontend Terminal:
```bash
cd frontend
npm run dev
```
* Terminal UI runs on: `http://localhost:5173`

#### 3. One-Click Dual Launch:
Double-click `run_all.bat` or run in PowerShell:
```powershell
.\run_all.ps1
```

---

### Option 2: Docker Compose

```bash
docker-compose up --build
```
* Frontend Terminal: `http://localhost:3000`
* Backend API: `http://localhost:8000`

---

## 🧪 Automated Testing

Execute the comprehensive Pytest verification suite:

```bash
.\venv\Scripts\python.exe -m pytest backend -v
```

**Verification Results (15/15 Passed):**
```
backend/tests/test_backend.py::test_root_endpoint PASSED                 [  6%]
backend/tests/test_backend.py::test_health_endpoint PASSED               [ 13%]
backend/tests/test_backend.py::test_market_data_synthetic_generation PASSED [ 20%]
backend/tests/test_backend.py::test_stock_quote_fetch PASSED             [ 26%]
backend/tests/test_backend.py::test_technical_indicators_calculation PASSED [ 33%]
backend/tests/test_backend.py::test_sentiment_analysis PASSED            [ 40%]
backend/tests/test_backend.py::test_ml_and_dl_prediction PASSED          [ 46%]
backend/tests/test_backend.py::test_portfolio_optimization PASSED        [ 53%]
backend/tests/test_backend.py::test_recommendation_engine PASSED         [ 60%]
backend/tests/test_backend.py::test_api_integration PASSED               [ 66%]
backend/tests/test_backend.py::test_crisis_stress_testing PASSED         [ 73%]
backend/tests/test_backend.py::test_paper_trading_engine PASSED          [ 80%]
backend/tests/test_backend.py::test_broker_adapter_status PASSED         [ 86%]
backend/tests/test_backend.py::test_wallet_deposit_and_withdrawal PASSED [ 93%]
backend/tests/test_backend.py::test_authentication_and_multi_user_isolation PASSED [100%]
============================== 15 passed in 84.88s ==============================
```

---

## 📖 Complete API Reference

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Authentication** | `POST` | `/api/v1/auth/demo` | 1-Click instant login as Demo Trader (\$100k sandbox) |
| | `POST` | `/api/v1/auth/register` | Register new user with private isolated portfolio |
| | `POST` | `/api/v1/auth/login` | Authenticate existing user & return JWT token |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & role |
| **Market Intelligence** | `GET` | `/api/v1/stocks/quote/{ticker}` | Real-time quote, market status & fundamentals |
| | `GET` | `/api/v1/stocks/history/{ticker}?period=1y` | Historical OHLCV bars + indicators |
| | `GET` | `/api/v1/stocks/technicals/{ticker}` | RSI, MACD, Bollinger Bands, ATR statistics |
| | `GET` | `/api/v1/stocks/watchlist` | Universe ticker quotes |
| **AI Forecasting** | `GET` | `/api/v1/predict/{ticker}?horizon=14` | Consensus ensemble (PyTorch LSTM + XGBoost) + 95% CI |
| **Sentiment** | `GET` | `/api/v1/sentiment/{ticker}` | NLP News sentiment scores & recent headlines |
| **Portfolio & Risk** | `POST` | `/api/v1/portfolio/optimize` | Markowitz Efficient Frontier quadratic optimization |
| | `POST` | `/api/v1/portfolio/stress-test` | Macro crisis simulator (COVID, 2022 rate shock, 2008 GFC, Stagflation) |
| **Advisory** | `GET` | `/api/v1/recommendations/{ticker}` | Buy/Hold/Sell multi-factor rating & dynamic ATR stop-loss |
| **Brokerage & Cashier** | `GET` | `/api/v1/paper-trading/account` | User-isolated portfolio NAV, cash balance & open positions |
| | `POST` | `/api/v1/paper-trading/order` | Execute virtual Buy/Sell order with bracket stop-loss |
| | `POST` | `/api/v1/paper-trading/wallet/deposit` | Deposit cash into wallet via simulated ACH / Fedwire |
| | `POST` | `/api/v1/paper-trading/wallet/withdraw` | Withdraw cash back to linked checking account |
| | `GET` | `/api/v1/paper-trading/wallet/transactions` | Retrieve cash movement ledger audit statement |
| | `POST` | `/api/v1/paper-trading/reset` | Reset virtual trading account back to \$100,000 cash |
| | `GET` | `/api/v1/paper-trading/broker-status` | Active broker connectivity status (Alpaca / Local) |

---

## 🎓 Internship & Evaluation Highlights

When presenting this project to evaluators or engineering mentors, key technical highlights to emphasize include:

1. **Multi-Tenant State Partitioning**: Explain how user accounts, portfolios, positions, and cash ledgers are completely partitioned by `user_id` in an embedded SQLite database using FastAPI dependency injection (`get_current_user`), avoiding shared state collision.
2. **Cryptographic Standards**: Highlight PBKDF2-HMAC-SHA256 password hashing with unique 16-byte salts and constant-time equality comparisons, paired with HS256 JWT bearer tokens.
3. **Consensus Ensemble Architecture**: Describe how deep recurrent networks (PyTorch LSTM with Huber loss) are combined with gradient-boosted decision trees (XGBoost) and NLP sentiment momentum impulses to produce forward projections with Monte Carlo 95% statistical confidence intervals.
4. **Execution Realism**: Mention how the platform simulates institutional friction—accounting for 5 bps slippage, \$0.005/share commissions, automated 2x ATR dynamic bracket stop-losses, and simulated ACH/wire cashiers.

---

## 📜 License
MIT License. Developed for Northgate AI.
