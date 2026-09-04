import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ArrowUpRight } from 'lucide-react';

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 4500;
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - interval));
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (remainingTime <= 0) {
      onDismiss(toast.id);
    }
  }, [remainingTime, toast.id, onDismiss]);

  const progress = Math.max(0, Math.min(100, (remainingTime / duration) * 100));

  // Color mappings
  const config = {
    success: {
      border: 'border-emerald-200/90',
      bg: 'bg-white/95',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
      badge: 'Success',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    error: {
      border: 'border-rose-200/90',
      bg: 'bg-white/95',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
      barColor: 'bg-rose-500',
      icon: AlertCircle,
      badge: 'Alert',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    warning: {
      border: 'border-amber-200/90',
      bg: 'bg-white/95',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
      badge: 'Notice',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    info: {
      border: 'border-blue-200/90',
      bg: 'bg-white/95',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      barColor: 'bg-blue-500',
      icon: Info,
      badge: 'System',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-xl ${config.bg} ${config.border} backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-4`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Status Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${config.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[2.25]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${config.badgeClass}`}>
              {config.badge}
            </span>
            <p className="text-xs font-bold text-slate-900 truncate">{toast.title}</p>
          </div>

          {toast.message && (
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
              {toast.message}
            </p>
          )}

          {/* Optional Action Button */}
          {toast.action && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>{toast.action.label}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-300" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss toast notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      <div className="w-full h-1 bg-slate-100/80">
        <div
          className={`h-full ${config.barColor} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed top-5 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none no-print"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
