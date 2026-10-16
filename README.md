# Northgate AI Stock Predictor

> **Production-Grade AI Equity Intelligence, Multi-Model Time-Series Forecasting, and Modern Portfolio Optimization Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.14+-EE4C2C.svg?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.2+-2962FF.svg?style=flat)](https://xgboost.readthedocs.io)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🏛️ System Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │    Northgate AI Web Dashboard (React 19)    │
                      │  (Recharts · Tailwind v4 · Lucide · Axios)   │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP / JSON REST
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │     FastAPI High-Speed Async REST Engine     │
                      └──────┬───────────────┬───────────────┬───────┘
                             │               │               │
         ┌───────────────────▼──┐   ┌────────▼─────────┐   ┌─▼──────────────────┐
         │ Market Data Pipeline │   │ NLP News Engine  │   │ Modern Portfolio   │
         │ (yFinance + Cache)   │   │ (VADER + Lexicon)│   │ (SciPy Optimization│
         └───────────┬──────────┘   └────────┬─────────┘   └────────┬───────────┘
                     │                       │                      │
         ┌───────────▼───────────────────────▼───────────┐          │
         │          Consensus Ensemble Predictor         │          │
         │  ┌────────────────────┬────────────────────┐  │          │
         │  │ PyTorch LSTM (DL)  │ XGBoost & RF (ML)  │  │          │
         │  └────────────────────┴────────────────────┘  │          │
         │     + 95% Confidence Bounds (Monte Carlo)     │          │
         └───────────────────────────┬───────────────────┘          │
                                     │                              │
                                     ▼                              ▼
                      ┌──────────────────────────────────────────────┐
                      │    Intelligent Buy / Hold / Sell Advisor     │
                      │ (Risk-Adjusted Target Price · ATR Stop-Loss) │
                      └──────────────────────────────────────────────┘
```

---

## 🚀 Core Capabilities

### 1. 🧠 Multi-Model AI Stock Price Forecasting
- **Deep Learning (PyTorch LSTM)**: 2-layer Recurrent Neural Network with Dropout regularization, trained with Huber loss for robust handling of market tail-volatility. Performs autoregressive multi-step forward forecasting.
- **Machine Learning (XGBoost & Random Forest)**: High-performance gradient boosted decision trees capturing non-linear interactions across technical features (RSI, MACD, Bollinger bandwidth, ATR, Moving Average ratios, and volume momentum).
- **Consensus Ensemble**: Combines deep sequence modeling and tree ensembles with an NLP sentiment momentum impulse.
- **Statistical Confidence Intervals**: Computes 95% Confidence Interval bounds ($1.96 \times \sigma_{\text{residual}} \times \sqrt{t}$) for forward horizons (7, 14, 30 days).

### 2. 📰 Financial News NLP Sentiment Analysis
- Aggregates real-time financial headlines and corporate press releases.
- Lexicon-enhanced **VADER sentiment engine** calibrated specifically for equity terminology (e.g., *"revenue beat"*, *"guidance raised"*, *"antitrust lawsuit"*, *"downgrade"*, *"all-time high"*).
- Produces normalized compound polarity scores (-1.0 to +1.0), bullish/neutral/bearish percentage distribution, and sentiment velocity trends.

### 3. 📊 Modern Portfolio Theory (Markowitz Mean-Variance Framework)
- Solves Markowitz quadratic optimization to find the **Efficient Frontier**:
  $$\max_{\mathbf{w}} \frac{\mathbf{w}^T \boldsymbol{\mu} - R_f}{\sqrt{\mathbf{w}^T \boldsymbol{\Sigma} \mathbf{w}}} \quad \text{s.t.} \quad \sum_{i=1}^n w_i = 1, \quad 0 \le w_i \le 1$$
- Generates:
  - **Maximum Sharpe Ratio Portfolio (Tangency)**
  - **Minimum Volatility Portfolio (Capital Preservation)**
  - **1/N Equal Weight Benchmark**
- **Monte Carlo Simulation**: Simulates 1,500 random portfolio vectors across the risk-return surface.
- **Risk Metrics**: Calculates Annualized Volatility, Sharpe Ratio, Sortino Ratio, 1-Day 95% Value-at-Risk ($VaR_{95\%}$), and Conditional VaR ($CVaR_{95\%}$ / Expected Shortfall).
- **Asset Allocation**: Computes exact dollar amount deployment and estimated share purchases for any given capital input.

### 4. 🎯 Intelligent Buy, Hold, or Sell Advisory Engine
A rigorous multi-factor decision engine synthesizing 4 quantitative pillars:
1. **AI Predictive Return (35% weight)**: Ensemble forecasted 30-day percentage return.
2. **News Sentiment Velocity (25% weight)**: Normalized media catalyst sentiment.
3. **Technical Momentum & Oscillators (25% weight)**: RSI mean-reversion, MACD crossovers, and Golden/Death cross status.
4. **Risk & Volatility Profile (15% weight)**: ATR volatility, Beta coefficient, and historical drawdown risk.
- **Actionable Output**: Strong Buy, Buy, Hold, Sell, Strong Sell.
- **Smart Stop-Loss**: ATR-based dynamic risk floor ($P_{\text{current}} - 2 \times ATR$).
- **Risk-to-Reward Ratio**: Quantitative ratio evaluating potential upside vs. stop-loss downside.

---

## 📁 Repository Structure

```
Stock predictor/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI router endpoints
│   │   │   ├── stocks.py         # Quotes & historical technicals
│   │   │   ├── prediction.py     # AI ML/DL forecasting
│   │   │   ├── sentiment.py      # NLP News sentiment
│   │   │   ├── portfolio.py      # Markowitz optimizer
│   │   │   └── recommendations.py# Buy/Hold/Sell advisory
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── market_data.py    # Resilient data ingestion & caching
│   │   │   ├── technical.py      # RSI, MACD, Bollinger, ATR math
│   │   │   ├── sentiment.py      # NLP sentiment analyzer
│   │   │   ├── ml_predictor.py   # XGBoost / Random Forest
│   │   │   ├── dl_predictor.py   # PyTorch LSTM network
│   │   │   ├── ensemble.py       # Consensus forecasting
│   │   │   ├── portfolio.py      # SciPy portfolio optimization
│   │   │   └── advisor.py        # Multi-factor recommendation
│   │   ├── config.py             # Settings & tickers
│   │   └── main.py               # Application entrypoint
│   ├── tests/
│   │   └── test_backend.py       # Automated test suite (10 test cases)
│   ├── conftest.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TickerBar.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── PredictionChart.jsx
│   │   │   ├── SentimentView.jsx
│   │   │   ├── PortfolioOptimizer.jsx
│   │   │   └── TechnicalView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── start_backend.bat             # One-click Windows backend launcher
├── start_frontend.bat            # One-click Windows frontend launcher
├── run_all.bat                   # One-click dual launcher
├── run_all.ps1                   # PowerShell launcher
└── README.md
```

---

## ⚡ Quick Start Guide

### Option 1: Native Local Run (Windows / macOS / Linux)

#### 1. Launch Backend:
```bash
# Double click start_backend.bat OR run manually:
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on: `http://127.0.0.1:8000`*  
*Swagger Documentation: `http://127.0.0.1:8000/docs`*

#### 2. Launch Frontend:
```bash
# Double click start_frontend.bat OR run manually:
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

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
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🧪 Automated Testing

Run the full pytest suite (covering market data, ML/DL model training, sentiment, and API endpoints):

```bash
.\venv\Scripts\python.exe -m pytest backend -v
```

**Results:**
```
backend/tests/test_backend.py::test_root_endpoint PASSED                 [ 10%]
backend/tests/test_backend.py::test_health_endpoint PASSED               [ 20%]
backend/tests/test_backend.py::test_market_data_synthetic_generation PASSED [ 30%]
backend/tests/test_backend.py::test_stock_quote_fetch PASSED             [ 40%]
backend/tests/test_backend.py::test_technical_indicators_calculation PASSED [ 50%]
backend/tests/test_backend.py::test_sentiment_analysis PASSED            [ 60%]
backend/tests/test_backend.py::test_ml_and_dl_prediction PASSED          [ 70%]
backend/tests/test_backend.py::test_portfolio_optimization PASSED        [ 80%]
backend/tests/test_backend.py::test_recommendation_engine PASSED         [ 90%]
backend/tests/test_backend.py::test_api_integration PASSED               [100%]
======================= 10 passed in 31.29s =======================
```

---

## 📖 API Documentation & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status |
| `GET` | `/api/v1/stocks/quote/{ticker}` | Real-time quote & fundamentals |
| `GET` | `/api/v1/stocks/history/{ticker}?period=1y` | Historical OHLCV + indicators |
| `GET` | `/api/v1/stocks/technicals/{ticker}` | RSI, MACD, Bollinger Bands, ATR |
| `GET` | `/api/v1/stocks/watchlist` | Universe quotes |
| `GET` | `/api/v1/predict/{ticker}?horizon=14` | ML + PyTorch LSTM + Sentiment consensus |
| `GET` | `/api/v1/sentiment/{ticker}` | NLP news sentiment & articles |
| `POST`| `/api/v1/portfolio/optimize` | Markowitz Efficient Frontier optimization |
| `GET` | `/api/v1/recommendations/{ticker}` | Buy/Hold/Sell multi-factor rating |

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

## 📜 License
MIT License. Created for Northgate AI.
