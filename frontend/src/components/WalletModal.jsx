import React, { useState } from 'react';
import {
  X,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  Zap,
  DollarSign,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

export default function WalletModal({
  isOpen,
  onClose,
  accountData,
  onDeposit,
  onWithdraw,
  onResetAccount,
  brokerStatus
}) {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit', 'withdraw', 'ledger', 'liveBroker'
  const [depositAmount, setDepositAmount] = useState('25000');
  const [depositMethod, setDepositMethod] = useState('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState('10000');
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const currencySymbol = accountData?.currency_symbol || '₹';
  const cash = Number(accountData?.cash_balance ?? 0);
  const totalEquity = Number(accountData?.total_equity ?? 0);
  const totalDeposited = Number(accountData?.total_deposited ?? 0);
  const totalWithdrawn = Number(accountData?.total_withdrawn ?? 0);
  const transactions = Array.isArray(accountData?.cash_transactions) ? accountData.cash_transactions : [];

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const val = Number(depositAmount);
    if (!val || val <= 0) {
      setFeedback({ type: 'error', text: `Please enter a valid deposit amount greater than ${currencySymbol}0.` });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onDeposit(val, depositMethod);
      setFeedback({ type: 'success', text: `Successfully credited ${currencySymbol}${val.toLocaleString()} via ${depositMethod}.` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.detail || err.message || 'Deposit failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const val = Number(withdrawAmount);
    if (!val || val <= 0) {
      setFeedback({ type: 'error', text: `Please enter a valid withdrawal amount greater than ${currencySymbol}0.` });
      return;
    }
    if (val > cash) {
      setFeedback({ type: 'error', text: `Insufficient cash balance. You have ${currencySymbol}${cash.toLocaleString()} available.` });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onWithdraw(val, withdrawMethod);
      setFeedback({ type: 'success', text: `Successfully processed withdrawal of ${currencySymbol}${val.toLocaleString()} to linked bank.` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.detail || err.message || 'Withdrawal failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const depositPresets = [1000, 5000, 10000, 25000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="w-full max-w-2xl bg-[#090D16] border border-[#1E273B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#0D1322] border-b border-[#1E273B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Institutional Cashier & Funding Hub
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> SEC / FINRA Spec
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Deposit sandbox liquidity or configure live brokerage clearing rails
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141B2D] border border-[#232F48] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Quick Stats Header */}
        <div className="px-6 py-3.5 bg-[#07090E] border-b border-[#171D2B] grid grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Available Cash</span>
            <span className={`text-base font-bold font-mono ${cash <= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currencySymbol}{cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Portfolio NAV</span>
            <span className="text-base font-bold font-mono text-white">
              {currencySymbol}{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Account Status</span>
            <span className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${cash <= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
              {cash <= 0 ? <AlertCircle className="w-3 h-3 text-amber-400" /> : <Zap className="w-3 h-3 text-sky-400" />}
              {cash <= 0 ? `Unfunded (${currencySymbol}0.00)` : 'Active (Funded)'}
            </span>
          </div>
        </div>

        {/* Unfunded Notice Banner */}
        {cash <= 0 && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="leading-relaxed text-[11px]">
              <strong className="text-amber-300">Account Currently Unfunded ($0.00 Available Cash):</strong> Real brokerage accounts require an initial deposit before you can buy stocks. Select a deposit amount below to fund your wallet.
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#171D2B] bg-[#0A0E1A] px-6">
          <button
            onClick={() => { setActiveTab('deposit'); setFeedback(null); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'deposit'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" /> Deposit Funds
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setFeedback(null); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'withdraw'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" /> Withdraw Cash
          </button>
          <button
            onClick={() => { setActiveTab('ledger'); setFeedback(null); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ledger'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Cashier Ledger ({transactions.length})
          </button>
          <button
            onClick={() => { setActiveTab('liveBroker'); setFeedback(null); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'liveBroker'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Real Money & Broker
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#090D16]">
          
          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3 rounded-lg mb-4 text-xs flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: DEPOSIT */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Quick Deposit Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {depositPresets.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(String(amt))}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all ${
                        Number(depositAmount) === amt
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20'
                          : 'bg-[#0E1422] border-[#1E273B] text-slate-400 hover:text-white hover:border-[#2E3C58]'
                      }`}
                    >
                      +${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Or Enter Custom Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter deposit amount"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Deposit Channel
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setDepositMethod('ACH')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      depositMethod === 'ACH'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-[#0E1422] border-[#1E273B] text-slate-400 hover:border-[#2E3C58]'
                    }`}
                  >
                    <Building className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Automated Clearing House (ACH)</div>
                      <div className="text-[11px] text-slate-400">Instant credit • $0 fee • Standard US Bank rail</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setDepositMethod('WIRE')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      depositMethod === 'WIRE'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-[#0E1422] border-[#1E273B] text-slate-400 hover:border-[#2E3C58]'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Fedwire Real-Time Gross</div>
                      <div className="text-[11px] text-slate-400">Instant finality • High-capacity liquidity</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0E1422] p-3 rounded-lg border border-[#1E273B] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Account Cash After Deposit:</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  ${(cash + Number(depositAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Crediting Funds...' : `Deposit $${Number(depositAmount || 0).toLocaleString()} Now`}</span>
              </button>
            </form>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-5">
              <div className="p-3 bg-[#0E1422] rounded-xl border border-[#1E273B] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Settled Cash for Withdrawal</span>
                  <span className="text-sm font-bold font-mono text-white">
                    ${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWithdrawAmount(String(Math.floor((cash * pct) / 100)))}
                      className="px-2.5 py-1 rounded bg-[#172033] hover:bg-[#1E2B45] border border-[#232F48] text-[10px] font-mono text-slate-300 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={cash}
                    step="1"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter withdrawal amount"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Destination Bank Account
                </label>
                <div className="p-3 bg-[#0E1422] border border-[#1E273B] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Chase Commercial Bank</div>
                      <div className="text-[11px] font-mono text-slate-400">•••• •••• •••• 4912 (Checking)</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    VERIFIED
                  </span>
                </div>
              </div>

              <div className="bg-[#0E1422] p-3 rounded-lg border border-[#1E273B] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Remaining Cash Balance:</span>
                <span className="font-mono font-bold text-sky-400 text-xs">
                  ${Math.max(0, cash - Number(withdrawAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || Number(withdrawAmount) > cash}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing Wire...' : `Withdraw $${Number(withdrawAmount || 0).toLocaleString()} to Checking`}</span>
              </button>
            </form>
          )}

          {/* TAB 3: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Real-Time Cash Movements & Order Clearances</span>
                <span className="font-mono text-[10px] text-slate-500">Showing last {transactions.length} entries</span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No cash transactions recorded yet.
                </div>
              ) : (
                <div className="border border-[#171D2B] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0D1322] text-slate-400 font-mono text-[10px] uppercase border-b border-[#171D2B]">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171D2B] font-mono text-[11px]">
                      {transactions.map((tx) => {
                        const isCredit = Number(tx.amount) > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-[#0E1422]/60 transition-colors">
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{tx.timestamp}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                tx.type === 'WITHDRAWAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                tx.type === 'STOCK_BUY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 font-sans">{tx.description}</td>
                            <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isCredit ? '+' : ''}${Math.abs(Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                              ${Number(tx.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REAL MONEY & LIVE BROKER */}
          {activeTab === 'liveBroker' && (
            <div className="space-y-4 text-xs">
              
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-100">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Real Stock Trading via Official Broker APIs (NSE / BSE & Global)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-purple-200/90">
                  Northgate AI connects directly to exchange-licensed broker APIs to execute real trades, fetch live demat holdings, and check live margin balances without manual broker login.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div className="p-2 rounded bg-[#07090E]/60 border border-purple-500/20">
                    <span className="text-emerald-400 font-bold block">Dhan HQ API</span>
                    <span>100% Free NSE/BSE REST & WebSocket gateway. Instant token in Dhan App.</span>
                  </div>
                  <div className="p-2 rounded bg-[#07090E]/60 border border-purple-500/20">
                    <span className="text-sky-400 font-bold block">Angel One SmartAPI</span>
                    <span>Free developer portal with automated TOTP 2FA authentication.</span>
                  </div>
                </div>
              </div>

              {/* Active Broker Engine Box */}
              <div className="p-4 bg-[#0E1422] rounded-xl border border-[#1E273B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Active Broker Adapter Layer</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {brokerStatus?.active_broker || 'Northgate Virtual Brokerage'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-[11px] font-mono">
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-[#171D2B]">
                    <span className="text-slate-500 block text-[10px]">Gateway Protocol:</span>
                    <span className="text-sky-300 font-bold">
                      {brokerStatus?.broker_type || 'LOCAL_PAPER'}
                    </span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-[#171D2B]">
                    <span className="text-slate-500 block text-[10px]">Execution Mode:</span>
                    <span className="text-amber-400 font-bold">
                      {brokerStatus?.paper_mode ? 'Simulation (Safety)' : 'Live Exchange Direct'}
                    </span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-[#171D2B]">
                    <span className="text-slate-500 block text-[10px]">Latency:</span>
                    <span className="text-emerald-400 font-bold">
                      {brokerStatus?.latency_ms ?? 1.2} ms
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#171D2B]">
                  <span className="text-[11px] text-slate-300 font-semibold block">
                    How to Connect Your Real Broker in 2 Minutes:
                  </span>
                  
                  <div className="space-y-2 text-slate-400 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#07090E] border border-[#1E273B] space-y-1">
                      <span className="font-bold text-emerald-400">Option 1: Dhan HQ API (Fastest & Free)</span>
                      <p className="text-[10px]">1. Open Dhan app &rarr; Profile &rarr; <strong>DhanHQ APIs</strong> &rarr; Generate Access Token.</p>
                      <p className="text-[10px]">2. Set in <code className="text-sky-300 font-mono">.env</code>: <code className="text-sky-300 font-mono">DHAN_CLIENT_ID</code> and <code className="text-sky-300 font-mono">DHAN_ACCESS_TOKEN</code>.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#07090E] border border-[#1E273B] space-y-1">
                      <span className="font-bold text-sky-400">Option 2: Angel One SmartAPI (Free)</span>
                      <p className="text-[10px]">1. Go to <a href="https://smartapi.angelbroking.com" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">smartapi.angelbroking.com <ExternalLink className="w-2.5 h-2.5" /></a> &rarr; Create App &rarr; Get API Key.</p>
                      <p className="text-[10px]">2. Set in <code className="text-sky-300 font-mono">.env</code>: <code className="text-sky-300 font-mono">ANGEL_API_KEY</code>, <code className="text-sky-300 font-mono">ANGEL_CLIENT_CODE</code>, <code className="text-sky-300 font-mono">ANGEL_PIN</code>, <code className="text-sky-300 font-mono">ANGEL_TOTP_KEY</code>.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Note & Realism Controls */}
        <div className="px-6 py-3 bg-[#0D1322] border-t border-[#1E273B] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>SIPC Insured • ACH Gateway</span>
            {onResetAccount && (
              <>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset wallet to $0.00 (Unfunded empty wallet)?')) {
                      onResetAccount(0.0);
                      setFeedback({ type: 'success', text: 'Wallet cleared to $0.00. Make a deposit to fund it.' });
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 underline transition-colors"
                >
                  Clear to $0.00
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Fund wallet with $100,000 Sandbox Grant?')) {
                      onResetAccount(100000.0);
                      setFeedback({ type: 'success', text: 'Wallet funded with $100,000 sandbox capital.' });
                    }
                  }}
                  className="text-sky-400 hover:text-sky-300 underline transition-colors"
                >
                  Reset $100k
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141B2D] hover:bg-[#1C253D] text-slate-300 hover:text-white rounded-lg border border-[#232F48] transition-colors"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}