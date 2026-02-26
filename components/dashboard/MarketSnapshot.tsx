"use client";

import { Sparkline } from "@/components/shared/Sparkline";
import { formatPrice, formatPercent } from "@/lib/utils";
import { getCommodityLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MarketPrice } from "@/types";

interface Props {
  prices: MarketPrice[];
}

export function MarketSnapshot({ prices }: Props) {
  if (!prices?.length) {
    return (
      <div className="p-4 text-center text-text-tertiary text-xs">
        No market data available
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-default">
      {prices.map((p) => (
        <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover transition-fast">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{p.indexName}</p>
            <p className="text-[10px] text-text-tertiary">{getCommodityLabel(p.commodity)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs font-medium text-text-primary">
              {formatPrice(Number(p.settlementPrice), p.commodity.includes("GAS") ? 3 : 2)}
            </p>
            <p className={cn(
              "font-mono text-[10px]",
              Number(p.changePercent) >= 0 ? "text-success" : "text-danger"
            )}>
              {formatPercent(Number(p.changePercent), 2)}
            </p>
          </div>
          <Sparkline
            data={[Number(p.settlementPrice) * 0.98, Number(p.settlementPrice) * 0.99, Number(p.settlementPrice), Number(p.settlementPrice) * 1.005]}
            color={Number(p.changePercent) >= 0 ? "#10B981" : "#EF4444"}
          />
        </div>
      ))}
    </div>
  );
}
