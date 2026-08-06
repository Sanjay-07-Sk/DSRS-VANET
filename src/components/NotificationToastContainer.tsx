import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle2, AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isCritical = toast.type === 'critical' || toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-slide-in ${
              isSuccess
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100'
                : isWarning
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-100'
                : isCritical
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-100'
                : 'bg-blue-950/80 border-blue-500/40 text-blue-100'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {isCritical && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isWarning && !isCritical && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold font-mono tracking-wide">{toast.title}</h4>
                <span className="text-[9px] font-mono opacity-60">{toast.timestamp}</span>
              </div>
              <p className="text-[11px] mt-0.5 leading-snug opacity-90">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
