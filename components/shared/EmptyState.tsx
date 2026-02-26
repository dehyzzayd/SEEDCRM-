import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  hint?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  hint,
  className,
  size = "md",
}: EmptyStateProps) {
  const iconSize   = size === "sm" ? "w-8 h-8"   : size === "lg" ? "w-16 h-16"  : "w-12 h-12";
  const innerSize  = size === "sm" ? "w-3.5 h-3.5": size === "lg" ? "w-7 h-7"   : "w-5 h-5";
  const titleSize  = size === "sm" ? "text-xs"    : size === "lg" ? "text-base"  : "text-sm";
  const padding    = size === "sm" ? "py-8 px-6"  : size === "lg" ? "py-24 px-8" : "py-16 px-8";

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", padding, className)}>
      {Icon && (
        <div
          className={cn(
            "rounded-xl flex items-center justify-center mb-4 border",
            iconSize
          )}
          style={{
            background:   "var(--bg-hover)",
            borderColor:  "var(--border-default)",
          }}
        >
          <Icon className={cn(innerSize, "text-text-tertiary")} />
        </div>
      )}
      <p className={cn("font-semibold text-text-primary mb-1.5", titleSize)}>{title}</p>
      {description && (
        <p className="text-xs text-text-tertiary max-w-[300px] leading-relaxed">{description}</p>
      )}
      {hint && (
        <p className="text-[11px] text-text-disabled max-w-[260px] leading-relaxed mt-1 italic">
          {hint}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
