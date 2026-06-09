'use client';

import { createContext, useContext, useState, useCallback } from 'react';

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

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    '☕',
};

const BG: Record<ToastType, string> = {
  success: 'bg-[#065F46]',
  error:   'bg-[#991B1B]',
  warning: 'bg-[#92400E]',
  info:    'bg-[#1E3A5F]',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (type !== 'error') {
      setTimeout(() => {
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
      {/* Toast 컨테이너 */}
      <div className="fixed top-16 left-0 right-0 max-w-md mx-auto px-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${BG[t.type]} rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl pointer-events-auto animate-slide-up`}
          >
            <span>{ICONS[t.type]}</span>
            <p className="flex-1 text-white text-sm font-semibold">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-white/60 hover:text-white text-lg leading-none">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
