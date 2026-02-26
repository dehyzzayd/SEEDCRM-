"use client";

import { DirectionBadge } from "@/components/shared/DirectionBadge";
import { CommodityIcon } from "@/components/shared/CommodityIcon";
import { PnlDisplay } from "@/components/shared/PnlDisplay";
import { formatCurrency, formatVolume, daysInStage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types";

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  isDragging?: boolean;
}

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const daysSinceStageEntry = deal.milestones
    ? (() => {
        const current = [...deal.milestones]
          .filter(m => m.stage === deal.stage)
          .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())[0];
        return current ? daysInStage(current.enteredAt) : 0;
      })()
    : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-bg-card border border-border-default rounded-md p-3 cursor-pointer transition-fast select-none",
        "hover:border-border-hover hover:shadow-card",
        isDragging && "opacity-50 rotate-1 shadow-modal"
      )}
    >
      {/* Header: deal number + direction */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-accent font-medium">{deal.dealNumber}</span>
        <DirectionBadge direction={deal.direction} />
      </div>

      {/* Counterparty */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded bg-bg-hover flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-text-secondary">
            {(deal.counterparty as { shortName: string })?.shortName?.slice(0, 3) ?? "?"}
          </span>
        </div>
        <span className="text-xs font-medium text-text-primary truncate">
          {(deal.counterparty as { name: string })?.name ?? "—"}
        </span>
      </div>

      {/* Commodity + Volume */}
      <div className="flex items-center justify-between mb-2">
        <CommodityIcon commodity={deal.commodity} showLabel size="xs" />
        <span className="font-mono text-[11px] text-text-secondary">
          {formatVolume(deal.volume)} {deal.volumeUnit}
        </span>
      </div>

      {/* Notional + P&L */}
      <div className="flex items-center justify-between pt-2 border-t border-border-default">
        <span className="font-mono text-xs font-semibold text-text-primary">
          {formatCurrency(deal.totalNotionalValue, "USD", true)}
        </span>
        {["EXECUTED","DELIVERING"].includes(deal.stage) && (
          <PnlDisplay value={deal.unrealizedPnl} compact className="text-[11px]" />
        )}
      </div>

      {/* Days in stage */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-text-disabled">{deal.deliveryPoint}</span>
        <span className={cn(
          "text-[10px] font-mono",
          daysSinceStageEntry > 14 ? "text-warning" : "text-text-disabled"
        )}>
          {daysSinceStageEntry}d
        </span>
      </div>
    </div>
  );
}
