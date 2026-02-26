cat > app/\(dashboard\)/reports/page.tsx << 'ENDOFFILE'
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { DealStageBadge } from "@/components/shared/StatusBadge";
import { CreditRatingBadge } from "@/components/shared/CreditRatingBadge";
import { PnlDisplay } from "@/components/shared/PnlDisplay";
import { formatCurrency, getCreditUtilizationColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BarChart2, Shield, TrendingUp, Activity, FileText, Download } from "lucide-react";

type ReportType = "pipeline" | "exposure" | "pnl" | "velocity" | "contracts";

const REPORT_TABS: { value: ReportType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: "pipeline",  label: "Pipeline Summary",    icon: BarChart2  },
  { value: "exposure",  label: "CP Exposure",          icon: Shield     },
  { value: "pnl",       label: "P&L Report",           icon: TrendingUp },
  { value: "velocity",  label: "Deal Velocity",         icon: Activity   },
  { value: "contracts", label: "Expiring Contracts",   icon: FileText   },
];

const REPORT_LABELS: Record<ReportType, string> = {
  pipeline:  "pipeline",
  exposure:  "counterparty exposure",
  pnl:       "P&L",
  velocity:  "deal velocity",
  contracts: "expiring contract",
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("pipeline");

  const { data, isLoading } = useQuery({
    queryKey: ["report", activeReport],
    queryFn:  () => fetch(`/api/reports/${activeReport}`).then(r => r.json()),
  });

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Pre-built analytical reports for your energy portfolio"
        actions={
          <button className="btn-secondary">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        }
      />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-0.5">
              {REPORT_TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveReport(value)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-fast",
                    activeReport === value
                      ? "bg-bg-card text-text-primary border border-border-default"
                      : "text-text-tertiary hover:text-text-secondary hover:bg-bg-panel"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", activeReport === value ? "text-accent" : "")} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Report content */}
          <div className="flex-1 min-w-0">
            <div className="card overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 rounded" />
                  ))}
                </div>
              ) : activeReport === "pipeline" ? (
                <PipelineReport  data={data?.data ?? []} />
              ) : activeReport === "exposure" ? (
                <ExposureReport  data={data?.data ?? []} />
              ) : activeReport === "pnl" ? (
                <PnlReport       data={data?.data ?? []} />
              ) : activeReport === "velocity" ? (
                <VelocityReport  data={data?.data ?? []} />
              ) : (
                <ContractsReport data={data?.data ?? []} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared empty row ──────────────────────────────────────────────────────── */
function ReportEmptyState({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={10} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-hover border border-border-default flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <p className="text-sm font-medium text-text-secondary">No {label} data yet</p>
          <p className="text-xs text-text-tertiary max-w-[280px] leading-relaxed">
            This report populates automatically as you add deals, counterparties,
            and contracts to your pipeline. Nothing to configure.
          </p>
        </div>
      </td>
    </tr>
  );
}

/* ── Pipeline ──────────────────────────────────────────────────────────────── */
function PipelineReport({ data }: { data: { stage: string; commodity: string; _count: { id: number }; _sum: { totalNotionalValue: number; weightedValue: number } }[] }) {
  return (
    <table className="w-full data-table">
      <thead>
        <tr>
          <th>Stage</th>
          <th>Commodity</th>
          <th className="text-right">Deal Count</th>
          <th className="text-right">Total Notional</th>
          <th className="text-right">Weighted Value</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0
          ? <ReportEmptyState label={REPORT_LABELS.pipeline} />
          : data.map((row, i) => (
            <tr key={i}>
              <td><DealStageBadge value={row.stage} /></td>
              <td className="text-xs text-text-secondary">{row.commodity.replace(/_/g, " ")}</td>
              <td className="font-mono text-xs text-right tabular-nums text-text-primary">{row._count.id}</td>
              <td className="font-mono text-xs text-right tabular-nums text-text-primary">{formatCurrency(Number(row._sum.totalNotionalValue), "USD", true)}</td>
              <td className="font-mono text-xs text-right tabular-nums text-accent">{formatCurrency(Number(row._sum.weightedValue), "USD", true)}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

/* ── Exposure ──────────────────────────────────────────────────────────────── */
function ExposureReport({ data }: { data: { id: string; name: string; shortName: string; creditLimit: number; currentExposure: number; creditRating: string; type: string }[] }) {
  return (
    <table className="w-full data-table">
      <thead>
        <tr>
          <th>Counterparty</th>
          <th>Type</th>
          <th>Rating</th>
          <th className="text-right">Credit Limit</th>
          <th className="text-right">Exposure</th>
          <th>Utilization</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0
          ? <ReportEmptyState label={REPORT_LABELS.exposure} />
          : data.map(cp => {
              const util = Number(cp.creditLimit) > 0
                ? Math.round((Number(cp.currentExposure) / Number(cp.creditLimit)) * 100)
                : 0;
              return (
                <tr key={cp.id}>
                  <td>
                    <span className="text-xs font-medium text-text-primary">{cp.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-text-tertiary">{cp.shortName}</span>
                  </td>
                  <td className="text-xs text-text-secondary">{cp.type.replace(/_/g, " ")}</td>
                  <td><CreditRatingBadge rating={cp.creditRating as never} /></td>
                  <td className="font-mono text-xs text-right tabular-nums text-text-primary">{formatCurrency(Number(cp.creditLimit), "USD", true)}</td>
                  <td className="font-mono text-xs text-right tabular-nums text-text-primary">{formatCurrency(Number(cp.currentExposure), "USD", true)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(util, 100)}%`, backgroundColor: getCreditUtilizationColor(util) }} />
                      </div>
                      <span className={cn("font-mono text-[10px]", util > 85 ? "text-danger" : util > 60 ? "text-warning" : "text-success")}>{util}%</span>
                    </div>
                  </td>
                </tr>
              );
            })
        }
      </tbody>
    </table>
  );
}

/* ── P&L ───────────────────────────────────────────────────────────────────── */
function PnlReport({ data }: { data: { id: string; dealNumber: string; commodity: string; direction: string; totalNotionalValue: number; unrealizedPnl: number; counterparty: { name: string } }[] }) {
  const totalPnl = data.reduce((s, d) => s + Number(d.unrealizedPnl), 0);
  return (
    <div>
      {data.length > 0 && (
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
          <span className="text-xs text-text-tertiary">Total Unrealized P&L</span>
          <PnlDisplay value={totalPnl} className="text-sm font-semibold" />
        </div>
      )}
      <table className="w-full data-table">
        <thead>
          <tr>
            <th>Deal #</th>
            <th>Counterparty</th>
            <th>Commodity</th>
            <th>Direction</th>
            <th className="text-right">Notional</th>
            <th className="text-right">Unreal. P&L</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <ReportEmptyState label={REPORT_LABELS.pnl} />
            : data.map(d => (
              <tr key={d.id}>
                <td className="font-mono text-[11px] text-accent">{d.dealNumber}</td>
                <td className="text-xs text-text-secondary">{d.counterparty?.name}</td>
                <td className="text-xs text-text-secondary">{d.commodity.replace(/_/g, " ")}</td>
                <td>
                  <span className={cn("badge text-[10px]", d.direction === "BUY" ? "bg-success/15 text-success" : "bg-danger/15 text-danger")}>
                    {d.direction}
                  </span>
                </td>
                <td className="font-mono text-xs text-right tabular-nums text-text-primary">{formatCurrency(Number(d.totalNotionalValue), "USD", true)}</td>
                <td className="font-mono text-xs text-right tabular-nums"><PnlDisplay value={Number(d.unrealizedPnl)} compact /></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

/* ── Velocity ──────────────────────────────────────────────────────────────── */
function VelocityReport({ data }: { data: { stage: string; avgMinutes: number; count: number }[] }) {
  const ORDER = ["ORIGINATION","INDICATIVE","FIRM_BID","CREDIT_REVIEW","LEGAL_REVIEW","EXECUTED","DELIVERING"];
  const sorted = [...data].sort((a, b) => ORDER.indexOf(a.stage) - ORDER.indexOf(b.stage));

  return (
    <table className="w-full data-table">
      <thead>
        <tr>
          <th>Stage</th>
          <th className="text-right">Deal Count</th>
          <th className="text-right">Avg Days in Stage</th>
          <th>Duration Bar</th>
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0
          ? <ReportEmptyState label={REPORT_LABELS.velocity} />
          : sorted.map(row => {
              const avgDays = (row.avgMinutes / 1440).toFixed(1);
              const pct     = Math.min((row.avgMinutes / 1440 / 30) * 100, 100);
              return (
                <tr key={row.stage}>
                  <td><DealStageBadge value={row.stage} /></td>
                  <td className="font-mono text-xs text-right tabular-nums text-text-primary">{row.count}</td>
                  <td className="font-mono text-xs text-right tabular-nums text-text-primary">{avgDays}d</td>
                  <td>
                    <div className="w-32 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })
        }
      </tbody>
    </table>
  );
}

/* ── Contracts ─────────────────────────────────────────────────────────────── */
function ContractsReport({ data }: { data: { id: string; contractNumber: string; type: string; expirationDate: string; counterparty: { name: string } }[] }) {
  return (
    <table className="w-full data-table">
      <thead>
        <tr>
          <th>Contract #</th>
          <th>Counterparty</th>
          <th>Type</th>
          <th>Expiration</th>
          <th className="text-right">Days Remaining</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0
          ? <ReportEmptyState label={REPORT_LABELS.contracts} />
          : data.map(c => {
              const days = daysUntil(c.expirationDate);
              return (
                <tr key={c.id}>
                  <td className="font-mono text-[11px] text-text-primary">{c.contractNumber}</td>
                  <td className="text-xs text-text-secondary">{c.counterparty?.name}</td>
                  <td className="text-xs text-text-secondary">{c.type.replace(/_/g, " ")}</td>
                  <td className="font-mono text-[11px] tabular-nums text-text-primary">{formatDate(c.expirationDate)}</td>
                  <td className={cn(
                    "font-mono text-xs text-right tabular-nums",
                    days !== null && days < 30  ? "text-danger"  :
                    days !== null && days < 90  ? "text-warning" : "text-success"
                  )}>
                    {days !== null ? `${days}d` : "—"}
                  </td>
                </tr>
              );
            })
        }
      </tbody>
    </table>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function daysUntil(d: string | Date | null | undefined) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}
ENDOFFILE
