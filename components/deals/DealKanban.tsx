"use client";

import { useState } from "react";
import { DealCard } from "./DealCard";
import { getStageColor, formatCurrency } from "@/lib/utils";
import { useUpdateDeal } from "@/hooks/useDeals";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Deal, DealStage } from "@/types";
import { DEAL_STAGES } from "@/lib/constants";

const KANBAN_STAGES = DEAL_STAGES.filter(s =>
  !["DEAD"].includes(s.value)
);

interface DealKanbanProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  loading?: boolean;
}

export function DealKanban({ deals, onSelectDeal, loading }: DealKanbanProps) {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const updateDeal = useUpdateDeal();

  const dealsByStage = KANBAN_STAGES.reduce<Record<DealStage, Deal[]>>(
    (acc, s) => ({ ...acc, [s.value]: deals.filter(d => d.stage === s.value) }),
    {} as Record<DealStage, Deal[]>
  );

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData("dealId", dealId);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === targetStage) {
      setDraggedDealId(null);
      setDragOverStage(null);
      return;
    }

    try {
      await updateDeal.mutateAsync({ id: dealId, data: { stage: targetStage } });
      toast({ type: "success", title: `Deal moved to ${targetStage.replace(/_/g, " ")}` });
    } catch {
      toast({ type: "error", title: "Failed to update stage" });
    }
    setDraggedDealId(null);
    setDragOverStage(null);
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 px-6">
        {KANBAN_STAGES.map(s => (
          <div key={s.value} className="flex-shrink-0 w-[220px]">
            <div className="skeleton h-8 w-full rounded mb-2" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-28 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-6 pt-4">
      {KANBAN_STAGES.map(({ value: stage, label }) => {
        const stageDeals = dealsByStage[stage] ?? [];
        const totalNotional = stageDeals.reduce((s, d) => s + Number(d.totalNotionalValue), 0);
        const stageColor = getStageColor(stage);

        return (
          <div
            key={stage}
            className={cn(
              "flex-shrink-0 w-[220px] flex flex-col rounded-md transition-fast",
              dragOverStage === stage && "ring-1 ring-accent"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stageColor }}
                />
                <span className="text-xs font-medium text-text-secondary">{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-text-tertiary">
                  {formatCurrency(totalNotional, "USD", true)}
                </span>
                <span className="badge bg-bg-hover text-text-tertiary text-[10px]">
                  {stageDeals.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[200px]">
              {stageDeals.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onDragEnd={() => { setDraggedDealId(null); setDragOverStage(null); }}
                >
                  <DealCard
                    deal={deal}
                    onClick={() => onSelectDeal(deal)}
                    isDragging={draggedDealId === deal.id}
                  />
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className={cn(
                  "flex-1 rounded-md border border-dashed border-border-default flex items-center justify-center py-8",
                  dragOverStage === stage && "border-accent bg-accent/5"
                )}>
                  <p className="text-[10px] text-text-disabled">Drop here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
