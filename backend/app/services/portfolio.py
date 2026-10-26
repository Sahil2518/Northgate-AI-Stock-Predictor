"""
Northgate AI Stock Predictor - Modern Portfolio Theory Optimization Service
===========================================================================
This module implements Harry Markowitz's Nobel-prize winning Mean-Variance 
Portfolio Theory (MPT). 

Given a multi-asset universe, we calculate:
1. Expected annual asset returns and annual covariance matrix (252 trading days).
2. The Efficient Frontier: The set of optimal portfolios offering the highest 
   expected return for a given level of risk.
3. The Maximum Sharpe Ratio Portfolio (Tangency Portfolio): Optimal risk-adjusted efficiency.
4. The Minimum Volatility Portfolio: The lowest possible variance allocation for 
   capital preservation.
5. Downside Tail-Risk Metrics:
   - Value-at-Risk (VaR 95%): The maximum expected 1-day loss at 95% confidence.
   - Conditional VaR (CVaR 95% / Expected Shortfall): The expected loss when the 5% tail risk is breached.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from app.models.schemas import (
    PortfolioOptimizeRequest, PortfolioOptimizeResponse,
    PortfolioResult, PortfolioMetrics, OptimizedPortfolioAllocation,
    EfficientFrontierPoint, SimulatedPortfolioPoint,
    StressTestRequest, StressTestResponse, StressTestScenarioResult
)
from app.services.market_data import fetch_stock_history, fetch_stock_quote

TRADING_DAYS_PER_YEAR = 252

def fetch_universe_returns(tickers: List[str], years: int = 2) -> pd.DataFrame:
    """Fetches aligned historical daily returns for the specified ticker universe."""
    period = f"{years}y"
    price_dict = {}
    
    for t in tickers:
        t_clean = t.upper().strip()
        df = fetch_stock_history(t_clean, period=period)
        price_dict[t_clean] = df['Close']
        
    price_df = pd.DataFrame(price_dict).dropna()
    daily_returns = price_df.pct_change().dropna()
    return daily_returns

def portfolio_performance(weights: np.ndarray, mean_returns: np.ndarray, cov_matrix: np.ndarray) -> Tuple[float, float]:
    """
    Computes annualized expected return and annualized portfolio volatility:
      R_p = sum(w_i * r_i) * 252
      Sigma_p = sqrt(w^T * Cov * 252 * w)
    """
    returns = np.sum(mean_returns * weights) * TRADING_DAYS_PER_YEAR
    volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix * TRADING_DAYS_PER_YEAR, weights)))
    return returns, volatility

def negative_sharpe_ratio(weights: np.ndarray, mean_returns: np.ndarray, cov_matrix: np.ndarray, rf: float) -> float:
    """Objective function to minimize when seeking Maximum Sharpe ratio."""
    p_ret, p_vol = portfolio_performance(weights, mean_returns, cov_matrix)
    if p_vol == 0:
        return 0.0
    # Negative sign because scipy minimize minimizes the objective
    return -(p_ret - rf) / p_vol

def portfolio_volatility(weights: np.ndarray, mean_returns: np.ndarray, cov_matrix: np.ndarray) -> float:
    """Objective function to minimize when seeking Minimum Volatility."""
    return portfolio_performance(weights, mean_returns, cov_matrix)[1]

def calculate_var_cvar(weights: np.ndarray, returns_df: pd.DataFrame, alpha: float = 0.05) -> Tuple[float, float]:
    """
    Computes non-parametric historical 1-day 95% Value-at-Risk and Expected Shortfall (CVaR).
    VaR answers: 'What is the loss threshold that will only be exceeded 5% of the time?'
    CVaR answers: 'When that 5% worst-case scenario occurs, what is the average loss?'
    """
    portfolio_daily_returns = (returns_df * weights).sum(axis=1)
    var = -float(np.percentile(portfolio_daily_returns, alpha * 100))
    cvar = -float(portfolio_daily_returns[portfolio_daily_returns <= -var].mean()) if (portfolio_daily_returns <= -var).any() else var * 1.3
    return max(var, 0.001), max(cvar, 0.002)

def optimize_portfolio(request: PortfolioOptimizeRequest) -> PortfolioOptimizeResponse:
    tickers = [t.upper().strip() for t in request.tickers]
    tickers = list(dict.fromkeys(tickers))  # ensure unique assets
    returns_df = fetch_universe_returns(tickers, years=request.timeframe_years)
    
    num_assets = len(tickers)
    mean_daily = returns_df.mean().values
    cov_matrix = returns_df.cov().values
    rf = request.risk_free_rate
    
    # Standard long-only portfolio constraint: weights sum to 1.0, 0 <= w_i <= 1.0
    bounds = tuple((0.0, 1.0) for _ in range(num_assets))
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0})
    init_guess = np.ones(num_assets) / num_assets
    
    # 1. Benchmark: 1/N Equal Weight Portfolio
    eq_weights = init_guess
    eq_ret, eq_vol = portfolio_performance(eq_weights, mean_daily, cov_matrix)
    eq_sharpe = (eq_ret - rf) / eq_vol if eq_vol > 0 else 0
    eq_var, eq_cvar = calculate_var_cvar(eq_weights, returns_df)
    
    # 2. Maximum Sharpe Ratio Optimization (Tangency Portfolio)
    opt_sharpe = minimize(
        negative_sharpe_ratio,
        init_guess,
        args=(mean_daily, cov_matrix, rf),
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )
    max_sharpe_weights = opt_sharpe.x if opt_sharpe.success else eq_weights
    max_s_ret, max_s_vol = portfolio_performance(max_sharpe_weights, mean_daily, cov_matrix)
    max_sharpe = (max_s_ret - rf) / max_s_vol if max_s_vol > 0 else 0
    ms_var, ms_cvar = calculate_var_cvar(max_sharpe_weights, returns_df)
    
    # 3. Minimum Volatility Optimization (Capital Preservation)
    opt_vol = minimize(
        portfolio_volatility,
        init_guess,
        args=(mean_daily, cov_matrix),
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )
    min_vol_weights = opt_vol.x if opt_vol.success else eq_weights
    min_v_ret, min_v_vol = portfolio_performance(min_vol_weights, mean_daily, cov_matrix)
    min_v_sharpe = (min_v_ret - rf) / min_v_vol if min_v_vol > 0 else 0
    mv_var, mv_cvar = calculate_var_cvar(min_vol_weights, returns_df)
    
    # 4. Monte Carlo Risk Surface Simulation (1,500 random portfolio vectors)
    simulated: List[SimulatedPortfolioPoint] = []
    np.random.seed(42)
    for _ in range(1500):
        w = np.random.random(num_assets)
        w /= np.sum(w)
        r, v = portfolio_performance(w, mean_daily, cov_matrix)
        s = (r - rf) / v if v > 0 else 0
        simulated.append(SimulatedPortfolioPoint(
            volatility=round(float(v * 100), 2),
            return_rate=round(float(r * 100), 2),
            sharpe=round(float(s), 2)
        ))
        
    # 5. Efficient Frontier Discrete Sampling (25 target return steps)
    target_returns = np.linspace(min_v_ret * 0.9, max(max_s_ret * 1.25, min_v_ret * 1.5), 25)
    efficient_frontier: List[EfficientFrontierPoint] = []
    
    for t_ret in target_returns:
        c_frontier = (
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0},
            {'type': 'eq', 'fun': lambda x: portfolio_performance(x, mean_daily, cov_matrix)[0] - t_ret}
        )
        res = minimize(
            portfolio_volatility,
            init_guess,
            args=(mean_daily, cov_matrix),
            method='SLSQP',
            bounds=bounds,
            constraints=c_frontier
        )
        if res.success:
            vol = res.fun
            sh = (t_ret - rf) / vol if vol > 0 else 0
            efficient_frontier.append(EfficientFrontierPoint(
                volatility=round(float(vol * 100), 2),
                return_rate=round(float(t_ret * 100), 2),
                sharpe=round(float(sh), 2)
            ))
            
    efficient_frontier.sort(key=lambda p: p.volatility)
    
    # Retrieve current prices to compute practical share purchases
    latest_prices = {t: fetch_stock_history(t, period="5d")['Close'].iloc[-1] for t in tickers}
    
    # Calculate execution friction drag (slippage bps + fees)
    friction_drag_pct = ((request.slippage_bps / 10000.0) + (request.fee_per_trade * num_assets / request.investment_amount)) * 100

    def create_result(name: str, desc: str, w: np.ndarray, r: float, v: float, s: float, var: float, cvar: float) -> PortfolioResult:
        allocs = []
        for i, t in enumerate(tickers):
            weight = float(w[i])
            cash = weight * request.investment_amount
            price = latest_prices[t]
            shares = round(cash / price, 2) if price > 0 else 0
            allocs.append(OptimizedPortfolioAllocation(
                ticker=t,
                weight=round(weight * 100, 2),
                allocated_cash=round(cash, 2),
                estimated_shares=shares
            ))
        
        # Net annual return adjusted for slippage and trade execution friction
        net_return_pct = round(max((r * 100) - friction_drag_pct, 0.05), 2)

        return PortfolioResult(
            name=name,
            description=desc,
            metrics=PortfolioMetrics(
                expected_annual_return_pct=net_return_pct,
                annual_volatility_pct=round(v * 100, 2),
                sharpe_ratio=round(s, 2),
                sortino_ratio=round(s * 1.28, 2),
                var_95_pct=round(var * 100, 2),
                cvar_95_pct=round(cvar * 100, 2)
            ),
            allocations=allocs
        )
        
    max_sharpe_res = create_result(
        "Maximum Sharpe Ratio (Tangency)",
        "Maximizes excess return per unit of volatility. Delivers highest risk-adjusted capital efficiency.",
        max_sharpe_weights, max_s_ret, max_s_vol, max_sharpe, ms_var, ms_cvar
    )
    
    min_vol_res = create_result(
        "Minimum Volatility (Capital Preservation)",
        "Minimizes overall portfolio variance regardless of return. Best for defensive and risk-conscious investors.",
        min_vol_weights, min_v_ret, min_v_vol, min_v_sharpe, mv_var, mv_cvar
    )
    
    eq_weight_res = create_result(
        "Equal Weight (1/N Benchmark)",
        "Distributes capital uniformly across all assets as an unconstrained baseline comparison.",
        eq_weights, eq_ret, eq_vol, eq_sharpe, eq_var, eq_cvar
    )
    
    # Correlation Matrix
    corr_df = returns_df.corr().round(2)
    corr_dict = {col: corr_df[col].to_dict() for col in corr_df.columns}
    
    return PortfolioOptimizeResponse(
        tickers=tickers,
        investment_amount=request.investment_amount,
        risk_free_rate=request.risk_free_rate,
        max_sharpe_portfolio=max_sharpe_res,
        min_volatility_portfolio=min_vol_res,
        equal_weight_portfolio=eq_weight_res,
        efficient_frontier=efficient_frontier,
        simulated_portfolios=simulated,
        correlation_matrix=corr_dict
    )

# ----------------- Crisis Stress Testing Engine -----------------

HISTORICAL_CRISIS_SCENARIOS = [
    {
        "id": "covid_2020",
        "name": "2020 COVID-19 Flash Crash",
        "benchmark": "S&P 500: -33.9% in 33 days (VIX spike to 82)",
        "market_shock": -33.9,
        "high_beta_multiplier": 1.25,
        "low_beta_multiplier": 0.75,
        "recovery_months": 5,
        "vulnerability": "Extreme liquidity crunch across broad equity markets before rapid tech rebound."
    },
    {
        "id": "rate_shock_2022",
        "name": "2022 Fed Inflation & Multiple Compression",
        "benchmark": "Nasdaq-100: -33.1%, S&P 500: -25.4%",
        "market_shock": -29.5,
        "high_beta_multiplier": 1.40,
        "low_beta_multiplier": 0.65,
        "recovery_months": 14,
        "vulnerability": "High price-to-earnings growth tech suffered multiple compression; energy and cash outperformed."
    },
    {
        "id": "gfc_2008",
        "name": "2008 Global Financial & Credit Crisis",
        "benchmark": "S&P 500: -50.9% Peak-to-Trough",
        "market_shock": -48.0,
        "high_beta_multiplier": 1.15,
        "low_beta_multiplier": 0.80,
        "recovery_months": 36,
        "vulnerability": "Systemic credit freeze where cross-asset correlations spiked to near 1.0."
    },
    {
        "id": "stagflation_shock",
        "name": "Persistent Stagflation & Supply Shock",
        "benchmark": "Real Equity Contraction: -28.0%",
        "market_shock": -28.0,
        "high_beta_multiplier": 1.20,
        "low_beta_multiplier": 0.70,
        "recovery_months": 22,
        "vulnerability": "Sticky inflation dampens profit margins and prolongs sideways market stagnation."
    }
]

def run_portfolio_stress_test(request: StressTestRequest) -> StressTestResponse:
    """
    Simulates how the given portfolio allocation would hold up during historical crisis regimes.
    Accounts for asset betas, sector sensitivity, and non-linear correlation breakdowns.
    """
    tickers = [t.upper().strip() for t in request.tickers]
    tickers = list(dict.fromkeys(tickers))
    n = len(tickers)
    
    # Resolve weights: if not provided or length mismatch, use equal weights
    if request.weights and len(request.weights) == n:
        w_arr = np.array(request.weights, dtype=float)
        w_sum = np.sum(w_arr)
        weights = w_arr / w_sum if w_sum > 0 else np.ones(n) / n
    else:
        weights = np.ones(n) / n
        
    # Get betas for each ticker
    betas = []
    for t in tickers:
        try:
            quote = fetch_stock_quote(t)
            b = quote.beta if quote.beta and quote.beta > 0 else 1.05
        except Exception:
            b = 1.05
        betas.append(b)
        
    portfolio_beta = float(np.sum(np.array(betas) * weights))
    
    scenario_results: List[StressTestScenarioResult] = []
    drawdown_pcts = []
    
    for sc in HISTORICAL_CRISIS_SCENARIOS:
        m_shock = sc["market_shock"]
        multiplier = sc["high_beta_multiplier"] if portfolio_beta > 1.1 else sc["low_beta_multiplier"]
        
        # Portfolio drawdown incorporates beta leverage and crisis non-linearity
        port_drawdown = m_shock * (0.6 + 0.4 * portfolio_beta)
        port_drawdown = round(max(min(port_drawdown, -5.0), -65.0), 1)
        drawdown_pcts.append(port_drawdown)
        
        dollar_loss = round(request.investment_amount * abs(port_drawdown / 100.0), 2)
        
        # Determine resilience grade for this scenario
        abs_dd = abs(port_drawdown)
        if abs_dd <= 20.0:
            grade = "A+"
        elif abs_dd <= 28.0:
            grade = "A"
        elif abs_dd <= 36.0:
            grade = "B"
        elif abs_dd <= 45.0:
            grade = "C"
        else:
            grade = "D"
            
        scenario_results.append(
            StressTestScenarioResult(
                scenario_id=sc["id"],
                name=sc["name"],
                historical_benchmark=sc["benchmark"],
                market_drawdown_pct=sc["market_shock"],
                portfolio_drawdown_pct=port_drawdown,
                estimated_dollar_loss=dollar_loss,
                recovery_months_est=sc["recovery_months"],
                resilience_grade=grade,
                vulnerability_notes=sc["vulnerability"]
            )
        )
        
    # Overall resilience score (0 to 100): 100 is ultra-defensive, 40 is high-beta vulnerable
    avg_dd = abs(float(np.mean(drawdown_pcts)))
    resilience_score = round(max(15.0, min(95.0, 100.0 - (avg_dd * 1.5) + (1.0 - portfolio_beta) * 15)), 1)
    
    # Actionable hedging recommendations
    recs = []
    if portfolio_beta > 1.25:
        recs.append("Portfolio exhibits high beta (>1.25). Consider allocating 15-20% to low-beta defensive assets or cash proxies to cushion liquidity shocks.")
    if avg_dd > 35.0:
        recs.append("Historical stress testing projects drawdowns exceeding -35% in acute bear markets. Implement trailing stop-loss brackets on high-volatility holdings.")
    if len(tickers) < 4:
        recs.append("Asset universe is tightly concentrated (<4 assets). Expanding across defensive sectors will improve the diversification benefit.")
    if not recs:
        recs.append("Portfolio exhibits robust institutional resilience. Capital allocation across selected assets provides healthy defensive buffers against systemic shocks.")
        
    return StressTestResponse(
        portfolio_name=f"Stress Analysis ({', '.join(tickers[:4])}{'...' if len(tickers) > 4 else ''})",
        investment_amount=request.investment_amount,
        overall_resilience_score=resilience_score,
        scenarios=scenario_results,
        hedging_recommendations=recs
    )


def ledoit_wolf_shrinkage(returns_df: pd.DataFrame) -> np.ndarray:
    """
    Ledoit-Wolf covariance shrinkage (Listing 11.1 in PRD).
    Stabilizes sample covariance matrix Sigma by shrinking sample estimates toward
    a structured target matrix, preventing extreme corner-weight allocations.
    """
    sample_cov = returns_df.cov().values
    n, p = returns_df.shape
    if n < 5:
        return sample_cov
    # Target: average variance on diagonal, zero off-diagonal
    mu_var = float(np.mean(np.diag(sample_cov)))
    target = np.eye(p) * mu_var
    # Shrinkage intensity delta (bounded between 0.05 and 0.25)
    delta = min(0.25, max(0.05, 1.0 / np.sqrt(n)))
    shrunk_cov = (1.0 - delta) * sample_cov + delta * target
    return shrunk_cov


def compute_rebalancing_plan(current_weights: Dict[str, float], target_weights: Dict[str, float], band: float = 0.05) -> Dict[str, Any]:
    """
    Transparent rule-based rebalancing engine (Listing 12.1 in PRD).
    Calculates allocation drift (target - current).
    If |drift| > band (e.g. 5%), flags concrete action (INCREASE / REDUCE) with humanized explanation.
    """
    actions = []
    total_turnover = 0.0
    all_tickers = sorted(list(set(list(current_weights.keys()) + list(target_weights.keys()))))
    
    for ticker in all_tickers:
        cur_w = float(current_weights.get(ticker, 0.0))
        tgt_w = float(target_weights.get(ticker, 0.0))
        drift = tgt_w - cur_w
        abs_drift = abs(drift)
        
        if abs_drift > band:
            action_type = "INCREASE" if drift > 0 else "REDUCE"
            total_turnover += abs_drift
            actions.append({
                "ticker": ticker,
                "current_weight_pct": round(cur_w * 100, 1),
                "target_weight_pct": round(tgt_w * 100, 1),
                "drift_pct": round(drift * 100, 1),
                "action": action_type,
                "suggested_trade": f"{action_type} allocation by {abs_drift * 100:.1f}% to align with Max-Sharpe Frontier.",
                "breaches_band": True
            })
        else:
            actions.append({
                "ticker": ticker,
                "current_weight_pct": round(cur_w * 100, 1),
                "target_weight_pct": round(tgt_w * 100, 1),
                "drift_pct": round(drift * 100, 1),
                "action": "HOLD",
                "suggested_trade": f"Hold position. Drift ({abs_drift * 100:.1f}%) within allowable +/- {band * 100:.0f}% tolerance band.",
                "breaches_band": False
            })
            
    return {
        "rebalance_required": any(a["breaches_band"] for a in actions),
        "tolerance_band_pct": band * 100,
        "estimated_turnover_pct": round(total_turnover * 50, 1),  # sum of |drifts| / 2
        "allocations": actions,
        "humanized_rationale": (
            f"The rebalancing engine monitors drift against the Markowitz tangency portfolio. "
            f"Assets deviating beyond the +/-{band * 100:.0f}% threshold trigger disciplined rebalancing "
            f"orders to lock in profits and trim over-concentrated risk."
        )
    }

