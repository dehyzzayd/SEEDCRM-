"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { CounterpartyStatusBadge } from "@/components/shared/StatusBadge";
import { CreditRatingBadge } from "@/components/shared/CreditRatingBadge";
import { DealStageBadge } from "@/components/shared/StatusBadge";
import { DirectionBadge } from "@/components/shared/DirectionBadge";
import { formatCurrency, formatDate, getCreditUtilizationColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Counterparty, Deal } from "@/types";

export default function CounterpartyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "contacts" | "contracts">("overview");

  const { data, isLoading } = useQuery<{ data: Counterparty & { _count: { deals: number; contracts: number } } }>({
    queryKey: ["counterparty", params.id],
    queryFn: () => fetch(`/api/counterparties/${params.id}`).then(r => r.json()),
  });

  const { data: dealsData } = useQuery<{ data: Deal[] }>({
    queryKey: ["counterparty-deals", params.id],
    queryFn: () => fetch(`/api/counterparties/${params.id}/deals`).then(r => r.json()),
    enabled: activeTab === "deals",
  });

  const cp = data?.data;

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-20 rounded" />)}</div>;
  if (!cp) return <div className="p-6 text-text-tertiary">Counterparty not found</div>;

  const util = Number(cp.creditLimit) > 0
    ? Math.round((Number(cp.currentExposure) / Number(cp.creditLimit)) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title={cp.name}
        breadcrumbs={[{ label: "Counterparties", href: "/counterparties" }, { label: cp.shortName }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-secondary bg-bg-hover px-2 py-1 rounded">{cp.shortName}</span>
            <CounterpartyStatusBadge value={cp.status} />
            <CreditRatingBadge rating={cp.creditRating} />
          </div>
        }
      />

      <div className="p-6">
        {/* Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: "Credit Limit", value: formatCurrency(Number(cp.creditLimit), "USD", true), color: "text-text-primary" },
            { label: "Current Exposure", value: formatCurrency(Number(cp.currentExposure), "USD", true), color: util > 85 ? "text-danger" : "text-text-primary" },
            { label: "Available Credit", value: formatCurrency(Number(cp.creditLimit) - Number(cp.currentExposure), "USD", true), color: "text-success" },
            { label: "Active Deals", value: String(cp._count?.deals ?? 0), color: "text-text-primary" },
            { label: "Contracts", value: String(cp._count?.contracts ?? 0), color: "text-text-primary" },
          ].map(m => (
            <div key={m.label} className="card p-4">
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{m.label}</p>
              <p className={cn("font-mono text-lg font-semibold mt-1", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Credit utilization bar */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-secondary">Credit Utilization</p>
            <span className={cn("font-mono text-sm font-medium", util > 85 ? "text-danger" : util > 60 ? "text-warning" : "text-success")}>
              {util}%
            </span>
          </div>
          <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(util, 100)}%`, backgroundColor: getCreditUtilizationColor(util) }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-text-disabled font-mono">
            <span>$0</span>
            <span>{formatCurrency(Number(cp.creditLimit), "USD", true)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden">
          <div className="flex border-b border-border-default px-4">
            {(["overview","deals","contacts","contracts"] as const).map(tab => (
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
                ["Type", cp.type.replace(/_/g," ")],
                ["Country", cp.country ?? "—"],
                ["City/State", cp.city ? `${cp.city}, ${cp.state}` : "—"],
                ["ISDA Master", cp.isdaMasterAgreement ? `Yes (${formatDate(cp.isdaDate)})` : "No"],
                ["NAESB", cp.naesb ? `Yes (${formatDate(cp.naesbDate)})` : "No"],
                ["Primary Contact", cp.primaryContactName ?? "—"],
                ["Contact Email", cp.primaryContactEmail ?? "—"],
                ["Contact Phone", cp.primaryContactPhone ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-border-default/50 py-1.5">
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
                  <p className="text-xs text-text-primary mt-0.5">{value}</p>
                </div>
              ))}
              {cp.notes && (
                <div className="col-span-2 border-b border-border-default/50 py-1.5">
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{cp.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "deals" && (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Deal #</th>
                    <th>Direction</th>
                    <th>Commodity</th>
                    <th className="text-right">Notional</th>
                    <th>Stage</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(dealsData?.data ?? []).map(d => (
                    <tr key={d.id}>
                      <td className="font-mono text-accent text-[11px]">{d.dealNumber}</td>
                      <td><DirectionBadge direction={d.direction} /></td>
                      <td className="text-xs text-text-secondary">{d.commodity.replace(/_/g," ")}</td>
                      <td className="font-mono text-xs text-right tabular-nums text-text-primary">
                        {formatCurrency(Number(d.totalNotionalValue), "USD", true)}
                      </td>
                      <td><DealStageBadge value={d.stage} /></td>
                      <td className="font-mono text-[11px] text-text-tertiary">{formatDate(d.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="p-4">
              <p className="text-xs text-text-tertiary">Contact management coming soon</p>
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="p-4">
              <p className="text-xs text-text-tertiary">Contract history coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
