"use client";

import dynamic from "next/dynamic";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { MetricCard } from "@/components/shared/MetricCard";
import { MarketSnapshot } from "@/components/dashboard/MarketSnapshot";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PageHeader } from "@/components/shared/PageHeader";
import { PnlDisplay } from "@/components/shared/PnlDisplay";
import { useState, useEffect } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Activity, DollarSign, TrendingUp, Calendar, FileText, Shield,
} from "lucide-react";
import Link from "next/link";

// Lazy-load Recharts-heavy chart components — keeps initial bundle lean
const PipelineChart = dynamic(
  () => import("@/components/dashboard/PipelineChart").then(m => m.PipelineChart),
  { ssr: false, loading: () => <div className="skeleton h-[200px] w-full rounded" /> }
);
const PositionChart = dynamic(
  () => import("@/components/dashboard/PositionChart").then(m => m.PositionChart),
  { ssr: false, loading: () => <div className="skeleton h-[220px] w-full rounded" /> }
);

export default function DashboardPage() {
  const { data, isLoading } = useDashboardMetrics();
  const m = data?.data;
  const [dateStr, setDateStr] = useState<string>("");
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }));
  }, []);

  const exposurePercent = m?.totalCreditLimit
    ? Math.round((m.totalExposure / m.totalCreditLimit) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        description={dateStr ? `Meridian Energy Trading — ${dateStr}` : "Meridian Energy Trading"}
        actions={
          <Link href="/deals/new" className="btn-primary">
            <span>+ New Deal</span>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* ─── Row 1: Hero Metrics ─────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4">
          <MetricCard
            title="Active Deals"
            value={formatNumber(m?.activeDeals)}
            icon={Activity}
            sparkline={m?.activeDealsSparkline?.map(d => d.count)}
            sparklineColor="#00D4AA"
            footer="last 30 days"
            loading={isLoading}
          />
          <MetricCard
            title="Pipeline Value"
            value={formatCurrency(m?.pipelineValue ?? 0, "USD", true)}
            icon={DollarSign}
            footer="weighted"
            loading={isLoading}
          />
          <MetricCard
            title="Unrealized P&L"
            value={
              <PnlDisplay
                value={m?.unrealizedPnl ?? 0}
                compact
                className="text-2xl font-semibold"
              />
            }
            icon={TrendingUp}
            footer="executed + delivering"
            valueColor={(m?.unrealizedPnl ?? 0) >= 0 ? "positive" : "negative"}
            loading={isLoading}
          />
          <MetricCard
            title="Closing This Month"
            value={formatNumber(m?.dealsClosingThisMonth)}
            icon={Calendar}
            footer="deals"
            loading={isLoading}
          />
          <MetricCard
            title="Expiring Contracts"
            value={formatNumber(m?.expiringContracts)}
            icon={FileText}
            valueColor={
              (m?.expiringContracts ?? 0) > 5
                ? "negative"
                : (m?.expiringContracts ?? 0) > 0
                ? "warning"
                : "default"
            }
            footer="next 30 days"
            loading={isLoading}
          />
          <div className="card p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Total Exposure</span>
              <Shield className="w-3.5 h-3.5 text-text-disabled" />
            </div>
            {isLoading ? (
              <>
                <div className="skeleton h-7 w-28 rounded mt-1" />
                <div className="skeleton h-1.5 w-full rounded mt-2" />
              </>
            ) : (
              <>
                <div className="font-mono tabular-nums text-2xl font-semibold text-text-primary mt-1">
                  {formatCurrency(m?.totalExposure ?? 0, "USD", true)}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  of {formatCurrency(m?.totalCreditLimit ?? 0, "USD", true)} limit
                </div>
                <div className="mt-2 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(exposurePercent, 100)}%`,
                      backgroundColor:
                        exposurePercent > 85 ? "#EF4444"
                        : exposurePercent > 60 ? "#F59E0B"
                        : "#10B981",
                    }}
                  />
                </div>
                <p className={cn(
                  "text-[10px] font-mono mt-0.5",
                  exposurePercent > 85 ? "text-danger"
                    : exposurePercent > 60 ? "text-warning"
                    : "text-success"
                )}>
                  {exposurePercent}% utilized
                </p>
              </>
            )}
          </div>
        </div>

        {/* ─── Row 2: Pipeline + Market ─────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 flex flex-col gap-4">
            <div className="card">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Deal Pipeline</h2>
                  <p className="text-xs text-text-tertiary mt-0.5">Deals by stage (excluding dead)</p>
                </div>
                <Link href="/deals" className="text-xs text-accent hover:text-accent/80 transition-fast">
                  View all →
                </Link>
              </div>
              <div className="px-4 pb-4">
                {isLoading ? (
                  <div className="skeleton h-[200px] w-full rounded" />
                ) : (
                  <PipelineChart data={m?.dealsByStage ?? []} />
                )}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
                <h2 className="text-sm font-semibold text-text-primary">Recent Activity</h2>
                <span className="text-xs text-text-tertiary">Last 15 events</span>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton w-7 h-7 rounded flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 w-48 rounded" />
                        <div className="skeleton h-2.5 w-32 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <RecentActivity activities={m?.recentActivities as never ?? []} />
              )}
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-4">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
                <h2 className="text-sm font-semibold text-text-primary">Market Snapshot</h2>
                <Link href="/market" className="text-xs text-accent hover:text-accent/80 transition-fast">
                  Full →
                </Link>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 justify-between">
                      <div className="skeleton h-3 w-24 rounded" />
                      <div className="skeleton h-3 w-16 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <MarketSnapshot prices={m?.marketSnapshot as never ?? []} />
              )}
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
                <h2 className="text-sm font-semibold text-text-primary">Upcoming Alerts</h2>
                <span className="text-xs text-text-tertiary">
                  {m?.upcomingAlerts?.length ?? 0} unread
                </span>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 w-full rounded" />
                  ))}
                </div>
              ) : !m?.upcomingAlerts?.length ? (
                <div className="p-6 text-center text-text-tertiary text-xs">
                  No unread alerts
                </div>
              ) : (
                <div className="divide-y divide-border-default">
                  {m.upcomingAlerts.map((alert) => (
                    <div key={alert.id} className="px-4 py-2.5 flex items-start gap-2 hover:bg-bg-hover/40 transition-fast">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5",
                        alert.severity === "CRITICAL" ? "bg-danger"
                          : alert.severity === "WARNING" ? "bg-warning"
                          : "bg-blue-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-medium truncate">{alert.title}</p>
                        <p className="text-[10px] text-text-tertiary truncate">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Row 3: Open Positions by Commodity ───────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Open Positions by Commodity</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Long vs Short volume, net position</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            {isLoading ? (
              <div className="skeleton h-[220px] w-full rounded" />
            ) : (
              <PositionChart data={m?.positionsByCommodity as never ?? []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
