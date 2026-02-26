"use client";

import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | React.ReactNode;
  change?: { value: string; positive: boolean };
  sparkline?: number[];
  sparklineColor?: string;
  icon?: LucideIcon;
  iconColor?: string;
  footer?: string | React.ReactNode;
  loading?: boolean;
  className?: string;
  valueColor?: "default" | "positive" | "negative" | "warning";
}

export function MetricCard({
  title,
  value,
  change,
  sparkline,
  sparklineColor,
  icon: Icon,
  footer,
  loading = false,
  className,
  valueColor = "default",
}: MetricCardProps) {
  const valueColorClass = {
    default: "text-text-primary",
    positive: "text-success",
    negative: "text-danger",
    warning: "text-warning",
  }[valueColor];

  if (loading) {
    return (
      <div className={cn("card p-4 flex flex-col gap-2", className)}>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-7 w-32 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className={cn("card p-4 flex flex-col gap-1", className)}>
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-text-disabled" />}
      </div>

      {/* Value + sparkline */}
      <div className="flex items-end justify-between gap-3 mt-1">
        <div className={cn("font-mono tabular-nums text-2xl font-semibold", valueColorClass)}>
          {value}
        </div>
        {sparkline && sparkline.length > 0 && (
          <Sparkline data={sparkline} color={sparklineColor ?? "#00D4AA"} />
        )}
      </div>

      {/* Change / footer */}
      {(change || footer) && (
        <div className="flex items-center gap-2 mt-1">
          {change && (
            <span className={cn("text-xs font-mono", change.positive ? "text-success" : "text-danger")}>
              {change.value}
            </span>
          )}
          {footer && (
            <span className="text-xs text-text-tertiary">{footer}</span>
          )}
        </div>
      )}
    </div>
  );
}
