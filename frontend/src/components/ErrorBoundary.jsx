import React from 'react';
import { AlertCircle, RefreshCw, Terminal } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Northgate UI Caught Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#0E131F] border border-[#1E273B] rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1E273B] pb-3">
              <div className="w-9 h-9 rounded-lg bg-[#182137] border border-[#2A3650] flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-sans">Terminal Recovery Mode</h3>
                <span className="text-[11px] text-slate-500 font-mono">UI component state exception caught</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The terminal encountered an unexpected data layout mismatch. The system automatically isolated the error to protect application memory.
            </p>

            {this.state.error && (
              <div className="bg-[#080B11] p-3 rounded-lg border border-[#1E273B] font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-lg text-xs font-semibold font-mono bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Terminal Interface</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
