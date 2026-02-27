"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, Grid3X3, List, X,
  ChevronDown, MoreHorizontal, Car, Fuel,
  Gauge, Palette, DollarSign, FileText,
  Tag, Loader2, AlertTriangle, TrendingUp,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────── */
type Vehicle = {
  id: string; stockNumber: string; vin?: string;
  year?: number; make?: string; model?: string; trim?: string;
  mileage?: number; exteriorColor?: string; fuelType?: string;
  transmission?: string; condition?: string;
  askingPrice?: number; costBasis?: number;
  status: string; daysOnLot?: number;
  imageUrls?: string[];
  createdAt: string;
};

/* ── Constants ────────────────────────────────────────── */
const STATUS_OPTIONS = ["AVAILABLE", "PENDING", "SOLD", "WHOLESALE", "IN_SERVICE"];
const FUEL_OPTIONS   = ["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC", "OTHER"];
const SORT_OPTIONS   = [
  { label: "Newest first",      value: "createdAt_desc"    },
  { label: "Oldest first",      value: "createdAt_asc"     },
  { label: "Price: high → low", value: "askingPrice_desc"  },
  { label: "Price: low → high", value: "askingPrice_asc"   },
  { label: "Mileage: low → hi", value: "mileage_asc"       },
  { label: "Days on lot ↑",     value: "daysOnLot_desc"    },
];
const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE:  { label: "Available",  color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  PENDING:    { label: "Pending",    color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  SOLD:       { label: "Sold",       color: "#6366F1", bg: "rgba(99,102,241,0.12)"  },
  WHOLESALE:  { label: "Wholesale",  color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  IN_SERVICE: { label: "In Service", color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
};

const fmtPrice = (n?: number | null) => n != null ? "$" + n.toLocaleString() : "—";
const calcGross = (v: Vehicle) =>
  v.askingPrice != null && v.costBasis != null ? v.askingPrice - v.costBasis : null;

/* ── Shared small components ──────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.AVAILABLE;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

function AgingBadge({ days }: { days?: number }) {
  if (!days || days < 30) return null;
  const color = days >= 60 ? "#EF4444" : days >= 45 ? "#F59E0B" : "#F97316";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: color + "20", color }}>
      <AlertTriangle className="w-3 h-3" />{days}d
    </span>
  );
}

/* ── Action dropdown ──────────────────────────────────── */
function ActionMenu({ vehicle, onPrint }: {
  vehicle: Vehicle;
  onPrint: (v: Vehicle, t: "sticker" | "guide") => void;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Window sticker", icon: FileText,   fn: () => onPrint(vehicle, "sticker") },
    { label: "Buyer's guide",  icon: FileText,   fn: () => onPrint(vehicle, "guide")   },
    { label: "Price tag",      icon: Tag,        fn: () => {}                           },
    { label: "Edit vehicle",   icon: DollarSign, fn: () => {}                           },
  ];
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(p => !p)}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: "var(--text-tertiary)" }}>
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border shadow-xl overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
            {items.map(({ label, icon: Icon, fn }) => (
              <button key={label} onClick={() => { fn(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                style={{ color: "var(--text-primary)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Icon className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
                {label}
              </button>
            ))}
            <div className="border-t" style={{ borderColor: "var(--border-default)" }} />
            <button onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: "#EF4444" }}>
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Grid card ────────────────────────────────────────── */
function VehicleCard({ v, onPrint }: { v: Vehicle; onPrint: (v: Vehicle, t: "sticker" | "guide") => void }) {
  const g = calcGross(v);
  const title = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ") || "Unnamed Vehicle";
  return (
    <div className="card overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
      style={{ borderColor: "var(--border-default)" }}>
      {/* Photo area */}
      <div className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: "var(--bg-hover)" }}>
        {v.imageUrls && v.imageUrls.length > 0 ? (
          <img
            src={v.imageUrls[0]}
            alt={[v.year, v.make, v.model].filter(Boolean).join(" ")}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Car className="w-16 h-16" style={{ color: "var(--text-tertiary)", opacity: 0.18 }} />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5" style={{ zIndex: 1 }}>
          <StatusBadge status={v.status} />
          <AgingBadge days={v.daysOnLot} />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 1 }}>
          <ActionMenu vehicle={v} onPrint={onPrint} />
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>
          #{v.stockNumber}
        </p>
        <h3 className="font-semibold text-sm leading-snug mb-3"
          style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {/* Spec pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {v.mileage != null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              <Gauge className="w-2.5 h-2.5" />
              {v.mileage.toLocaleString()} mi
            </span>
          )}
          {v.fuelType && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              <Fuel className="w-2.5 h-2.5" />
              {v.fuelType.charAt(0) + v.fuelType.slice(1).toLowerCase()}
            </span>
          )}
          {v.exteriorColor && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              <Palette className="w-2.5 h-2.5" />
              {v.exteriorColor}
            </span>
          )}
        </div>
        {/* Price row */}
        <div className="flex items-end justify-between pt-3 border-t"
          style={{ borderColor: "var(--border-default)" }}>
          <div>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {fmtPrice(v.askingPrice)}
            </p>
            {v.costBasis != null && (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Cost {fmtPrice(v.costBasis)}
              </p>
            )}
          </div>
          {g !== null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ background: g >= 0 ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)" }}>
              <TrendingUp className="w-3 h-3" style={{ color: g >= 0 ? "#10B981" : "#EF4444" }} />
              <span className="text-xs font-semibold"
                style={{ color: g >= 0 ? "#10B981" : "#EF4444" }}>
                {fmtPrice(g)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── List row ─────────────────────────────────────────── */
function VehicleRow({ v, onPrint }: { v: Vehicle; onPrint: (v: Vehicle, t: "sticker" | "guide") => void }) {
  const g = calcGross(v);
  const title = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ") || "Unnamed Vehicle";
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 border-b transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
      style={{ borderColor: "var(--border-default)" }}>
      {/* Thumbnail */}
      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: "var(--bg-hover)" }}>
        {v.imageUrls && v.imageUrls.length > 0 ? (
          <img
            src={v.imageUrls[0]}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Car className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
        )}
      </div>
      {/* Title + badges */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
            #{v.stockNumber}
          </span>
          <StatusBadge status={v.status} />
          <AgingBadge days={v.daysOnLot} />
        </div>
        <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
      </div>
      {/* Specs */}
      <div className="hidden lg:flex flex-col items-end text-xs gap-0.5"
        style={{ color: "var(--text-secondary)" }}>
        {v.mileage != null && <span>{v.mileage.toLocaleString()} mi</span>}
        {v.fuelType && <span>{v.fuelType.charAt(0) + v.fuelType.slice(1).toLowerCase()}</span>}
      </div>
      {/* Days on lot */}
      <div className="hidden md:block text-xs text-right" style={{ color: "var(--text-tertiary)" }}>
        {v.daysOnLot != null ? <><span className="font-medium" style={{ color: "var(--text-secondary)" }}>{v.daysOnLot}</span> days</> : "—"}
      </div>
      {/* Price + gross */}
      <div className="text-right shrink-0">
        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
          {fmtPrice(v.askingPrice)}
        </p>
        {g !== null && (
          <p className="text-xs font-semibold"
            style={{ color: g >= 0 ? "#10B981" : "#EF4444" }}>
            {fmtPrice(g)} gross
          </p>
        )}
      </div>
      {/* Actions */}
      <ActionMenu vehicle={v} onPrint={onPrint} />
    </div>
  );
}

/* ── List header ──────────────────────────────────────── */
function ListHeader() {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-2.5 border-b"
      style={{ background: "var(--bg-hover)", borderColor: "var(--border-default)" }}>
      <div className="w-9" />
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Vehicle</p>
      <p className="hidden lg:block text-xs font-semibold uppercase tracking-wide text-right" style={{ color: "var(--text-tertiary)" }}>Specs</p>
      <p className="hidden md:block text-xs font-semibold uppercase tracking-wide text-right" style={{ color: "var(--text-tertiary)" }}>Lot days</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-right" style={{ color: "var(--text-tertiary)" }}>Price / Gross</p>
      <div className="w-7" />
    </div>
  );
}

/* ── Print helpers ────────────────────────────────────── */
function printWindowSticker(v: Vehicle) {
  const w = window.open("", "_blank", "width=620,height=820");
  if (!w) return;
  const title = [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";
  w.document.write(`<!DOCTYPE html><html><head><title>Window Sticker – ${v.stockNumber}</title>
  <style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px;color:#111}
    .brand{font-size:13px;color:#10B981;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
    h1{font-size:24px;margin:0 0 4px;font-weight:800}
    .sub{color:#555;font-size:13px;margin-bottom:20px}
    .price{font-size:36px;font-weight:800;color:#10B981;margin:12px 0 20px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    tr:nth-child(even) td{background:#f9fafb}
    td{padding:7px 10px;border-bottom:1px solid #e5e7eb}
    td:first-child{color:#6b7280;width:42%;font-weight:500}
    .divider{height:3px;background:linear-gradient(90deg,#10B981,#059669);border-radius:2px;margin:16px 0}
    .footer{margin-top:20px;font-size:10px;color:#9ca3af;text-align:center;line-height:1.5}
    @media print{body{padding:0}}
  </style></head><body>
  <div class="brand">Dealerseed</div>
  <h1>${title}</h1>
  <div class="sub">${v.trim || ""} &nbsp;•&nbsp; Stock #${v.stockNumber}</div>
  <div class="divider"></div>
  <div class="price">${fmtPrice(v.askingPrice)}</div>
  <table>
    <tr><td>VIN</td><td><strong>${v.vin || "—"}</strong></td></tr>
    <tr><td>Mileage</td><td>${v.mileage ? v.mileage.toLocaleString() + " miles" : "—"}</td></tr>
    <tr><td>Exterior Color</td><td>${v.exteriorColor || "—"}</td></tr>
    <tr><td>Fuel Type</td><td>${v.fuelType || "—"}</td></tr>
    <tr><td>Transmission</td><td>${v.transmission || "—"}</td></tr>
    <tr><td>Condition</td><td>${v.condition || "—"}</td></tr>
  </table>
  <div class="footer">Prices exclude tax, title, license &amp; dealer fees. All vehicles subject to prior sale.<br>Printed ${new Date().toLocaleDateString()}</div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script>
  </body></html>`);
  w.document.close();
}

function printBuyersGuide(v: Vehicle) {
  const w = window.open("", "_blank", "width=620,height=820");
  if (!w) return;
  const title = [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle";
  w.document.write(`<!DOCTYPE html><html><head><title>Buyers Guide – ${v.stockNumber}</title>
  <style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px;color:#111}
    h1{font-size:17px;font-weight:800;border-bottom:3px solid #000;padding-bottom:10px;text-transform:uppercase;letter-spacing:0.5px}
    .warn{background:#fffbeb;border:2px solid #f59e0b;border-radius:6px;padding:14px;margin:16px 0;font-size:13px;line-height:1.5}
    table{width:100%;border-collapse:collapse;font-size:13px;margin:14px 0}
    tr:nth-child(even) td{background:#f9fafb}
    td{padding:7px 10px;border:1px solid #e5e7eb}
    td:first-child{font-weight:600;width:38%;background:#f3f4f6}
    .sig{margin-top:28px;border-top:1px solid #000;padding-top:8px;font-size:11px;color:#6b7280}
    @media print{body{padding:0}}
  </style></head><body>
  <h1>Buyer's Guide — As Is — No Dealer Warranty</h1>
  <div class="warn"><strong>⚠ AS IS — NO DEALER WARRANTY</strong><br>The dealer does not provide a warranty for any repairs after sale. See your contract for complete details on the sale of this vehicle.</div>
  <table>
    <tr><td>Year / Make / Model</td><td>${title}</td></tr>
    <tr><td>Trim Level</td><td>${v.trim || "—"}</td></tr>
    <tr><td>Stock Number</td><td>${v.stockNumber}</td></tr>
    <tr><td>VIN</td><td>${v.vin || "—"}</td></tr>
    <tr><td>Odometer</td><td>${v.mileage ? v.mileage.toLocaleString() + " miles" : "—"}</td></tr>
    <tr><td>Selling Price</td><td><strong>${fmtPrice(v.askingPrice)}</strong></td></tr>
  </table>
  <p style="font-size:12px;line-height:1.6;color:#374151">Before purchasing, you are encouraged to have an independent mechanic inspect this vehicle. A pre-purchase inspection may reveal conditions not visible to the naked eye.</p>
  <div class="sig">Dealer Signature _________________________ &nbsp;&nbsp; Date ___________<br><br>Buyer Signature __________________________ &nbsp;&nbsp; Date ___________</div>
  <p style="font-size:10px;color:#9ca3af;margin-top:16px">FTC Used Car Rule Compliant • Printed ${new Date().toLocaleDateString()}</p>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script>
  </body></html>`);
  w.document.close();
}

/* ── Main page ────────────────────────────────────────── */
export default function InventoryPage() {
  const router = useRouter();

  const [vehicles,     setVehicles]     = useState<Vehicle[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [q,            setQ]            = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fuelFilter,   setFuelFilter]   = useState("");
  const [sort,         setSort]         = useState("createdAt_desc");
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");
  const [total,        setTotal]        = useState(0);
  const [showFilters,  setShowFilters]  = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debouncedQ)   p.set("search", debouncedQ);
      if (statusFilter) p.set("status", statusFilter);
      if (fuelFilter)   p.set("fuel",   fuelFilter);
      p.set("sort",     sort);
      p.set("pageSize", "100");
      const res  = await fetch(`/api/inventory?${p}`);
      const data = await res.json();
      setVehicles(data.vehicles ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, statusFilter, fuelFilter, sort]);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const isFiltered = !!(debouncedQ || statusFilter || fuelFilter);
  const available  = vehicles.filter(v => v.status === "AVAILABLE").length;
  const aging45    = vehicles.filter(v => (v.daysOnLot ?? 0) >= 45).length;
  const totalAsk   = vehicles.reduce((s, v) => s + (v.askingPrice ?? 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>

      {/* ── Top bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
        <div className="px-6 pt-5 pb-4">
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Inventory
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {loading ? "Loading…" : `${total} vehicle${total !== 1 ? "s" : ""} on lot`}
              </p>
            </div>
            <button
              onClick={() => router.push("/inventory/new")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          {/* KPI chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "Total",     val: total,     color: "var(--text-primary)"                              },
              { label: "Available", val: available, color: "#10B981"                                          },
              { label: "Aging 45+", val: aging45,   color: aging45  > 0 ? "#F59E0B" : "var(--text-tertiary)"    },
              { label: "Lot value", val: totalAsk ? "$" + (totalAsk / 1000).toFixed(0) + "k" : "—",
                                                    color: "var(--text-primary)"                              },
            ].map(({ label, val, color }) => (
              <div key={label}
                className="px-3 py-1.5 rounded-xl border text-xs"
                style={{ background: "var(--bg-hover)", borderColor: "var(--border-default)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>{label}: </span>
                <span className="font-semibold" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Search + controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text-tertiary)" }} />
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search stock #, VIN, make, model…"
                className="w-full pl-9 pr-9 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
              {q && (
                <button onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-tertiary)" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters(p => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors"
              style={{
                borderColor: "var(--border-default)",
                color:       "var(--text-secondary)",
                background:  showFilters ? "var(--bg-hover)" : "transparent",
              }}>
              <Filter className="w-3.5 h-3.5" />
              Filters
              {(statusFilter || fuelFilter) && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--text-tertiary)" }} />
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
              {(["grid", "list"] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  className="p-2 transition-colors"
                  style={{
                    background: viewMode === m ? "var(--accent)" : "var(--bg-panel)",
                    color:      viewMode === m ? "#fff"          : "var(--text-tertiary)",
                  }}>
                  {m === "grid"
                    ? <Grid3X3 className="w-4 h-4" />
                    : <List    className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: "var(--border-default)" }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border text-sm focus:outline-none"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                ))}
              </select>
              <select value={fuelFilter} onChange={e => setFuelFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border text-sm focus:outline-none"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                <option value="">All fuel types</option>
                {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}
              </select>
              {(statusFilter || fuelFilter) && (
                <button onClick={() => { setStatusFilter(""); setFuelFilter(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm"
                  style={{ borderColor: "#EF4444", color: "#EF4444" }}>
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
          </div>

        ) : vehicles.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px dashed rgba(16,185,129,0.3)" }}>
              <Car className="w-10 h-10" style={{ color: "#10B981" }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {isFiltered ? "No vehicles match" : "Your lot is empty"}
            </h3>
            <p className="text-sm mb-8 max-w-xs" style={{ color: "var(--text-secondary)" }}>
              {isFiltered
                ? "Try clearing your filters or searching for something else."
                : "Add your first vehicle. Decode specs instantly from VIN — no manual entry needed."}
            </p>
            {!isFiltered ? (
              <button onClick={() => router.push("/inventory/new")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: "var(--accent)", color: "#fff" }}>
                <Plus className="w-4 h-4" /> Add First Vehicle
              </button>
            ) : (
              <button onClick={() => { setQ(""); setStatusFilter(""); setFuelFilter(""); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border hover:bg-[var(--bg-hover)] transition-colors"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                <X className="w-4 h-4" /> Clear all filters
              </button>
            )}
          </div>

        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map(v => (
              <VehicleCard key={v.id} v={v} onPrint={printWindowSticker} />
            ))}
          </div>

        ) : (
          <div className="card overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
            <ListHeader />
            {vehicles.map(v => (
              <VehicleRow key={v.id} v={v} onPrint={printWindowSticker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
