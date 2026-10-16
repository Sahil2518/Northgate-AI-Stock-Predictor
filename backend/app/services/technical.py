"""
Northgate AI Stock Predictor - Technical Indicators Engine
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.models.schemas import TechnicalIndicatorSummary

def calculate_sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window=window).mean()

def calculate_ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50.0)

def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal_period: int = 9) -> Tuple[pd.Series, pd.Series, pd.Series]:
    ema_fast = calculate_ema(series, fast)
    ema_slow = calculate_ema(series, slow)
    macd = ema_fast - ema_slow
    signal = calculate_ema(macd, signal_period)
    hist = macd - signal
    return macd, signal, hist

def calculate_bollinger_bands(series: pd.Series, window: int = 20, num_std: float = 2.0) -> Tuple[pd.Series, pd.Series, pd.Series]:
    middle = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper = middle + (num_std * std)
    lower = middle - (num_std * std)
    return upper, middle, lower

def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    high = df['High']
    low = df['Low']
    close_prev = df['Close'].shift(1)
    
    tr1 = high - low
    tr2 = (high - close_prev).abs()
    tr3 = (low - close_prev).abs()
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr.bfill().ffill()

def calculate_obv(df: pd.DataFrame) -> pd.Series:
    obv = [0]
    for i in range(1, len(df)):
        if df['Close'].iloc[i] > df['Close'].iloc[i-1]:
            obv.append(obv[-1] + df['Volume'].iloc[i])
        elif df['Close'].iloc[i] < df['Close'].iloc[i-1]:
            obv.append(obv[-1] - df['Volume'].iloc[i])
        else:
            obv.append(obv[-1])
    return pd.Series(obv, index=df.index)

def calculate_stochastic(df: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> Tuple[pd.Series, pd.Series]:
    low_min = df['Low'].rolling(window=k_period).min()
    high_max = df['High'].rolling(window=k_period).max()
    
    k_fast = 100 * ((df['Close'] - low_min) / (high_max - low_min).replace(0, np.nan))
    d_slow = k_fast.rolling(window=d_period).mean()
    return k_fast.fillna(50.0), d_slow.fillna(50.0)

def enrich_dataframe_with_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Enriches OHLCV dataframe with comprehensive technical features."""
    df = df.copy()
    close = df['Close']
    
    # Moving Averages
    df['SMA_20'] = calculate_sma(close, 20)
    df['SMA_50'] = calculate_sma(close, 50)
    df['SMA_200'] = calculate_sma(close, 200)
    df['EMA_12'] = calculate_ema(close, 12)
    df['EMA_26'] = calculate_ema(close, 26)
    
    # Momentum & Oscillators
    df['RSI'] = calculate_rsi(close, 14)
    macd, signal, hist = calculate_macd(close, 12, 26, 9)
    df['MACD'] = macd
    df['MACD_Signal'] = signal
    df['MACD_Hist'] = hist
    
    # Volatility Bands
    upper, middle, lower = calculate_bollinger_bands(close, 20, 2.0)
    df['BB_Upper'] = upper
    df['BB_Middle'] = middle
    df['BB_Lower'] = lower
    df['BB_Width'] = (upper - lower) / middle.replace(0, np.nan)
    
    # ATR & Volatility
    df['ATR'] = calculate_atr(df, 14)
    df['Daily_Return'] = close.pct_change()
    df['Volatility_30'] = df['Daily_Return'].rolling(30).std() * np.sqrt(252)
    
    # OBV & Stochastic
    df['OBV'] = calculate_obv(df)
    k, d = calculate_stochastic(df, 14, 3)
    df['Stoch_K'] = k
    df['Stoch_D'] = d
    
    return df

def get_technical_summary(df: pd.DataFrame, ticker: str) -> TechnicalIndicatorSummary:
    enriched = enrich_dataframe_with_indicators(df)
    last_row = enriched.iloc[-1]
    prev_row = enriched.iloc[-2] if len(enriched) > 1 else last_row
    
    current_price = float(last_row['Close'])
    rsi = float(last_row['RSI'])
    if rsi >= 70:
        rsi_condition = "Overbought"
    elif rsi <= 30:
        rsi_condition = "Oversold"
    else:
        rsi_condition = "Neutral"
        
    macd = float(last_row['MACD'])
    macd_signal = float(last_row['MACD_Signal'])
    prev_macd = float(prev_row['MACD'])
    prev_signal = float(prev_row['MACD_Signal'])
    
    if prev_macd <= prev_signal and macd > macd_signal:
        macd_crossover = "Bullish Crossover"
    elif prev_macd >= prev_signal and macd < macd_signal:
        macd_crossover = "Bearish Crossover"
    elif macd > macd_signal:
        macd_crossover = "Bullish"
    else:
        macd_crossover = "Bearish"
        
    sma_20 = float(last_row['SMA_20']) if not pd.isna(last_row['SMA_20']) else current_price
    sma_50 = float(last_row['SMA_50']) if not pd.isna(last_row['SMA_50']) else current_price
    sma_200 = float(last_row['SMA_200']) if not pd.isna(last_row['SMA_200']) else current_price
    
    if sma_50 > sma_200 and prev_row['SMA_50'] <= prev_row['SMA_200']:
        sma_trend = "Golden Cross"
    elif sma_50 < sma_200 and prev_row['SMA_50'] >= prev_row['SMA_200']:
        sma_trend = "Death Cross"
    elif current_price > sma_50 > sma_200:
        sma_trend = "Strong Bullish"
    elif current_price > sma_50:
        sma_trend = "Bullish"
    else:
        sma_trend = "Bearish"
        
    bb_upper = float(last_row['BB_Upper']) if not pd.isna(last_row['BB_Upper']) else current_price * 1.05
    bb_lower = float(last_row['BB_Lower']) if not pd.isna(last_row['BB_Lower']) else current_price * 0.95
    
    if current_price > bb_upper:
        bb_position = "Above Upper Band"
    elif current_price < bb_lower:
        bb_position = "Below Lower Band"
    else:
        bb_position = "Inside Bands"
        
    atr = float(last_row['ATR']) if not pd.isna(last_row['ATR']) else (bb_upper - bb_lower) / 4.0
    volatility = float(last_row['Volatility_30']) if not pd.isna(last_row['Volatility_30']) else 0.25
    
    return TechnicalIndicatorSummary(
        ticker=ticker.upper(),
        current_price=round(current_price, 2),
        rsi_14=round(rsi, 2),
        rsi_condition=rsi_condition,
        macd=round(macd, 4),
        macd_signal=round(macd_signal, 4),
        macd_crossover=macd_crossover,
        sma_20=round(sma_20, 2),
        sma_50=round(sma_50, 2),
        sma_200=round(sma_200, 2),
        sma_trend=sma_trend,
        bb_upper=round(bb_upper, 2),
        bb_lower=round(bb_lower, 2),
        bb_position=bb_position,
        atr_14=round(atr, 2),
        volatility_annualized=round(volatility, 4)
    )
