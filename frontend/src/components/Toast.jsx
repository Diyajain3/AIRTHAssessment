import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, type = 'info', title, message } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-[#111827] border-[#166534]/60 text-white',
      iconBg: 'bg-[#062419] text-[#4ade80]',
      icon: CheckCircle2,
      accent: 'text-[#4ade80]'
    },
    error: {
      bg: 'bg-[#111827] border-[#991b1b]/60 text-white',
      iconBg: 'bg-[#2b1015] text-[#f87171]',
      icon: AlertCircle,
      accent: 'text-[#f87171]'
    },
    conflict: {
      bg: 'bg-[#111827] border-[#854d0e]/60 text-white',
      iconBg: 'bg-[#281f0b] text-[#fbbf24]',
      icon: ShieldAlert,
      accent: 'text-[#fbbf24]'
    },
    info: {
      bg: 'bg-[#111827] border-[#1d4ed8]/60 text-white',
      iconBg: 'bg-[#0c1f38] text-[#60a5fa]',
      icon: Info,
      accent: 'text-[#60a5fa]'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-xl backdrop-blur transition-all duration-300 animate-in slide-in-from-bottom-3 ${config.bg}`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${config.iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        {title && <h4 className={`text-xs font-mono font-semibold ${config.accent}`}>{title}</h4>}
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words font-sans">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
