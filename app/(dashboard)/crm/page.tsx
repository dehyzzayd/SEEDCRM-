"use client";

import { useEffect, useState } from "react";
import { useRouter }           from "next/navigation";
import {
  Users, FileText, DollarSign, TrendingUp,
  Plus, ArrowRight, Target, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn }         from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────── */
type DealRow = {
  id:           string;
  dealNumber:   string;
  stage:        string;
  askingPrice:  number;
  totalGross:   number;
  createdAt:    string;
  updatedAt:    string;
  customer:     { firstName: string; lastName: string };
  vehicle:      { year: number; make: string; model: string; stockNumber: string };
  assignedUser: { name: string; avatarUrl?: string | null };
};

type Metrics = {
  totalDeals:     number;
  totalCustomers: number;
  pipelineValue:  number;
  totalGrossMTD:  number;
  dealsByStage:   { stage: string; count: number; value: number }[];
  recentDeals:    DealRow[];
};

/* ── Stage meta ───────────────────────────────────────────────── */
const STAGE_COLOR: Record<string, { color: string; bg: string }> = {
  NEW_LEAD:              { color: "#3B82F6", bg: "rgba(59,130,246,0.12)"  },
  CONTACTED:             { color: "#06B6D4", bg: "rgba(6,182,212,0.12)"   },
  TEST_DRIVE_SCHEDULED:  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  TEST_DRIVE_DONE:       { color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  OFFER_MADE:            { color: "#EC4899", bg: "rgba(236,72,153,0.12)"  },
  FINANCE_AND_INSURANCE: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  CONTRACTED:            { color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  PENDING_DELIVERY:      { color: "#10B981", bg: "rgba(16,185,129,0.10)"  },
  DELIVERED:             { color: "#10B981", bg: "rgba(16,185,129,0.08)"  },
  LOST:                  { color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
};

const STAGE_LABEL: Record<string, string> = {
  NEW_LEAD:              "New Lead",
  CONTACTED:             "Contacted",
  TEST_DRIVE_SCHEDULED:  "Test Drive Sched.",
  TEST_DRIVE_DONE:       "Test Drive Done",
  OFFER_MADE:            "Offer Made",
  FINANCE_AND_INSURANCE: "F&I",
  CONTRACTED:            "Contracted",
  PENDING_DELIVERY:      "Pending Delivery",
  DELIVERED:             "Delivered",
  LOST:                  "Lost",
};

/* ── Helpers ──────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n.toLocaleString()}`;

/* ── Sub-components ───────────────────────────────────────────── */
function KpiCard({
  title, value, sub, icon: Icon, iconColor, trend,
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; iconColor: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}18` }}
        >
          <Icon style={{ color: iconColor, width: 18, height: 18 }} />
        </div>
        {trend && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color:      trend === "up" ? "#10B981" : "#EF4444",
              background: trend === "up"
                ? "rgba(16,185,129,0.10)"
                : "rgba(239,68,68,0.10)",
            }}
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
        {title}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_COLOR[stage] ?? { color: "#8B98B0", bg: "rgba(139,152,176,0.12)" };
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {STAGE_LABEL[stage] ?? stage}
    </span>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function CRMHubPage() {
  const router  = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dealsRes, customersRes] = await Promise.all([
          fetch("/api/crm/deals?pageSize=200"),
          fetch("/api/crm/customers?pageSize=1"),
        ]);
        const dealsData     = await dealsRes.json();
        const customersData = await customersRes.json();

        const deals: DealRow[] = dealsData.deals ?? [];
        const now      = new Date();
        const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const activeDeals   = deals.filter(d => !["DELIVERED", "LOST"].includes(d.stage));
        const pipelineValue = activeDeals.reduce((s, d) => s + (d.askingPrice ?? 0), 0);
        const totalGrossMTD = deals
          .filter(d => d.stage === "DELIVERED" && new Date(d.updatedAt) >= mtdStart)
          .reduce((s, d) => s + (d.totalGross ?? 0), 0);

        // Group active deals by stage
        const stageMap: Record<string, { count: number; value: number }> = {};
        for (const d of activeDeals) {
          if (!stageMap[d.stage]) stageMap[d.stage] = { count: 0, value: 0 };
          stageMap[d.stage].count++;
          stageMap[d.stage].value += d.askingPrice ?? 0;
        }
        const dealsByStage = Object.entries(stageMap).map(
          ([stage, v]) => ({ stage, ...v }),
        );

        setMetrics({
          totalDeals:     activeDeals.length,
          totalCustomers: customersData.total ?? 0,
          pipelineValue,
          totalGrossMTD,
          dealsByStage,
          recentDeals:    deals.slice(0, 6),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxCount = Math.max(
    ...(metrics?.dealsByStage.map(s => s.count) ?? [1]),
    1,
  );

  return (
    <div>
      <PageHeader
        title="CRM"
        description="Pipeline overview · Deals · Customers"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/crm/customers")}
              className="btn-secondary"
            >
              <Users className="w-4 h-4" /> Customers
            </button>
            <button
              onClick={() => router.push("/crm/deals/new")}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> New Deal
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Active Deals"
            value={loading ? "—" : String(metrics?.totalDeals ?? 0)}
            icon={FileText}
            iconColor="#8B5CF6"
            trend="up"
          />
          <KpiCard
            title="Total Customers"
            value={loading ? "—" : String(metrics?.totalCustomers ?? 0)}
            icon={Users}
            iconColor="#06B6D4"
          />
          <KpiCard
            title="Pipeline Value"
            value={loading ? "—" : fmt(metrics?.pipelineValue ?? 0)}
            icon={DollarSign}
            iconColor="#10B981"
            trend="up"
          />
          <KpiCard
            title="Gross MTD"
            value={loading ? "—" : fmt(metrics?.totalGrossMTD ?? 0)}
            icon={TrendingUp}
            iconColor="#F59E0B"
          />
        </div>

        {/* ── Pipeline + Recent Deals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pipeline funnel */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Deal Pipeline
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {metrics?.dealsByStage.reduce((s, d) => s + d.count, 0) ?? 0} active deals
                </p>
              </div>
              <Target className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
            </div>

            <div className="space-y-2.5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-6 rounded" />
                  ))
                : metrics?.dealsByStage.length === 0
                ? (
                    <div className="py-8 text-center">
                      <Clock
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        No active deals yet
                      </p>
                    </div>
                  )
                : metrics?.dealsByStage.map((row) => (
                    <div key={row.stage} className="flex items-center gap-3">
                      <div className="w-32 flex-shrink-0">
                        <StageBadge stage={row.stage} />
                      </div>
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--bg-hover)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width:      `${(row.count / maxCount) * 100}%`,
                            background: STAGE_COLOR[row.stage]?.color ?? "#8B98B0",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold w-4 text-right"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {row.count}
                      </span>
                      <span
                        className="text-[10px] w-14 text-right"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {fmt(row.value)}
                      </span>
                    </div>
                  ))
              }
            </div>

            <div
              className="mt-4 pt-4 border-t flex justify-end"
              style={{ borderColor: "var(--border-default)" }}
            >
              <button
                onClick={() => router.push("/crm/deals")}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                View all deals <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent deals */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Deals
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Latest activity
                </p>
              </div>
              <button
                onClick={() => router.push("/crm/deals")}
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--accent)" }}
              >
                All deals <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-0">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded mb-2" />
                  ))
                : metrics?.recentDeals.length === 0
                ? (
                    <div className="py-8 text-center">
                      <FileText
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        No deals yet
                      </p>
                      <button
                        onClick={() => router.push("/crm/deals/new")}
                        className="btn-primary mt-4 mx-auto"
                      >
                        <Plus className="w-4 h-4" /> New Deal
                      </button>
                    </div>
                  )
                : metrics?.recentDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => router.push(`/crm/deals/${deal.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 py-2.5 border-b",
                        "text-left transition-colors rounded px-2 -mx-2",
                        "hover:bg-[var(--bg-hover)]",
                      )}
                      style={{ borderColor: "var(--border-default)" }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center
                                   text-[10px] font-bold flex-shrink-0"
                        style={{
                          background: "rgba(0,212,170,0.12)",
                          color:      "var(--accent)",
                        }}
                      >
                        {deal.assignedUser.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {deal.customer.firstName} {deal.customer.lastName}
                          </p>
                          <span
                            className="text-[10px] flex-shrink-0"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {deal.dealNumber}
                          </span>
                        </div>
                        <p
                          className="text-[10px] truncate"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
                        </p>
                      </div>

                      {/* Stage + price */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {deal.askingPrice ? fmt(deal.askingPrice) : "—"}
                        </span>
                        <StageBadge stage={deal.stage} />
                      </div>
                    </button>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              title:  "New Deal",
              desc:   "Start a new sales deal from scratch",
              icon:   FileText,
              color:  "#8B5CF6",
              href:   "/crm/deals/new",
            },
            {
              title:  "Add Customer",
              desc:   "Create a new customer profile",
              icon:   Users,
              color:  "#06B6D4",
              href:   "/crm/customers",
            },
            {
              title:  "View Pipeline",
              desc:   "See all deals in Kanban or table view",
              icon:   Target,
              color:  "#10B981",
              href:   "/crm/deals",
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => router.push(item.href)}
              className={cn(
                "card p-5 text-left transition-all duration-120",
                "hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]",
              )}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${item.color}18` }}
              >
                <item.icon style={{ color: item.color, width: 18, height: 18 }} />
              </div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {item.desc}
              </p>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
