'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Toast = { id: number; message: string; tone: 'info' | 'error' };
type Notify = (message: string, tone?: Toast['tone']) => void;

const ToastContext = createContext<Notify>(() => {});

export function useToast(): Notify {
  return useContext(ToastContext);
}

/**
 * Writes are fire-and-forget (they queue offline), so a rejected write has no
 * form left on screen to report to. Toasts are how those late failures surface.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback<Notify>((message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 3500);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={
              'pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm shadow-lg ' +
              (toast.tone === 'error' ? 'bg-danger text-white' : 'bg-ink text-surface')
            }
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
