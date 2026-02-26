"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToasterContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToasterContext);
  if (!ctx) {
    // Return a no-op if context not available
    return {
      toast: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}

let globalToast: ((opts: Omit<Toast, "id">) => void) | null = null;

export function toast(opts: Omit<Toast, "id">) {
  globalToast?.(opts);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register global handler
  globalToast = addToast;

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-success" />,
    error: <AlertCircle className="w-4 h-4 text-danger" />,
    warning: <AlertTriangle className="w-4 h-4 text-warning" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-l-success",
    error: "border-l-danger",
    warning: "border-l-warning",
    info: "border-l-blue-400",
  };

  return (
    <ToasterContext.Provider value={{ toast: addToast, dismiss }}>
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 min-w-[320px] max-w-[400px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "bg-bg-card border border-border-hover rounded shadow-modal p-4 flex items-start gap-3 animate-toast-slide-in border-l-[3px]",
              borders[t.type]
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{t.title}</p>
              {t.description && <p className="text-xs text-text-secondary mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-tertiary hover:text-text-secondary flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}
