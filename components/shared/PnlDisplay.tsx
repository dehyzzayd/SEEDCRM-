import { cn, formatCurrency } from "@/lib/utils";

export function PnlDisplay({
  value,
  className,
  compact = false,
}: {
  value: number | null | undefined;
  className?: string;
  compact?: boolean;
}) {
  if (value === null || value === undefined) {
    return <span className={cn("font-mono text-text-tertiary", className)}>—</span>;
  }

  const isPositive = value >= 0;
  const formatted = compact
    ? `${isPositive ? "+" : ""}${formatCurrency(Math.abs(value), "USD", true)}`
    : isPositive
    ? `+${formatCurrency(value)}`
    : `(${formatCurrency(Math.abs(value))})`;

  return (
    <span
      className={cn(
        "font-mono tabular-nums font-medium",
        isPositive ? "text-success" : "text-danger",
        className
      )}
    >
      {isPositive ? "" : value < 0 ? "" : ""}{formatted}
    </span>
  );
}
