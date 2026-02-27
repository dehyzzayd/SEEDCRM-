"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter }                         from "next/navigation";
import {
  Plus, Search, X, List, LayoutGrid,
  ChevronDown, MoreHorizontal, Loader2,
  Car, User, Calendar, DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn }         from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────── */
type Deal = {
  id:           string;
  dealNumber:   string;
  stage:        string;
  leadSource:   string;
  probability:  number;
  askingPrice:  number;
  totalGross:   number;
  financeType:  string;
  createdAt:    string;
  updatedAt:    string;
  customer:     { id: string; firstName: string; lastName: string; phone?: string; email?: string };
  vehicle:      { id: string; year: number; make: string; model: string; trim?: string; stockNumber: string };
  assignedUser: { id: string; name: string; avatarUrl?: string | null };
  _count:       { activities: number };
};

/* ── Constants ────────────────────────────────────────────────── */
const STAGES = [
  "NEW_LEAD", "CONTACTED", "TEST_DRIVE_SCHEDULED",
  "TEST_DRIVE_DONE", "OFFER_MADE", "FINANCE_AND_INSURANCE",
  "CONTRACTED", "PENDING_DELIVERY", "DELIVERED", "LOST",
];

const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  NEW_LEAD:              { label: "New Lead",          color: "#3B82F6", bg: "rgba(59,130,246,0.12)"  },
  CONTACTED:             { label: "Contacted",         color: "#06B6D4", bg: "rgba(6,182,212,0.12)"   },
  TEST_DRIVE_SCHEDULED:  { label: "Test Drive Sched.", color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  TEST_DRIVE_DONE:       { label: "Test Drive Done",   color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  OFFER_MADE:            { label: "Offer Made",        color: "#EC4899", bg: "rgba(236,72,153,0.12)"  },
  FINANCE_AND_INSURANCE: { label: "F&I",               color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  CONTRACTED:            { label: "Contracted",        color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  PENDING_DELIVERY:      { label: "Pending Delivery",  color: "#10B981", bg: "rgba(16,185,129,0.10)"  },
  DELIVERED:             { label: "Delivered",         color: "#10B981", bg: "rgba(16,185,129,0.08)"  },
  LOST:                  { label: "Lost",              color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
};

const SORT_OPTIONS = [
  { label: "Newest first",     value: "createdAt_desc"   },
  { label: "Oldest first",     value: "createdAt_asc"    },
  { label: "Price: high→low",  value: "askingPrice_desc" },
  { label: "Price: low→high",  value: "askingPrice_asc"  },
  { label: "Last updated",     value: "updatedAt_desc"   },
];

/* ── Helpers ──────────────────────────────────────────────────── */
const fmt = (n?: number | null) =>
  n != null ? "$" + n.toLocaleString() : "—";

const daysSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86_400_000);
};

/* ── Stage badge ──────────────────────────────────────────────── */
function StageBadge({ stage }: { stage: string }) {
  const m = STAGE_META[stage] ?? { label: stage, color: "#8B98B0", bg: "rgba(139,152,176,0.12)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

/* ── Avatar ───────────────────────────────────────────────────── */
function Avatar({ name, size = 7 }: { name: string; size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center
                  text-[10px] font-bold flex-shrink-0`}
      style={{ background: "rgba(0,212,170,0.12)", color: "var(--accent)" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ── Deal action menu ─────────────────────────────────────────── */
function DealMenu({
  deal,
  onStageChange,
}: {
  deal: Deal;
  onStageChange: (id: string, stage: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(p => !p)}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: "var(--text-tertiary)" }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-20 w-48 rounded-xl border shadow-xl overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
          >
            <button
              onClick={() => { router.push(`/crm/deals/${deal.id}`); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left
                         hover:bg-[var(--bg-hover)] transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              View detail
            </button>

            <div className="border-t px-4 py-2" style={{ borderColor: "var(--border-default)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                 style={{ color: "var(--text-tertiary)" }}>
                Move to stage
              </p>
              {STAGES.filter(s => s !== deal.stage).slice(0, 4).map(s => (
                <button
                  key={s}
                  onClick={() => { onStageChange(deal.id, s); setOpen(false); }}
                  className="w-full text-left py-1 text-xs hover:text-[var(--accent)] transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {STAGE_META[s]?.label ?? s}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Kanban card ──────────────────────────────────────────────── */
function KanbanCard({
  deal,
  onStageChange,
}: {
  deal: Deal;
  onStageChange: (id: string, stage: string) => void;
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/crm/deals/${deal.id}`)}
      className="card p-3.5 cursor-pointer hover:border-[var(--border-hover)]
                 transition-all duration-120 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {deal.customer.firstName} {deal.customer.lastName}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {deal.dealNumber}
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1">
          <DealMenu deal={deal} onStageChange={onStageChange} />
        </div>
      </div>

      {/* Vehicle */}
      <div
        className="flex items-center gap-1.5 mb-2.5 px-2.5 py-1.5 rounded-lg"
        style={{ background: "var(--bg-hover)" }}
      >
        <Car className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
        <p className="text-[10px] truncate" style={{ color: "var(--text-secondary)" }}>
          {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
        </p>
      </div>

      {/* Price + days */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
          {fmt(deal.askingPrice)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {daysSince(deal.createdAt)}d
          </span>
          <Avatar name={deal.assignedUser.name} size={5} />
        </div>
      </div>
    </div>
  );
}

/* ── Kanban column ────────────────────────────────────────────── */
function KanbanColumn({
  stage,
  deals,
  onStageChange,
}: {
  stage: string;
  deals: Deal[];
  onStageChange: (id: string, stage: string) => void;
}) {
  const m     = STAGE_META[stage];
  const total = deals.reduce((s, d) => s + (d.askingPrice ?? 0), 0);

  return (
    <div className="flex-shrink-0 w-64 flex flex-col">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b mb-2"
        style={{
          background:   m.bg,
          borderColor:  m.color + "33",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: m.color }}>
            {m.label}
          </span>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: m.color + "22", color: m.color }}
          >
            {deals.length}
          </span>
        </div>
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {total > 0 ? "$" + (total / 1000).toFixed(0) + "K" : "—"}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
        {deals.length === 0 ? (
          <div
            className="border border-dashed rounded-lg p-4 text-center"
            style={{ borderColor: "var(--border-default)" }}
          >
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              No deals
            </p>
          </div>
        ) : (
          deals.map(d => (
            <KanbanCard key={d.id} deal={d} onStageChange={onStageChange} />
          ))
        )}
      </div>
    </div>
  );
}

/* ── Table row ────────────────────────────────────────────────── */
function TableRow({
  deal,
  onStageChange,
}: {
  deal: Deal;
  onStageChange: (id: string, stage: string) => void;
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/crm/deals/${deal.id}`)}
      className="grid items-center gap-4 px-5 py-3.5 border-b cursor-pointer
                 transition-colors hover:bg-[var(--bg-hover)]"
      style={{
        borderColor:     "var(--border-default)",
        gridTemplateColumns: "1fr 1.2fr 1fr auto auto auto",
      }}
    >
      {/* Customer */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar name={deal.customer.firstName} />
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {deal.customer.firstName} {deal.customer.lastName}
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {deal.dealNumber}
          </p>
        </div>
      </div>

      {/* Vehicle */}
      <div className="min-w-0">
        <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>
          {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          #{deal.vehicle.stockNumber}
        </p>
      </div>

      {/* Stage */}
      <div>
        <StageBadge stage={deal.stage} />
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
          {fmt(deal.askingPrice)}
        </p>
        {deal.totalGross > 0 && (
          <p className="text-[10px] font-semibold" style={{ color: "#10B981" }}>
            {fmt(deal.totalGross)} gross
          </p>
        )}
      </div>

      {/* Days */}
      <div className="text-right">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {daysSince(deal.createdAt)}d
        </p>
      </div>

      {/* Actions */}
      <div onClick={e => e.stopPropagation()}>
        <DealMenu deal={deal} onStageChange={onStageChange} />
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function DealsPage() {
  const router = useRouter();

  const [deals,        setDeals]        = useState<Deal[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [q,            setQ]            = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [stageFilter,  setStageFilter]  = useState("");
  const [sort,         setSort]         = useState("createdAt_desc");
  const [viewMode,     setViewMode]     = useState<"table" | "kanban">("kanban");
  const [showFilters,  setShowFilters]  = useState(false);

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  /* Fetch deals */
  const loadDeals = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debouncedQ)  p.set("q",     debouncedQ);
      if (stageFilter) p.set("stage", stageFilter);
      const [sortBy, sortDir] = sort.split("_");
      p.set("sortBy",   sortBy);
      p.set("sortDir",  sortDir);
      p.set("pageSize", "200");

      const res  = await fetch(`/api/crm/deals?${p}`);
      const data = await res.json();
      setDeals(data.deals  ?? []);
      setTotal(data.total  ?? 0);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, stageFilter, sort]);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  /* Stage change handler */
  const handleStageChange = async (id: string, stage: string) => {
    setDeals(prev =>
      prev.map(d => d.id === id ? { ...d, stage } : d),
    );
    await fetch(`/api/crm/deals/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ stage }),
    });
  };

  /* Group deals by stage for kanban */
  const byStage = STAGES.reduce<Record<string, Deal[]>>((acc, s) => {
    acc[s] = deals.filter(d => d.stage === s);
    return acc;
  }, {});

  const isFiltered = !!(debouncedQ || stageFilter);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <PageHeader
        title="Deals"
        breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Deals" }]}
        description={loading ? "Loading…" : `${total} deal${total !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div
              className="flex rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--border-default)" }}
            >
              {(["kanban", "table"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className="p-2 transition-colors"
                  style={{
                    background: viewMode === m ? "var(--accent)" : "var(--bg-panel)",
                    color:      viewMode === m ? "#fff"          : "var(--text-tertiary)",
                  }}
                >
                  {m === "kanban"
                    ? <LayoutGrid className="w-4 h-4" />
                    : <List       className="w-4 h-4" />
                  }
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push("/crm/deals/new")}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> New Deal
            </button>
          </div>
        }
      />

      {/* ── Search + filters ── */}
      <div
        className="px-6 py-3 border-b flex items-center gap-2 flex-wrap"
        style={{
          background:  "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search deal #, customer, vehicle…"
            className="input-field w-full pl-9 pr-9"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stage filter */}
        <div className="relative">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="input-field pl-3 pr-8 appearance-none"
            style={{ width: 160 }}
          >
            <option value="">All stages</option>
            {STAGES.map(s => (
              <option key={s} value={s}>{STAGE_META[s]?.label ?? s}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field pl-3 pr-8 appearance-none"
            style={{ width: 160 }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        {/* Clear filters */}
        {isFiltered && (
          <button
            onClick={() => { setQ(""); setStageFilter(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm"
            style={{ borderColor: "#EF4444", color: "#EF4444" }}
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "var(--accent)" }}
          />
        </div>

      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "rgba(139,92,246,0.08)",
              border:     "1px dashed rgba(139,92,246,0.3)",
            }}
          >
            <DollarSign className="w-10 h-10" style={{ color: "#8B5CF6" }} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {isFiltered ? "No deals match" : "No deals yet"}
          </h3>
          <p
            className="text-sm mb-8 max-w-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {isFiltered
              ? "Try clearing your filters."
              : "Create your first deal to start tracking your pipeline."}
          </p>
          {!isFiltered ? (
            <button
              onClick={() => router.push("/crm/deals/new")}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> New Deal
            </button>
          ) : (
            <button
              onClick={() => { setQ(""); setStageFilter(""); }}
              className="btn-secondary"
            >
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

      ) : viewMode === "kanban" ? (
        /* ── Kanban ── */
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => (
              <KanbanColumn
                key={stage}
                stage={stage}
                deals={byStage[stage] ?? []}
                onStageChange={handleStageChange}
              />
            ))}
          </div>
        </div>

      ) : (
        /* ── Table ── */
        <div className="px-6 py-4">
          <div
            className="card overflow-hidden"
            style={{ borderColor: "var(--border-default)" }}
          >
            {/* Table header */}
            <div
              className="grid items-center gap-4 px-5 py-2.5 border-b"
              style={{
                background:          "var(--bg-hover)",
                borderColor:         "var(--border-default)",
                gridTemplateColumns: "1fr 1.2fr 1fr auto auto auto",
              }}
            >
              {["Customer", "Vehicle", "Stage", "Price", "Age", ""].map(h => (
                <p
                  key={h}
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {h}
                </p>
              ))}
            </div>

            {deals.map(d => (
              <TableRow key={d.id} deal={d} onStageChange={handleStageChange} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
