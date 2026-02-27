"use client";

import {
  Car, Users, DollarSign, TrendingUp, Clock, FileText,
  AlertTriangle, CheckCircle, ArrowUp, ArrowDown,
  BarChart3, Target, Percent, Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

/* ── tiny sparkline ────────────────────────────────────────── */
function MiniBar({ values, color = "#10B981" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === values.length - 1 ? 1 : 0.4 }}
          className="w-1.5 rounded-sm flex-shrink-0"
        />
      ))}
    </div>
  );
}

/* ── KPI card ──────────────────────────────────────────────── */
function KpiCard({
  title, value, sub, change, changeLabel, icon: Icon, iconColor, trend, spark, sparkColor,
}: {
  title: string; value: string; sub?: string; change?: number; changeLabel?: string;
  icon: React.ElementType; iconColor: string; trend?: "up" | "down" | "neutral";
  spark?: number[]; sparkColor?: string;
}) {
  const positive = trend === "up";
  const negative = trend === "down";
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-tertiary mb-1">{title}</p>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{value}</p>
          {sub && <p className="text-xs text-text-tertiary mt-0.5">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: `${iconColor}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor, width: 18, height: 18 }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            positive ? "text-success" : negative ? "text-danger" : "text-text-tertiary"
          )}>
            {positive ? <ArrowUp className="w-3 h-3" /> : negative ? <ArrowDown className="w-3 h-3" /> : null}
            {change > 0 ? "+" : ""}{change}% {changeLabel ?? "vs last month"}
          </div>
        )}
        {spark && <MiniBar values={spark} color={sparkColor ?? iconColor} />}
      </div>
    </div>
  );
}

/* ── pipeline stage badge ──────────────────────────────────── */
const stageColors: Record<string, string> = {
  "New Lead":     "bg-blue-500/15 text-blue-400",
  "Contacted":    "bg-cyan-500/15 text-cyan-400",
  "Test Drive":   "bg-yellow-500/15 text-yellow-400",
  "Offer Made":   "bg-orange-500/15 text-orange-400",
  "F&I":          "bg-purple-500/15 text-purple-400",
  "Contracted":   "bg-success/15 text-success",
  "Delivered":    "bg-success/20 text-success",
  "Lost":         "bg-danger/15 text-danger",
};

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", stageColors[stage] ?? "bg-bg-hover text-text-secondary")}>
      {stage}
    </span>
  );
}

/* ── status dot ────────────────────────────────────────────── */
function StatusDot({ status }: { status: "available" | "reserved" | "sold" | "aging" }) {
  const colors = {
    available: "bg-success",
    reserved:  "bg-yellow-400",
    sold:      "bg-blue-400",
    aging:     "bg-danger",
  };
  return <span className={cn("w-2 h-2 rounded-full inline-block", colors[status])} />;
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Good morning, Zayd · ${today}`}
      />

      <div className="p-6 space-y-6">

        {/* ── Row 1 — Primary KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Units Sold MTD"
            value="14"
            sub="Goal: 20 units"
            change={16.7}
            trend="up"
            icon={Car}
            iconColor="#10B981"
            spark={[6,8,9,11,10,12,14]}
          />
          <KpiCard
            title="Total Gross MTD"
            value="$87,420"
            sub="Front + Back end"
            change={8.3}
            trend="up"
            icon={DollarSign}
            iconColor="#6366F1"
            spark={[38000,42000,55000,61000,70000,79000,87420]}
            sparkColor="#6366F1"
          />
          <KpiCard
            title="Avg Gross / Unit"
            value="$6,244"
            sub="Incl. F&I backend"
            change={-4.1}
            trend="down"
            icon={TrendingUp}
            iconColor="#F59E0B"
            spark={[6800,6500,6900,6200,6400,6100,6244]}
            sparkColor="#F59E0B"
          />
          <KpiCard
            title="Lead Conv. Rate"
            value="18.4%"
            sub="Leads → Delivered"
            change={2.1}
            trend="up"
            icon={Percent}
            iconColor="#EC4899"
            spark={[14,15,16,15,17,18,18.4]}
            sparkColor="#EC4899"
          />
        </div>

        {/* ── Row 2 — Inventory + Pipeline ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Inventory"
            value="43 units"
            sub="$1.2M total cost basis"
            icon={Car}
            iconColor="#10B981"
            spark={[38,41,44,42,45,43,43]}
          />
          <KpiCard
            title="Avg Days on Lot"
            value="27 days"
            sub="Target: ≤30 days"
            change={-3.5}
            trend="up"
            icon={Clock}
            iconColor="#06B6D4"
            spark={[35,32,31,29,28,27,27]}
            sparkColor="#06B6D4"
          />
          <KpiCard
            title="Active Deals"
            value="31"
            sub="In pipeline"
            change={12.0}
            trend="up"
            icon={FileText}
            iconColor="#8B5CF6"
            spark={[18,21,24,26,28,29,31]}
            sparkColor="#8B5CF6"
          />
          <KpiCard
            title="New Leads MTD"
            value="76"
            sub="Across all sources"
            change={22.6}
            trend="up"
            icon={Users}
            iconColor="#F97316"
            spark={[42,48,51,58,63,70,76]}
            sparkColor="#F97316"
          />
        </div>

        {/* ── Row 3 — Deal Pipeline + Inventory Aging ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Deal Pipeline */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Deal Pipeline</p>
                <p className="text-xs text-text-tertiary">31 active deals · $1.94M potential</p>
              </div>
              <Target className="w-4 h-4 text-text-tertiary" />
            </div>

            {/* Funnel bars */}
            <div className="space-y-2.5">
              {[
                { stage: "New Lead",   count: 12, value: "$312K", pct: 100, color: "#3B82F6" },
                { stage: "Contacted",  count: 9,  value: "$248K", pct: 75,  color: "#06B6D4" },
                { stage: "Test Drive", count: 5,  value: "$187K", pct: 55,  color: "#F59E0B" },
                { stage: "Offer Made", count: 3,  value: "$124K", pct: 35,  color: "#F97316" },
                { stage: "F&I",        count: 2,  value: "$89K",  pct: 22,  color: "#8B5CF6" },
              ].map((row) => (
                <div key={row.stage} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <StageBadge stage={row.stage} />
                  </div>
                  <div className="flex-1 h-2 bg-bg-hover rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-text-primary w-4 text-right">{row.count}</span>
                    <span className="text-[10px] text-text-tertiary w-12">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stage totals */}
            <div className="mt-4 pt-4 border-t border-border-default grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Closing This Week", value: "4", color: "text-success" },
                { label: "Avg Deal Age",       value: "8.2d", color: "text-text-primary" },
                { label: "Won MTD",            value: "14", color: "text-accent" },
              ].map((s) => (
                <div key={s.label}>
                  <p className={cn("text-base font-bold", s.color)}>{s.value}</p>
                  <p className="text-[10px] text-text-tertiary">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Aging */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Inventory Aging</p>
                <p className="text-xs text-text-tertiary">43 vehicles · 6 need attention</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>

            {/* Aging buckets */}
            <div className="space-y-2 mb-4">
              {[
                { label: "0–15 days",  count: 18, pct: 42, color: "#10B981" },
                { label: "16–30 days", count: 13, pct: 30, color: "#F59E0B" },
                { label: "31–45 days", count: 8,  pct: 19, color: "#F97316" },
                { label: "46–60 days", count: 3,  pct: 7,  color: "#EF4444" },
                { label: "60+ days",   count: 1,  pct: 2,  color: "#7F1D1D" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-xs text-text-tertiary w-20 flex-shrink-0">{row.label}</span>
                  <div className="flex-1 h-2 bg-bg-hover rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-6 text-right">{row.count}</span>
                </div>
              ))}
            </div>

            {/* Aging alerts */}
            <div className="space-y-1.5">
              {[
                { stock: "SA-003", car: "2021 BMW 330i",       days: 41, status: "aging"    as const },
                { stock: "SA-008", car: "2019 Ford F-150",     days: 53, status: "aging"    as const },
                { stock: "SA-011", car: "2018 Chevy Malibu",   days: 68, status: "aging"    as const },
              ].map((v) => (
                <div key={v.stock} className="flex items-center justify-between py-1.5 border-b border-border-default/40">
                  <div className="flex items-center gap-2">
                    <StatusDot status={v.status} />
                    <span className="text-xs text-text-primary font-medium">{v.car}</span>
                    <span className="text-[10px] text-text-tertiary">{v.stock}</span>
                  </div>
                  <span className="text-xs font-semibold text-danger">{v.days}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 4 — Recent Deals + Lead Sources + F&I ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Deals */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary">Recent Deals</p>
              <a href="/deals" className="text-xs text-accent hover:underline">View all →</a>
            </div>
            <div className="space-y-0">
              {[
                { deal: "LP-2026-001", customer: "Marcus Thompson", car: "2023 Tesla Model 3",   stage: "F&I",        gross: "$7,900",  assigned: "ZA" },
                { deal: "LP-2026-002", customer: "Sarah Chen",      car: "2021 BMW 3 Series",    stage: "Test Drive", gross: "—",       assigned: "ZA" },
                { deal: "LP-2026-003", customer: "James O'Brien",   car: "2022 Toyota Camry",    stage: "New Lead",   gross: "—",       assigned: "ZA" },
                { deal: "LP-2026-004", customer: "Priya Patel",     car: "2020 Honda CR-V",      stage: "Offer Made", gross: "$4,200",  assigned: "ZA" },
                { deal: "LP-2026-005", customer: "Derek Williams",  car: "2022 Hyundai Tucson",  stage: "Contracted", gross: "$5,650",  assigned: "ZA" },
              ].map((d) => (
                <div key={d.deal} className="flex items-center gap-3 py-2.5 border-b border-border-default/40 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
                    {d.assigned}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-text-primary truncate">{d.customer}</p>
                      <span className="text-[10px] text-text-tertiary flex-shrink-0">{d.deal}</span>
                    </div>
                    <p className="text-[10px] text-text-tertiary truncate">{d.car}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-semibold text-text-primary">{d.gross}</span>
                    <StageBadge stage={d.stage} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources + F&I */}
          <div className="space-y-4">

            {/* Lead Sources */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-text-primary mb-3">Lead Sources MTD</p>
              <div className="space-y-2">
                {[
                  { source: "Walk-In",    count: 24, pct: 32, color: "#10B981" },
                  { source: "Website",    count: 18, pct: 24, color: "#6366F1" },
                  { source: "CarGurus",   count: 14, pct: 18, color: "#F59E0B" },
                  { source: "Referral",   count: 11, pct: 14, color: "#EC4899" },
                  { source: "AutoTrader", count: 9,  pct: 12, color: "#06B6D4" },
                ].map((s) => (
                  <div key={s.source} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-text-secondary flex-1">{s.source}</span>
                    <span className="text-xs font-semibold text-text-primary">{s.count}</span>
                    <span className="text-[10px] text-text-tertiary w-8 text-right">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* F&I Summary */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-text-primary mb-3">F&I Performance</p>
              <div className="space-y-2.5">
                {[
                  { label: "Avg Backend / Unit", value: "$2,180", good: true  },
                  { label: "Finance Penetration", value: "71%",   good: true  },
                  { label: "GAP Penetration",     value: "48%",   good: true  },
                  { label: "Warranty Penetration",value: "39%",   good: false },
                  { label: "Reserve MTD",         value: "$8,640",good: true  },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">{f.label}</span>
                    <span className={cn("text-xs font-semibold", f.good ? "text-success" : "text-warning")}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 5 — Tasks + Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Follow-up Tasks */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary">Today's Follow-Ups</p>
              <span className="badge bg-danger/15 text-danger text-[10px] font-semibold px-2 py-0.5 rounded">
                5 due
              </span>
            </div>
            <div className="space-y-2">
              {[
                { customer: "Marcus Thompson", action: "Send finance options",    time: "10:00 AM", done: false, urgent: true  },
                { customer: "Sarah Chen",      action: "Confirm test drive appt", time: "11:30 AM", done: false, urgent: false },
                { customer: "Raj Sharma",      action: "Call back — left msg",    time: "2:00 PM",  done: false, urgent: true  },
                { customer: "Lisa Park",       action: "Email trade-in offer",    time: "3:00 PM",  done: false, urgent: false },
                { customer: "Tom Bradley",     action: "Delivery paperwork",      time: "4:30 PM",  done: true,  urgent: false },
              ].map((t) => (
                <div key={t.customer} className={cn(
                  "flex items-center gap-3 py-2 rounded-lg px-2",
                  t.urgent && !t.done ? "bg-danger/5" : ""
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center",
                    t.done ? "bg-success border-success" : "border-border-hover"
                  )}>
                    {t.done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium", t.done ? "line-through text-text-tertiary" : "text-text-primary")}>
                      {t.customer}
                    </p>
                    <p className="text-[10px] text-text-tertiary truncate">{t.action}</p>
                  </div>
                  <span className={cn("text-[10px] flex-shrink-0", t.urgent && !t.done ? "text-danger font-semibold" : "text-text-tertiary")}>
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary">Alerts</p>
              <span className="badge bg-warning/15 text-warning text-[10px] font-semibold px-2 py-0.5 rounded">
                6 active
              </span>
            </div>
            <div className="space-y-2">
              {[
                { icon: AlertTriangle, color: "text-danger",  bg: "bg-danger/10",  msg: "SA-011 (2018 Malibu) on lot 68 days — consider wholesale", time: "Today"     },
                { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", msg: "SA-008 (2019 F-150) on lot 53 days — price reduction needed", time: "Today"   },
                { icon: Clock,         color: "text-warning", bg: "bg-warning/10", msg: "3 customers with no follow-up in 5+ days",                  time: "Today"     },
                { icon: DollarSign,    color: "text-blue-400",bg: "bg-blue-500/10",msg: "LP-2026-001 finance approval pending — Ally Financial",     time: "Yesterday" },
                { icon: CheckCircle,   color: "text-success", bg: "bg-success/10", msg: "LP-2026-005 contracted — delivery scheduled for Friday",    time: "Yesterday" },
                { icon: Users,         color: "text-purple-400",bg:"bg-purple-500/10",msg: "4 new leads from CarGurus overnight",                   time: "8h ago"    },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5", a.bg)}>
                    <a.icon className={cn("w-3 h-3", a.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary leading-relaxed">{a.msg}</p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 6 — Monthly Trend ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">Monthly Sales Trend</p>
              <p className="text-xs text-text-tertiary">Units sold and gross profit — last 6 months</p>
            </div>
            <BarChart3 className="w-4 h-4 text-text-tertiary" />
          </div>
          <div className="flex items-end gap-3 h-24">
            {[
              { month: "Sep", units: 11, gross: 58 },
              { month: "Oct", units: 13, gross: 71 },
              { month: "Nov", units: 10, gross: 54 },
              { month: "Dec", units: 16, gross: 89 },
              { month: "Jan", units: 12, gross: 63 },
              { month: "Feb", units: 14, gross: 87, current: true },
            ].map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-16">
                  <div
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: `${(m.units / 16) * 100}%`,
                      background: m.current ? "#10B981" : "rgba(16,185,129,0.3)",
                    }}
                  />
                  <div
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: `${(m.gross / 89) * 100}%`,
                      background: m.current ? "#6366F1" : "rgba(99,102,241,0.3)",
                    }}
                  />
                </div>
                <span className={cn("text-[10px]", m.current ? "text-text-primary font-semibold" : "text-text-tertiary")}>
                  {m.month}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
              <span className="text-[10px] text-text-tertiary">Units Sold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#6366F1]" />
              <span className="text-[10px] text-text-tertiary">Gross ($K)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
