"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function CustomToast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const config = {
    success: {
      bg: "bg-canvas border-l-emerald-500 text-ink-dark",
      icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />,
    },
    error: {
      bg: "bg-canvas border-l-red-500 text-ink-dark",
      icon: <AlertCircle className="h-4.5 w-4.5 text-red-600" />,
    },
    info: {
      bg: "bg-canvas border-l-primary text-ink-dark",
      icon: <Info className="h-4.5 w-4.5 text-primary" />,
    },
  };

  const current = config[toast.type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border border-l-4 border-border shadow-sm max-w-sm w-full animate-in slide-in-from-bottom-3 duration-200 ${current.bg}`}>
      <div className="shrink-0 mt-0.5">{current.icon}</div>
      <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
      <button 
        onClick={() => onClose(toast.id)} 
        className="text-ink-soft hover:text-ink-dark transition-colors shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <CustomToast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
