"use client";

import { useDeal, useUpdateDeal } from "@/hooks/useDeals";
import { PageHeader } from "@/components/shared/PageHeader";
import { DealStageBadge } from "@/components/shared/StatusBadge";
import { DirectionBadge } from "@/components/shared/DirectionBadge";
import { CommodityIcon } from "@/components/shared/CommodityIcon";
import { PnlDisplay } from "@/components/shared/PnlDisplay";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { formatCurrency, formatDate, formatRelativeTime, formatVolume, daysInStage, getStageColor } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { DEAL_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { DealStage } from "@/types";

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useDeal(params.id);
  const updateDeal = useUpdateDeal();
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "milestones">("overview");

  const deal = data?.data;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-12 w-64 rounded" />
        <div className="skeleton h-40 w-full rounded" />
      </div>
    );
  }

  if (!deal) return <div className="p-6 text-text-tertiary">Deal not found</div>;

  const cp = deal.counterparty as { name: string; shortName: string } | undefined;

  const handleStageChange = async (stage: DealStage) => {
    try {
      await updateDeal.mutateAsync({ id: deal.id, data: { stage } });
      toast({ type: "success", title: `Stage updated to ${stage.replace(/_/g, " ")}` });
    } catch {
      toast({ type: "error", title: "Failed to update stage" });
    }
  };

  return (
    <div>
      <PageHeader
        title={deal.dealNumber}
        breadcrumbs={[{ label: "Deals", href: "/deals" }, { label: deal.dealNumber }]}
        actions={
          <div className="flex items-center gap-2">
            <DirectionBadge direction={deal.direction} />
            <DealStageBadge value={deal.stage} />
          </div>
        }
      />

      <div className="p-6 max-w-6xl">
        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Notional Value</p>
            <p className="font-mono text-xl font-semibold text-text-primary mt-1">
              {formatCurrency(deal.totalNotionalValue, "USD", true)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Unrealized P&L</p>
            <PnlDisplay value={deal.unrealizedPnl} className="text-xl font-semibold mt-1 block" />
          </div>
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Probability</p>
            <p className="font-mono text-xl font-semibold text-text-primary mt-1">{deal.probability}%</p>
          </div>
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Weighted Value</p>
            <p className="font-mono text-xl font-semibold text-accent mt-1">
              {formatCurrency(deal.weightedValue, "USD", true)}
            </p>
          </div>
        </div>

        {/* Stage selector */}
        <div className="card p-4 mb-6">
          <p className="text-xs text-text-tertiary mb-3">Pipeline Stage</p>
          <div className="flex gap-2 flex-wrap">
            {DEAL_STAGES.map(s => (
              <button
                key={s.value}
                onClick={() => handleStageChange(s.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-8 rounded border text-xs transition-fast",
                  deal.stage === s.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStageColor(s.value) }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Deal details */}
          <div className="col-span-2 card">
            {/* Tabs */}
            <div className="flex border-b border-border-default px-4">
              {(["overview","activity","milestones"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-3 text-xs font-medium capitalize border-b-2 transition-fast",
                    activeTab === tab ? "border-accent text-accent" : "border-transparent text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  ["Counterparty", cp?.name ?? "—"],
                  ["Short Name", cp?.shortName ?? "—"],
                  ["Delivery Point", deal.deliveryPoint],
                  ["Product", deal.product.replace(/_/g," ")],
                  ["Volume", `${formatVolume(deal.volume)} ${deal.volumeUnit}`],
                  ["Price Type", deal.priceType.replace(/_/g," ")],
                  ["Fixed Price", deal.fixedPrice ? `$${Number(deal.fixedPrice).toFixed(4)}` : "—"],
                  ["Index", deal.indexName ?? "—"],
                  ["Start Date", formatDate(deal.startDate)],
                  ["End Date", formatDate(deal.endDate)],
                  ["Currency", deal.currency],
                  ["Source", deal.source.replace(/_/g," ")],
                  ["Broker", deal.brokerName ?? "—"],
                  ["Created", formatRelativeTime(deal.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-border-default/50 py-1.5">
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
                    <p className="text-xs text-text-primary mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "activity" && (
              <RecentActivity activities={deal.activities as never ?? []} />
            )}

            {activeTab === "milestones" && (
              <div className="p-4 space-y-3">
                {(deal.milestones ?? []).map(m => {
                  const days = m.durationMinutes ? Math.round(m.durationMinutes / 1440) : null;
                  return (
                    <div key={m.id} className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: m.exitedAt ? "#64748B" : "#00D4AA" }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-text-primary">{m.stage.replace(/_/g," ")}</span>
                          <span className="font-mono text-[11px] text-text-tertiary">
                            {days !== null ? `${days}d` : "Current"}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-disabled">{formatDate(m.enteredAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Quick info */}
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-xs text-text-tertiary mb-3">Commodity</p>
              <CommodityIcon commodity={deal.commodity} showLabel size="md" />
            </div>
            <div className="card p-4">
              <p className="text-xs text-text-tertiary mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {deal.tags?.map(tag => (
                  <span key={tag} className="badge bg-bg-hover text-text-secondary">{tag}</span>
                ))}
              </div>
            </div>
            {deal.internalNotes && (
              <div className="card p-4">
                <p className="text-xs text-text-tertiary mb-2">Internal Notes</p>
                <p className="text-xs text-text-secondary leading-relaxed">{deal.internalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
