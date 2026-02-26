"use client";

import { useState } from "react";
import { SlideOver } from "@/components/shared/SlideOver";
import { DealStageBadge } from "@/components/shared/StatusBadge";
import { DirectionBadge } from "@/components/shared/DirectionBadge";
import { CommodityIcon } from "@/components/shared/CommodityIcon";
import { PnlDisplay } from "@/components/shared/PnlDisplay";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { formatCurrency, formatDate, formatRelativeTime, formatVolume } from "@/lib/utils";
import { useDeal } from "@/hooks/useDeals";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Edit2, ExternalLink } from "lucide-react";
import { DEAL_STAGES } from "@/lib/constants";
import type { Deal, DealStage } from "@/types";

interface Props {
  dealId: string | null;
  onClose: () => void;
}

export function DealDetail({ dealId, onClose }: Props) {
  const { data, isLoading } = useDeal(dealId ?? "");
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "milestones">("overview");
  const qc = useQueryClient();

  const deal = data?.data;

  const stageChangeMutation = useMutation({
    mutationFn: async (stage: DealStage) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["deal", dealId] });
      toast({ type: "success", title: "Stage updated" });
    },
  });

  return (
    <SlideOver
      open={!!dealId}
      onClose={onClose}
      title={deal?.dealNumber ?? "Deal Detail"}
      subtitle={deal ? `${deal.direction} ${deal.commodity.replace(/_/g, " ")}` : undefined}
      width="lg"
      headerActions={
        deal ? (
          <a
            href={`/deals/${deal.id}`}
            target="_blank"
            className="text-text-tertiary hover:text-text-secondary transition-fast p-1 rounded hover:bg-bg-hover"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full rounded" />
          ))}
        </div>
      ) : !deal ? null : (
        <div>
          {/* Header metrics */}
          <div className="px-5 py-4 border-b border-border-default">
            <div className="flex items-center gap-3 mb-3">
              <DirectionBadge direction={deal.direction} />
              <DealStageBadge value={deal.stage} />
              <CommodityIcon commodity={deal.commodity} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Notional Value</p>
                <p className="font-mono text-lg font-semibold text-text-primary">
                  {formatCurrency(deal.totalNotionalValue, "USD", true)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Unrealized P&L</p>
                <PnlDisplay value={deal.unrealizedPnl} className="text-lg font-semibold" />
              </div>
            </div>
          </div>

          {/* Stage selector */}
          <div className="px-5 py-3 border-b border-border-default">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Change Stage</p>
            <div className="flex flex-wrap gap-1.5">
              {DEAL_STAGES.filter(s => s.value !== "DEAD").map(s => (
                <button
                  key={s.value}
                  onClick={() => stageChangeMutation.mutate(s.value)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] transition-fast border",
                    deal.stage === s.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border-default">
            {(["overview", "activity", "milestones"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-xs font-medium capitalize transition-fast border-b-2",
                  activeTab === tab
                    ? "border-accent text-accent"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && <DealOverview deal={deal} />}
          {activeTab === "activity" && (
            <div>
              <AddActivityForm dealId={deal.id} />
              <RecentActivity activities={deal.activities as never ?? []} />
            </div>
          )}
          {activeTab === "milestones" && <MilestoneTimeline deal={deal} />}
        </div>
      )}
    </SlideOver>
  );
}

function DealOverview({ deal }: { deal: Deal }) {
  const cp = deal.counterparty as { name: string; shortName: string } | undefined;
  const user = deal.assignedUser as { name: string } | undefined;

  const fields = [
    { label: "Counterparty", value: cp?.name ?? "—" },
    { label: "Delivery Point", value: deal.deliveryPoint },
    { label: "Product Type", value: deal.product.replace(/_/g, " ") },
    { label: "Volume", value: `${formatVolume(deal.volume)} ${deal.volumeUnit}` },
    { label: "Price Type", value: deal.priceType.replace(/_/g, " ") },
    { label: "Fixed Price", value: deal.fixedPrice ? `$${Number(deal.fixedPrice).toFixed(4)}` : "—" },
    { label: "Index", value: deal.indexName ?? "—" },
    { label: "Start Date", value: formatDate(deal.startDate) },
    { label: "End Date", value: formatDate(deal.endDate) },
    { label: "Currency", value: deal.currency },
    { label: "Source", value: deal.source.replace(/_/g, " ") },
    { label: "Broker", value: deal.brokerName ?? "—" },
    { label: "Probability", value: `${deal.probability}%` },
    { label: "Weighted Value", value: formatCurrency(deal.weightedValue, "USD", true) },
    { label: "Assigned To", value: user?.name ?? "—" },
    { label: "Created", value: formatRelativeTime(deal.createdAt) },
  ];

  return (
    <div className="px-5 py-4 space-y-0.5">
      {fields.map(f => (
        <div key={f.label} className="flex items-center justify-between py-2 border-b border-border-default/50">
          <span className="text-xs text-text-tertiary">{f.label}</span>
          <span className="text-xs text-text-primary font-medium text-right max-w-[200px] truncate">
            {f.value}
          </span>
        </div>
      ))}
      {deal.internalNotes && (
        <div className="pt-3">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Internal Notes</p>
          <p className="text-xs text-text-secondary leading-relaxed">{deal.internalNotes}</p>
        </div>
      )}
    </div>
  );
}

function MilestoneTimeline({ deal }: { deal: Deal }) {
  const milestones = deal.milestones ?? [];
  if (!milestones.length) return <div className="p-6 text-center text-text-tertiary text-xs">No milestones</div>;

  const total = milestones.reduce((s, m) => s + (m.durationMinutes ?? 0), 0);

  return (
    <div className="px-5 py-4">
      <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-4">Stage Progression</p>
      <div className="space-y-3">
        {milestones.map(m => {
          const widthPct = total > 0 && m.durationMinutes
            ? Math.max((m.durationMinutes / total) * 100, 5)
            : 10;
          const days = m.durationMinutes ? Math.round(m.durationMinutes / 1440) : null;
          return (
            <div key={m.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-secondary">{m.stage.replace(/_/g, " ")}</span>
                <span className="text-[11px] font-mono text-text-tertiary">
                  {days !== null ? `${days}d` : m.exitedAt ? "—" : "Current"}
                </span>
              </div>
              <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: m.exitedAt ? "#64748B" : "#00D4AA",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddActivityForm({ dealId }: { dealId: string }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const submit = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/deals/${dealId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "NOTE", title: note.slice(0, 60), description: note }),
      });
      setNote("");
      qc.invalidateQueries({ queryKey: ["deal", dealId] });
      toast({ type: "success", title: "Note added" });
    } catch {
      toast({ type: "error", title: "Failed to add note" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-3 border-b border-border-default">
      <div className="flex gap-2">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="flex-1 bg-bg-panel border border-border-default rounded text-xs text-text-primary p-2 resize-none focus:border-accent outline-none transition-fast"
        />
        <button
          onClick={submit}
          disabled={!note.trim() || loading}
          className="btn-primary disabled:opacity-50 px-3 self-end"
        >
          {loading ? "..." : "Add"}
        </button>
      </div>
    </div>
  );
}
