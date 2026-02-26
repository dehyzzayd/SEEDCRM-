import type { Commodity } from "@/types";
import { getCommodityLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ICONS: Record<Commodity, string> = {
  NATURAL_GAS: "🔥",
  CRUDE_OIL_WTI: "🛢️",
  CRUDE_OIL_BRENT: "🛢️",
  POWER: "⚡",
  NGLS: "💧",
  REFINED_PRODUCTS: "⛽",
  CARBON_CREDITS: "🌿",
  RENEWABLE_ENERGY_CREDITS: "☀️",
  OTHER: "📦",
};

const COLORS: Record<Commodity, string> = {
  NATURAL_GAS: "bg-orange-500/10 text-orange-400",
  CRUDE_OIL_WTI: "bg-yellow-600/10 text-yellow-500",
  CRUDE_OIL_BRENT: "bg-yellow-700/10 text-yellow-600",
  POWER: "bg-yellow-400/10 text-yellow-300",
  NGLS: "bg-blue-500/10 text-blue-400",
  REFINED_PRODUCTS: "bg-purple-500/10 text-purple-400",
  CARBON_CREDITS: "bg-green-500/10 text-green-400",
  RENEWABLE_ENERGY_CREDITS: "bg-accent/10 text-accent",
  OTHER: "bg-bg-hover text-text-tertiary",
};

export function CommodityIcon({
  commodity,
  showLabel = false,
  size = "sm",
  className,
}: {
  commodity: Commodity;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass = { xs: "w-5 h-5 text-[10px]", sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm" }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center justify-center rounded flex-shrink-0", sizeClass, COLORS[commodity])}>
        {ICONS[commodity]}
      </div>
      {showLabel && (
        <span className="text-sm text-text-secondary">{getCommodityLabel(commodity)}</span>
      )}
    </div>
  );
}
