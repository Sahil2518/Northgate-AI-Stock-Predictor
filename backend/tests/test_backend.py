"""
Northgate AI Stock Predictor - Comprehensive Backend Test Suite
Tests Market Data, Technical Indicators, Sentiment, ML/DL Forecasting, Portfolio Optimizer, and API endpoints.
"""
import pytest
import numpy as np
import pandas as pd
import datetime
import time
from fastapi.testclient import TestClient
from app.main import app
from app.services.market_data import generate_synthetic_history, fetch_stock_quote, fetch_stock_history
from app.services.technical import enrich_dataframe_with_indicators, get_technical_summary
from app.services.sentiment import analyze_headline, get_ticker_sentiment
from app.services.ml_predictor import train_and_predict_ml
from app.services.dl_predictor import train_and_predict_dl
from app.services.portfolio import optimize_portfolio
from app.models.schemas import PortfolioOptimizeRequest
from app.services.advisor import generate_stock_recommendation

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "Northgate" in data["platform"]

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_market_data_synthetic_generation():
    df = generate_synthetic_history("AAPL", days=100)
    assert len(df) == 100
    assert "Close" in df.columns
    assert "Open" in df.columns
    assert "High" in df.columns
    assert "Low" in df.columns
    assert "Volume" in df.columns
    assert df["Close"].iloc[-1] > 0

def test_stock_quote_fetch():
    quote = fetch_stock_quote("AAPL")
    assert quote.ticker == "AAPL"
    assert quote.current_price > 0
    assert quote.company_name is not None

def test_technical_indicators_calculation():
    df = generate_synthetic_history("MSFT", days=250)
    enriched = enrich_dataframe_with_indicators(df)
    
    assert "RSI" in enriched.columns
    assert "MACD" in enriched.columns
    assert "MACD_Signal" in enriched.columns
    assert "BB_Upper" in enriched.columns
    assert "SMA_20" in enriched.columns
    
    summary = get_technical_summary(df, "MSFT")
    assert summary.ticker == "MSFT"
    assert 0 <= summary.rsi_14 <= 100
    assert summary.rsi_condition in ["Overbought", "Neutral", "Oversold"]

def test_sentiment_analysis():
    # Test positive headline
    score_pos, label_pos = analyze_headline("Company reports record revenue and massive quarterly profit surge")
    assert score_pos > 0.15
    assert label_pos == "Bullish"
    
    # Test negative headline
    score_neg, label_neg = analyze_headline("Company faces antitrust investigation as quarterly profits slump")
    assert score_neg < -0.15
    assert label_neg == "Bearish"
    
    sentiment = get_ticker_sentiment("AAPL")
    assert sentiment.ticker == "AAPL"
    assert -1.0 <= sentiment.compound_score <= 1.0
    assert len(sentiment.articles) > 0

def test_ml_and_dl_prediction():
    df = generate_synthetic_history("NVDA", days=250)
    
    # Test ML
    ml_res = train_and_predict_ml(df, horizon_days=7)
    assert len(ml_res["predictions"]) == 7
    assert ml_res["metrics"]["mae"] >= 0
    assert "Ratio_SMA20" in ml_res["feature_importance"] or len(ml_res["feature_importance"]) > 0
    
    # Test DL PyTorch LSTM
    dl_res = train_and_predict_dl(df, horizon_days=7)
    assert len(dl_res["predictions"]) == 7
    for p in dl_res["predictions"]:
        assert p > 0

def test_portfolio_optimization():
    req = PortfolioOptimizeRequest(
        tickers=["AAPL", "MSFT", "GOOGL"],
        investment_amount=15000.0,
        risk_free_rate=0.045,
        timeframe_years=1
    )
    result = optimize_portfolio(req)
    
    assert result.investment_amount == 15000.0
    assert len(result.max_sharpe_portfolio.allocations) == 3
    assert len(result.min_volatility_portfolio.allocations) == 3
    assert len(result.efficient_frontier) > 0
    assert len(result.simulated_portfolios) > 100
    
    # Weights should sum to approximately 100%
    max_sharpe_weights_sum = sum(a.weight for a in result.max_sharpe_portfolio.allocations)
    assert abs(max_sharpe_weights_sum - 100.0) < 1.0

def test_recommendation_engine():
    rec = generate_stock_recommendation("AAPL")
    assert rec.ticker == "AAPL"
    assert rec.recommendation in ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"]
    assert 0 <= rec.confidence_score <= 100
    assert rec.target_price_30d > 0
    assert rec.stop_loss_price > 0
    assert len(rec.signals) == 4
    assert rec.ai_thesis is not None

def test_api_integration():
    # Quote endpoint
    res_q = client.get("/api/v1/stocks/quote/AAPL")
    assert res_q.status_code == 200
    
    # Prediction endpoint
    res_p = client.get("/api/v1/predict/AAPL?horizon=7")
    assert res_p.status_code == 200
    p_data = res_p.json()
    assert p_data["ticker"] == "AAPL"
    assert len(p_data["predictions"]) > 7  # Includes historical continuity points
    
    # Sentiment endpoint
    res_s = client.get("/api/v1/sentiment/AAPL")
    assert res_s.status_code == 200
    
    # Recommendations endpoint
    res_r = client.get("/api/v1/recommendations/AAPL")
    assert res_r.status_code == 200
    assert res_r.json()["recommendation"] in ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"]

def test_crisis_stress_testing():
    res = client.post("/api/v1/portfolio/stress-test", json={
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "investment_amount": 20000.0
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["scenarios"]) == 4
    assert 0 <= data["overall_resilience_score"] <= 100
    for sc in data["scenarios"]:
        assert sc["portfolio_drawdown_pct"] < 0
        assert sc["estimated_dollar_loss"] > 0
        assert sc["resilience_grade"] in ["A+", "A", "B", "C", "D"]

def test_paper_trading_engine():
    # 1. Reset account
    res_reset = client.post("/api/v1/paper-trading/reset")
    assert res_reset.status_code == 200
    assert res_reset.json()["cash_balance"] == 100000.0
    assert res_reset.json()["open_positions_count"] == 0
    
    # 2. Execute Buy Order (with realistic bracket limits: stop-loss 20% below, target 30% above)
    res_buy = client.post("/api/v1/paper-trading/order", json={
        "ticker": "AAPL",
        "action": "BUY",
        "shares": 10.0,
        "stop_loss_price": 100.0,
        "target_price": 600.0
    })
    assert res_buy.status_code == 200
    account = res_buy.json()
    assert account["cash_balance"] < 100000.0
    assert account["open_positions_count"] == 1
    assert account["positions"][0]["ticker"] == "AAPL"
    
    # 3. Check Account Summary
    res_acc = client.get("/api/v1/paper-trading/account")
    assert res_acc.status_code == 200
    assert res_acc.json()["total_equity"] > 0
    
    # 4. Execute Sell Order
    res_sell = client.post("/api/v1/paper-trading/order", json={
        "ticker": "AAPL",
        "action": "SELL",
        "shares": 10.0
    })
    assert res_sell.status_code == 200
    assert res_sell.json()["open_positions_count"] == 0

def test_broker_adapter_status():
    res = client.get("/api/v1/paper-trading/broker-status")
    assert res.status_code == 200
    data = res.json()
    assert "broker" in data["active_broker"].lower() or "simulation" in data["active_broker"].lower()
    assert data["paper_mode"] is True
    assert len(data["supported_features"]) > 0

def test_wallet_deposit_and_withdrawal():
    # 1. Reset account
    client.post("/api/v1/paper-trading/reset")
    
    # 2. Deposit $25,000 via ACH
    dep_res = client.post("/api/v1/paper-trading/wallet/deposit", json={
        "amount": 25000.0,
        "method": "ACH",
        "note": "Test ACH Deposit"
    })
    assert dep_res.status_code == 200
    dep_data = dep_res.json()
    assert dep_data["cash_balance"] == 125000.0
    assert len(dep_data["cash_transactions"]) >= 2
    
    # 3. Withdraw $10,000 via WIRE
    wth_res = client.post("/api/v1/paper-trading/wallet/withdraw", json={
        "amount": 10000.0,
        "method": "WIRE",
        "note": "Test Fedwire Withdrawal"
    })
    assert wth_res.status_code == 200
    wth_data = wth_res.json()
    assert wth_data["cash_balance"] == 115000.0
    
    # 4. Check Transactions Ledger
    tx_res = client.get("/api/v1/paper-trading/wallet/transactions")
    assert tx_res.status_code == 200
    tx_list = tx_res.json()
    assert len(tx_list) >= 3
    assert any(tx["type"] == "DEPOSIT" and tx["amount"] == 25000.0 for tx in tx_list)
    assert any(tx["type"] == "WITHDRAWAL" and tx["amount"] == -10000.0 for tx in tx_list)
    
    # 5. Over-withdrawal protection test
    fail_res = client.post("/api/v1/paper-trading/wallet/withdraw", json={
        "amount": 99999999.0,
        "method": "ACH"
    })
    assert fail_res.status_code == 400
    assert "Insufficient" in fail_res.json()["detail"]

def test_authentication_and_multi_user_isolation():
    # 1. Test 1-Click Demo Login
    demo_res = client.post("/api/v1/auth/demo")
    assert demo_res.status_code == 200
    demo_data = demo_res.json()
    assert "access_token" in demo_data
    assert demo_data["user"]["email"] == "demo@northgate.ai"
    demo_token = demo_data["access_token"]
    
    # 2. Test New User Registration
    test_email = f"trader_{int(datetime.datetime.now().timestamp())}@northgate.ai"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Quantitative Intern"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email
    user_token = reg_data["access_token"]
    
    # 3. Test Protected /me Endpoint
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

    # 4. Check that new personal user realistically starts at $0.00 (Unfunded)
    init_acc = client.get("/api/v1/paper-trading/account", headers={"Authorization": f"Bearer {user_token}"})
    assert init_acc.status_code == 200
    assert init_acc.json()["cash_balance"] == 0.0
    
    # 5. Test Multi-User Portfolio Isolation: Intern deposits $75,000
    dep_intern = client.post(
        "/api/v1/paper-trading/wallet/deposit",
        json={"amount": 75000.0, "method": "ACH", "note": "Intern Allocation"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert dep_intern.status_code == 200
    assert dep_intern.json()["cash_balance"] == 75000.0
    
    # 6. Demo Trader account should NOT be affected
    demo_acc = client.get(
        "/api/v1/paper-trading/account",
        headers={"Authorization": f"Bearer {demo_token}"}
    )
    assert demo_acc.status_code == 200
    # Demo balance is separate from intern's $75,000 balance!
    assert demo_acc.json()["cash_balance"] != 75000.0


