"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter }                         from "next/navigation";
import {
  Plus, Search, X, ChevronDown,
  Loader2, Users, Phone, Mail,
  MoreHorizontal, CheckCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn }         from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────── */
type Customer = {
  id:          string;
  firstName:   string;
  lastName:    string;
  email?:      string | null;
  phone?:      string | null;
  creditTier?: string | null;
  preApproved: boolean;
  leadSource:  string;
  tags:        string[];
  createdAt:   string;
  updatedAt:   string;
  _count: {
    salesDeals: number;
    activities: number;
  };
};

/* ── Constants ────────────────────────────────────────────────── */
const LEAD_SOURCES = [
  "WALK_IN", "WEBSITE", "PHONE", "REFERRAL",
  "CARGURUS", "AUTOTRADER", "FACEBOOK", "CRAIGSLIST", "OTHER",
];

const LEAD_SOURCE_LABEL: Record<string, string> = {
  WALK_IN:   "Walk-In",   WEBSITE:   "Website",
  PHONE:     "Phone",     REFERRAL:  "Referral",
  CARGURUS:  "CarGurus",  AUTOTRADER:"AutoTrader",
  FACEBOOK:  "Facebook",  CRAIGSLIST:"Craigslist",
  OTHER:     "Other",
};

const LEAD_SOURCE_COLOR: Record<string, { color: string; bg: string }> = {
  WALK_IN:    { color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  WEBSITE:    { color: "#6366F1", bg: "rgba(99,102,241,0.12)"  },
  PHONE:      { color: "#06B6D4", bg: "rgba(6,182,212,0.12)"   },
  REFERRAL:   { color: "#EC4899", bg: "rgba(236,72,153,0.12)"  },
  CARGURUS:   { color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  AUTOTRADER: { color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  FACEBOOK:   { color: "#3B82F6", bg: "rgba(59,130,246,0.12)"  },
  CRAIGSLIST: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)"  },
  OTHER:      { color: "#8B98B0", bg: "rgba(139,152,176,0.12)" },
};

const CREDIT_TIERS = ["Excellent", "Good", "Fair", "Poor", "Unknown"];

const SORT_OPTIONS = [
  { label: "Newest first",  value: "createdAt_desc" },
  { label: "Oldest first",  value: "createdAt_asc"  },
  { label: "Last name A–Z", value: "lastName_asc"   },
  { label: "Last name Z–A", value: "lastName_desc"  },
  { label: "Most deals",    value: "createdAt_desc" },
];

/* ── Helpers ──────────────────────────────────────────────────── */
const initials = (c: Customer) =>
  (c.firstName.charAt(0) + c.lastName.charAt(0)).toUpperCase();

const fullName = (c: Customer) => `${c.firstName} ${c.lastName}`;

/* ── Lead source badge ────────────────────────────────────────── */
function LeadBadge({ source }: { source: string }) {
  const m = LEAD_SOURCE_COLOR[source] ?? LEAD_SOURCE_COLOR.OTHER;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: m.bg, color: m.color }}
    >
      {LEAD_SOURCE_LABEL[source] ?? source}
    </span>
  );
}

/* ── Credit tier badge ────────────────────────────────────────── */
function CreditBadge({ tier }: { tier?: string | null }) {
  if (!tier) return null;
  const color =
    tier === "Excellent" ? "#10B981" :
    tier === "Good"      ? "#06B6D4" :
    tier === "Fair"      ? "#F59E0B" :
    tier === "Poor"      ? "#EF4444" : "#8B98B0";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: color + "18", color }}
    >
      {tier}
    </span>
  );
}

/* ── New customer slide-in form ───────────────────────────────── */
function NewCustomerPanel({
  open,
  onClose,
  onCreated,
}: {
  open:      boolean;
  onClose:   () => void;
  onCreated: (c: Customer) => void;
}) {
  const [form, setForm]       = useState({
    firstName: "", lastName:  "", email: "",
    phone: "",     creditTier: "", leadSource: "WALK_IN", notes: "",
  });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res  = await fetch("/api/crm/customers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create customer");
      onCreated(data.customer);
      onClose();
      setForm({
        firstName: "", lastName: "", email: "",
        phone: "", creditTier: "", leadSource: "WALK_IN", notes: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l shadow-2xl"
        style={{
          background:  "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              New Customer
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Add a customer to your CRM
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{ background: "rgba(239,68,68,0.10)", color: "#EF4444" }}
            >
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5"
                     style={{ color: "var(--text-secondary)" }}>
                First name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                required
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
                placeholder="John"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5"
                     style={{ color: "var(--text-secondary)" }}>
                Last name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                required
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
                placeholder="Smith"
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5"
                   style={{ color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              placeholder="john@email.com"
              className="input-field w-full"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium mb-1.5"
                   style={{ color: "var(--text-secondary)" }}>
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
              placeholder="(555) 000-0000"
              className="input-field w-full"
            />
          </div>

          {/* Lead source + Credit tier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5"
                     style={{ color: "var(--text-secondary)" }}>
                Lead source
              </label>
              <div className="relative">
                <select
                  value={form.leadSource}
                  onChange={e => set("leadSource", e.target.value)}
                  className="input-field w-full appearance-none pr-8"
                >
                  {LEAD_SOURCES.map(s => (
                    <option key={s} value={s}>{LEAD_SOURCE_LABEL[s]}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5"
                     style={{ color: "var(--text-secondary)" }}>
                Credit tier
              </label>
              <div className="relative">
                <select
                  value={form.creditTier}
                  onChange={e => set("creditTier", e.target.value)}
                  className="input-field w-full appearance-none pr-8"
                >
                  <option value="">Unknown</option>
                  {CREDIT_TIERS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5"
                   style={{ color: "var(--text-secondary)" }}>
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Any initial notes…"
              rows={3}
              className="input-field w-full resize-none"
              style={{ height: "auto", paddingTop: 8, paddingBottom: 8 }}
            />
          </div>
        </form>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0"
          style={{ borderColor: "var(--border-default)" }}
        >
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving || !form.firstName || !form.lastName}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Create Customer"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Customer row ─────────────────────────────────────────────── */
function CustomerRow({ customer }: { customer: Customer }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/crm/customers/${customer.id}`)}
      className="grid items-center gap-4 px-5 py-3.5 border-b cursor-pointer
                 transition-colors hover:bg-[var(--bg-hover)]"
      style={{
        borderColor:         "var(--border-default)",
        gridTemplateColumns: "auto 1fr auto auto auto auto",
      }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center
                   text-xs font-bold flex-shrink-0"
        style={{ background: "rgba(0,212,170,0.12)", color: "var(--accent)" }}
      >
        {initials(customer)}
      </div>

      {/* Name + contact */}
      <div className="min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {fullName(customer)}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {customer.email && (
            <span
              className="flex items-center gap-1 text-[10px] truncate"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Mail className="w-2.5 h-2.5" />
              {customer.email}
            </span>
          )}
          {customer.phone && (
            <span
              className="flex items-center gap-1 text-[10px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Phone className="w-2.5 h-2.5" />
              {customer.phone}
            </span>
          )}
        </div>
      </div>

      {/* Lead source */}
      <LeadBadge source={customer.leadSource} />

      {/* Credit tier */}
      <CreditBadge tier={customer.creditTier} />

      {/* Deals count */}
      <div className="text-center">
        <p
          className="text-sm font-bold"
          style={{ color: customer._count.salesDeals > 0 ? "var(--accent)" : "var(--text-tertiary)" }}
        >
          {customer._count.salesDeals}
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          deals
        </p>
      </div>

      {/* Pre-approved badge */}
      <div className="w-20 text-right">
        {customer.preApproved && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
          >
            <CheckCircle className="w-2.5 h-2.5" /> Pre-approved
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function CustomersPage() {
  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [q,            setQ]            = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [leadFilter,   setLeadFilter]   = useState("");
  const [creditFilter, setCreditFilter] = useState("");
  const [sort,         setSort]         = useState("createdAt_desc");
  const [panelOpen,    setPanelOpen]    = useState(false);

  /* Debounce */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  /* Fetch */
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debouncedQ)   p.set("q",          debouncedQ);
      if (leadFilter)   p.set("leadSource",  leadFilter);
      if (creditFilter) p.set("creditTier",  creditFilter);
      const [sortBy, sortDir] = sort.split("_");
      p.set("sortBy",   sortBy);
      p.set("sortDir",  sortDir);
      p.set("pageSize", "100");

      const res  = await fetch(`/api/crm/customers?${p}`);
      const data = await res.json();
      setCustomers(data.customers ?? []);
      setTotal(data.total         ?? 0);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, leadFilter, creditFilter, sort]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const handleCreated = (c: Customer) => {
    setCustomers(prev => [c, ...prev]);
    setTotal(prev => prev + 1);
  };

  const isFiltered = !!(debouncedQ || leadFilter || creditFilter);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <PageHeader
        title="Customers"
        breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Customers" }]}
        description={loading ? "Loading…" : `${total} customer${total !== 1 ? "s" : ""}`}
        actions={
          <button onClick={() => setPanelOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Customer
          </button>
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
            placeholder="Search name, email, phone…"
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

        {/* Lead source filter */}
        <div className="relative">
          <select
            value={leadFilter}
            onChange={e => setLeadFilter(e.target.value)}
            className="input-field pl-3 pr-8 appearance-none"
            style={{ width: 150 }}
          >
            <option value="">All sources</option>
            {LEAD_SOURCES.map(s => (
              <option key={s} value={s}>{LEAD_SOURCE_LABEL[s]}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        {/* Credit tier filter */}
        <div className="relative">
          <select
            value={creditFilter}
            onChange={e => setCreditFilter(e.target.value)}
            className="input-field pl-3 pr-8 appearance-none"
            style={{ width: 140 }}
          >
            <option value="">All tiers</option>
            {CREDIT_TIERS.map(t => (
              <option key={t} value={t}>{t}</option>
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
            style={{ width: 150 }}
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

        {/* Clear */}
        {isFiltered && (
          <button
            onClick={() => { setQ(""); setLeadFilter(""); setCreditFilter(""); }}
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

      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "rgba(6,182,212,0.08)",
              border:     "1px dashed rgba(6,182,212,0.3)",
            }}
          >
            <Users className="w-10 h-10" style={{ color: "#06B6D4" }} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {isFiltered ? "No customers match" : "No customers yet"}
          </h3>
          <p
            className="text-sm mb-8 max-w-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {isFiltered
              ? "Try clearing your filters."
              : "Add your first customer to start building your CRM."}
          </p>
          {!isFiltered ? (
            <button
              onClick={() => setPanelOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> New Customer
            </button>
          ) : (
            <button
              onClick={() => { setQ(""); setLeadFilter(""); setCreditFilter(""); }}
              className="btn-secondary"
            >
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

      ) : (
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
                gridTemplateColumns: "auto 1fr auto auto auto auto",
              }}
            >
              {["", "Customer", "Source", "Credit", "Deals", ""].map((h, i) => (
                <p
                  key={i}
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {h}
                </p>
              ))}
            </div>

            {customers.map(c => (
              <CustomerRow key={c.id} customer={c} />
            ))}
          </div>
        </div>
      )}

      {/* ── New customer panel ── */}
      <NewCustomerPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
