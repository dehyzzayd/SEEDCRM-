"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-border-hover rounded-md shadow-modal p-6 w-full max-w-sm animate-fade-in">
        <div className={cn(
          "w-10 h-10 rounded-md flex items-center justify-center mb-4",
          variant === "danger" ? "bg-danger/10" : "bg-warning/10"
        )}>
          <AlertTriangle className={cn("w-5 h-5", variant === "danger" ? "text-danger" : "text-warning")} />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 h-9 rounded text-sm font-semibold transition-fast flex items-center gap-2",
              variant === "danger"
                ? "bg-danger/10 border border-danger text-danger hover:bg-danger/20"
                : "bg-warning/10 border border-warning text-warning hover:bg-warning/20",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
