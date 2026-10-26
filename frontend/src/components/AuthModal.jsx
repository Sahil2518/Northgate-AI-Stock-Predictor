import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  LogOut,
  ArrowRight,
  Database
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onDemoLogin,
  onLogout
}) {
  const [tab, setTab] = useState('demo'); // 'demo', 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onLogin(email, password);
      setFeedback({ type: 'success', text: 'Signed in successfully. Personal portfolio loaded.' });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.detail || err.message || 'Login failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setFeedback({ type: 'error', text: 'Please fill out all fields.' });
      return;
    }
    if (password.length < 6) {
      setFeedback({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onRegister(email, password, fullName);
      setFeedback({ type: 'success', text: 'Account created! Initialized private $100k database portfolio.' });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.detail || err.message || 'Registration failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onDemoLogin();
      setFeedback({ type: 'success', text: 'Connected as Demo Institutional Trader ($100k Sandbox).' });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 800);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to connect demo session.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDemoUser = currentUser?.role === 'demo' || currentUser?.email === 'demo@northgate.ai';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="w-full max-w-md bg-[#090D16] border border-[#1E273B] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#0D1322] border-b border-[#1E273B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Identity & Session Manager
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> Multi-Tenant
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                JWT bearer security with database-isolated portfolios
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

        {/* Current User Session Card (if logged in) */}
        {currentUser && (
          <div className="p-4 bg-[#07090E] border-b border-[#171D2B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#152037] border border-[#232F48] flex items-center justify-center text-sky-400 font-bold text-xs">
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{currentUser.full_name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                    isDemoUser 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isDemoUser ? 'DEMO' : 'PERSONAL'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{currentUser.email}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                setFeedback({ type: 'success', text: 'Logged out. Switched to guest mode.' });
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-[#141B2D] border border-[#232F48] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-[#171D2B] bg-[#0A0E1A]">
          <button
            onClick={() => { setTab('demo'); setFeedback(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'demo'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> 1-Click Demo
          </button>
          <button
            onClick={() => { setTab('login'); setFeedback(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'login'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setFeedback(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'register'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Register
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO */}
          {tab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-100">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant Evaluator & Mentor Profile</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  Pre-configured sandbox with <strong>$100,000 virtual capital</strong>. Requires zero registration or typing—ideal for live demoing, presentations, and rapid feature testing.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDemoClick}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isSubmitting ? 'Connecting Demo...' : 'Launch Demo Trader ($100k Sandbox)'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: SIGN IN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Terminal'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-[#07090E] border border-[#1E273B] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0E1422] border border-[#1E273B] text-[10px] text-slate-400">
                🔒 Automatically initializes an isolated private $100k sandbox ledger in the SQLite database.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Account...' : 'Create Personal Account'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 bg-[#0D1322] border-t border-[#1E273B] text-[10px] text-slate-500 font-mono text-center">
          PBKDF2-HMAC-SHA256 Encryption • SQLite Multi-Tenant Architecture
        </div>

      </div>

    </div>
  );
}
