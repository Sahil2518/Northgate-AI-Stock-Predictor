import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', message, id } = toast;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md max-w-md ${
        isSuccess 
          ? 'bg-[#0E131F]/95 border-emerald-500/40 text-emerald-300' 
          : isError 
          ? 'bg-[#0E131F]/95 border-rose-500/40 text-rose-300' 
          : 'bg-[#0E131F]/95 border-[#1E273B] text-slate-200'
      }`}>
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400 shrink-0" />}

        <div className="text-xs font-medium leading-relaxed flex-1">
          {message}
        </div>

        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
