"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: "sm" | "md" | "lg";
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

const widthClasses = {
  sm: "w-[380px]",
  md: "w-[480px]",
  lg: "w-[640px]",
};

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  width = "md",
  children,
  headerActions,
}: SlideOverProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 bg-bg-card border-l border-border-default shadow-modal animate-slide-in-right flex flex-col",
          widthClasses[width]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border-default flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            {subtitle && <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary transition-fast p-1 rounded hover:bg-bg-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
