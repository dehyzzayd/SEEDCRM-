import { cn } from "@/lib/utils";
import { getCreditRatingColor, getCreditRatingLabel } from "@/lib/utils";
import type { CreditRating } from "@/types";

export function CreditRatingBadge({ rating, className }: { rating: CreditRating; className?: string }) {
  const color = getCreditRatingColor(rating);
  const label = getCreditRatingLabel(rating);

  const colorStyles: Record<string, string> = {
    "#10B981": "bg-success/15 text-success",
    "#F59E0B": "bg-warning/15 text-warning",
    "#EF4444": "bg-danger/15 text-danger",
    "#64748B": "bg-text-tertiary/15 text-text-tertiary",
  };

  return (
    <span className={cn("badge font-mono font-semibold", colorStyles[color] ?? "bg-bg-hover text-text-secondary", className)}>
      {label}
    </span>
  );
}
