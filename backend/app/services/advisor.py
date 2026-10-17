"""
Northgate AI Stock Predictor - Intelligent Recommendation & Advisory Engine
Synthesizes ML/DL predictions, technical momentum, and news sentiment into Buy/Hold/Sell decisions.
"""
from typing import Dict, Any, List
import datetime
from app.models.schemas import StockRecommendationResponse, SignalFactor
from app.services.market_data import fetch_stock_quote, fetch_stock_history
from app.services.technical import get_technical_summary
from app.services.sentiment import get_ticker_sentiment
from app.services.ensemble import get_ensemble_predictions

def generate_stock_recommendation(ticker: str) -> StockRecommendationResponse:
    ticker_clean = ticker.upper()
    quote = fetch_stock_quote(ticker_clean)
    history_df = fetch_stock_history(ticker_clean, period="2y")
    tech_summary = get_technical_summary(history_df, ticker_clean)
    sentiment = get_ticker_sentiment(ticker_clean)
    predictions = get_ensemble_predictions(ticker_clean, horizon_days=30)
    
    current_price = quote.current_price
    target_7d = predictions.predictions[7].predicted_close if len(predictions.predictions) > 7 else current_price * 1.02
    target_30d = predictions.predicted_final_price
    expected_return_30d = predictions.expected_change_pct
    
    signals: List[SignalFactor] = []
    
    # 1. ML/DL Predictive Return Factor (Weight: 0.35)
    if expected_return_30d >= 7.0:
        ml_signal = "Strong Buy"
        ml_score = min(100.0, 50.0 + expected_return_30d * 4.0)
        ml_exp = f"Consensus ensemble (LSTM + XGBoost) forecasts strong {expected_return_30d:+.1f}% upside to ${target_30d:.2f} over 30 days."
    elif expected_return_30d >= 2.5:
        ml_signal = "Buy"
        ml_score = 30.0 + expected_return_30d * 4.0
        ml_exp = f"Positive machine learning trajectory projecting +{expected_return_30d:.1f}% appreciation."
    elif expected_return_30d <= -7.0:
        ml_signal = "Strong Sell"
        ml_score = max(-100.0, -50.0 + expected_return_30d * 4.0)
        ml_exp = f"Predictive models detect significant downward momentum with {expected_return_30d:.1f}% expected drawdown."
    elif expected_return_30d <= -2.5:
        ml_signal = "Sell"
        ml_score = -30.0 + expected_return_30d * 4.0
        ml_exp = f"Model projections forecast softening price action ({expected_return_30d:.1f}%)."
    else:
        ml_signal = "Neutral"
        ml_score = expected_return_30d * 5.0
        ml_exp = f"Consensus models indicate sideways consolidation ({expected_return_30d:+.1f}%)."
        
    signals.append(SignalFactor(
        factor_name="AI Predictive Forecast",
        category="Machine Learning",
        signal=ml_signal,
        score=round(ml_score, 1),
        weight=0.35,
        explanation=ml_exp
    ))
    
    # 2. News Sentiment Factor (Weight: 0.25)
    sent_score = sentiment.compound_score * 100  # -100 to +100
    if sent_score >= 25.0:
        s_sig = "Strong Buy"
        s_exp = f"Strong positive institutional and financial media coverage ({sentiment.bullish_pct}% bullish headlines)."
    elif sent_score >= 10.0:
        s_sig = "Buy"
        s_exp = f"Favorable news sentiment with improving macroeconomic and company headlines."
    elif sent_score <= -25.0:
        s_sig = "Strong Sell"
        s_exp = f"Heavy bearish media coverage and negative catalyst headwinds ({sentiment.bearish_pct}% bearish)."
    elif sent_score <= -10.0:
        s_sig = "Sell"
        s_exp = f"Cautious sentiment among financial reporters and institutional commentators."
    else:
        s_sig = "Neutral"
        s_exp = "Balanced financial news coverage with no dominant headline catalyst."
        
    signals.append(SignalFactor(
        factor_name="News Sentiment Velocity",
        category="News Sentiment",
        signal=s_sig,
        score=round(sent_score, 1),
        weight=0.25,
        explanation=s_exp
    ))
    
    # 3. Technical Momentum & Oscillators (Weight: 0.25)
    tech_score = 0.0
    tech_notes = []
    
    # RSI Evaluation
    if tech_summary.rsi_14 < 32:
        tech_score += 45.0
        tech_notes.append(f"RSI oversold ({tech_summary.rsi_14:.1f}) presenting mean-reversion buying opportunity")
    elif tech_summary.rsi_14 > 68:
        tech_score -= 40.0
        tech_notes.append(f"RSI overbought ({tech_summary.rsi_14:.1f}) indicating short-term exhaustion risk")
    else:
        tech_score += (tech_summary.rsi_14 - 50) * 0.8
        tech_notes.append(f"RSI healthy neutral at {tech_summary.rsi_14:.1f}")
        
    # MACD Evaluation
    if "Bullish" in tech_summary.macd_crossover:
        tech_score += 35.0
        tech_notes.append("MACD line above signal indicating bullish trend acceleration")
    else:
        tech_score -= 35.0
        tech_notes.append("MACD line below signal indicating downward momentum pressure")
        
    # Moving Average Trend
    if "Bullish" in tech_summary.sma_trend or tech_summary.sma_trend == "Golden Cross":
        tech_score += 20.0
        tech_notes.append(f"Price trading above moving averages ({tech_summary.sma_trend})")
    else:
        tech_score -= 20.0
        tech_notes.append(f"Moving average structure showing weakness ({tech_summary.sma_trend})")
        
    tech_score = max(-100.0, min(100.0, tech_score))
    tech_signal = "Strong Buy" if tech_score >= 50 else ("Buy" if tech_score >= 15 else ("Strong Sell" if tech_score <= -50 else ("Sell" if tech_score <= -15 else "Neutral")))
    
    signals.append(SignalFactor(
        factor_name="Technical Trend & Momentum",
        category="Technical Analysis",
        signal=tech_signal,
        score=round(tech_score, 1),
        weight=0.25,
        explanation="; ".join(tech_notes[:2]) + "."
    ))
    
    # 4. Volatility & Risk Factor (Weight: 0.15)
    ann_vol = tech_summary.volatility_annualized
    atr = tech_summary.atr_14
    beta = quote.beta if quote.beta else 1.1
    
    if ann_vol > 0.40 or beta > 1.8:
        risk_level = "Very High"
        vol_score = -40.0
        vol_exp = f"Elevated annualized volatility ({ann_vol*100:.1f}%) and beta ({beta}) warrant strict risk budgeting."
    elif ann_vol > 0.28 or beta > 1.3:
        risk_level = "High"
        vol_score = -20.0
        vol_exp = f"Higher volatility profile ({ann_vol*100:.1f}%) with wider expected swing variance."
    elif ann_vol < 0.18 and beta < 0.95:
        risk_level = "Low"
        vol_score = 30.0
        vol_exp = f"Defensive low-volatility profile ({ann_vol*100:.1f}%) providing capital preservation."
    else:
        risk_level = "Moderate"
        vol_score = 10.0
        vol_exp = f"Balanced volatility characteristics ({ann_vol*100:.1f}%) aligned with broader market baseline."
        
    signals.append(SignalFactor(
        factor_name="Risk & Volatility Profile",
        category="Risk/Volatility",
        signal="Neutral" if risk_level in ["Moderate", "Low"] else "Caution",
        score=round(vol_score, 1),
        weight=0.15,
        explanation=vol_exp
    ))
    
    # Composite Final Score Calculation
    composite_score = sum(s.score * s.weight for s in signals)
    confidence = min(96.0, max(55.0, 50.0 + abs(composite_score) * 0.45))
    
    if composite_score >= 40.0:
        rating = "STRONG BUY"
    elif composite_score >= 12.0:
        rating = "BUY"
    elif composite_score <= -40.0:
        rating = "STRONG SELL"
    elif composite_score <= -12.0:
        rating = "SELL"
    else:
        rating = "HOLD"
        
    # Intelligent Stop-Loss and Target levels
    stop_loss = round(max(current_price - (2.0 * atr), current_price * 0.88), 2)
    upside_pct = round(((target_30d - current_price) / current_price) * 100, 2)
    downside_risk_pct = round(((current_price - stop_loss) / current_price) * 100, 2)
    risk_reward = round(abs(upside_pct) / downside_risk_pct, 2) if downside_risk_pct > 0 else 1.5
    
    # Humanized, professional investment thesis crafted like institutional equity research
    if rating in ["STRONG BUY", "BUY"]:
        thesis = (
            f"Our quantitative models establish a '{rating}' stance on {quote.company_name} ({ticker_clean}) "
            f"with a composite conviction score of {composite_score:+.1f}/100. Our hybrid sequence & tree models "
            f"forecast a 30-day price target of ${target_30d:.2f} (potential upside of {upside_pct:+.1f}%). "
            f"Market media sentiment remains supportive at {sentiment.sentiment_label.lower()} ({sentiment.bullish_pct}% bullish). "
            f"We advise a volatility-adjusted stop-loss at ${stop_loss:.2f} (2.0x ATR buffer) to lock in an asymmetric {risk_reward}:1 risk/reward profile."
        )
    elif rating in ["STRONG SELL", "SELL"]:
        thesis = (
            f"Risk parameters indicate cautionary positioning for {quote.company_name} ({ticker_clean}), supporting a '{rating}' rating "
            f"(composite conviction: {composite_score:+.1f}/100). The predictive engine anticipates softening momentum towards "
            f"${target_30d:.2f} ({upside_pct:+.1f}% expected move) amidst {sentiment.sentiment_label.lower()} headlines. "
            f"Capital preservation is warranted; any protective stop or exit threshold is suggested around ${stop_loss:.2f}."
        )
    else:
        thesis = (
            f"{quote.company_name} ({ticker_clean}) demonstrates balanced risk/reward dynamics, warranting a neutral 'HOLD' recommendation "
            f"(score: {composite_score:+.1f}/100). Technical indicators (RSI at {tech_summary.rsi_14:.1f}) show sideways consolidation around "
            f"${current_price:.2f}. We recommend monitoring for a confirmed breakout beyond key moving averages before establishing fresh exposure."
        )

    return StockRecommendationResponse(
        ticker=ticker_clean,
        company_name=quote.company_name,
        current_price=round(current_price, 2),
        recommendation=rating,
        confidence_score=round(confidence, 1),
        risk_level=risk_level,
        target_price_7d=round(target_7d, 2),
        target_price_30d=round(target_30d, 2),
        potential_upside_pct=upside_pct,
        stop_loss_price=stop_loss,
        risk_reward_ratio=risk_reward,
        signals=signals,
        summary_analysis=f"{rating} consensus supported by {ml_signal} AI forecast and {sentiment.sentiment_label} media sentiment.",
        sentiment_impact=f"{sentiment.sentiment_label} ({sentiment.compound_score:+.2f} compound score)",
        ai_thesis=thesis,
        last_updated=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
