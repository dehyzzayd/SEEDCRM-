import { cn } from "@/lib/utils";
import type { DealDirection } from "@/types";

export function DirectionBadge({ direction, className }: { direction: DealDirection; className?: string }) {
  return (
    <span
      className={cn(
        "badge font-mono font-semibold",
        direction === "BUY"
          ? "bg-success/15 text-success"
          : "bg-danger/15 text-danger",
        className
      )}
    >
      {direction}
    </span>
  );
}
