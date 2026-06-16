'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLE: Record<ToastType, string> = {
  success: 'border-emerald-300/20 bg-emerald-900/95 text-emerald-50',
  error: 'border-red-300/20 bg-red-950/95 text-red-50',
  warning: 'border-amber-300/20 bg-amber-950/95 text-amber-50',
  info: 'border-sky-300/20 bg-sky-950/95 text-sky-50',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (type !== 'error') {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed left-0 right-0 top-16 z-50 mx-auto max-w-md space-y-2 px-4">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];

          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`${TOAST_STYLE[t.type]} pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl animate-slide-up`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-semibold leading-5">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-current/60 transition-colors hover:bg-white/10 hover:text-current"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
