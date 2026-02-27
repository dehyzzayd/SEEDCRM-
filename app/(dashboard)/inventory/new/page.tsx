"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Zap, Car, Loader2, CheckCircle2,
  Fuel, Gauge, Palette, DollarSign, MapPin,
  ChevronDown, ChevronUp, AlertTriangle, TrendingUp,
  Upload, X, ImageIcon,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */
type FormState = {
  vin: string; stockNumber: string;
  year: string; make: string; model: string; trim: string;
  bodyStyle: string; doors: string; drivetrain: string;
  exteriorColor: string; interiorColor: string;
  fuelType: string; transmission: string; engine: string;
  mileage: string; condition: string;
  askingPrice: string; costBasis: string; msrp: string;
  status: string; location: string; lotSection: string;
  description: string; features: string[];
  imageUrls: string[];
};

/* ── Dummy pre-filled vehicle ───────────────────────────── */
const DUMMY: FormState = {
  vin:           "1HGCM82633A004352",
  stockNumber:   "SA-4821",
  year:          "2022",
  make:          "Toyota",
  model:         "Camry",
  trim:          "XSE V6",
  bodyStyle:     "Sedan",
  doors:         "4",
  drivetrain:    "FWD",
  exteriorColor: "Midnight Black",
  interiorColor: "Black Leather",
  fuelType:      "GASOLINE",
  transmission:  "AUTOMATIC",
  engine:        "3.5L V6",
  mileage:       "28400",
  condition:     "USED",
  askingPrice:   "31900",
  costBasis:     "27200",
  msrp:          "34500",
  status:        "AVAILABLE",
  location:      "123 Main St, Austin TX",
  lotSection:    "Row B, Spot 12",
  description:   "One-owner, clean Carfax. Premium audio, panoramic moonroof, heated and ventilated front seats. Recent service at Toyota dealership.",
  imageUrls:     [],
  features:      ["Backup Camera","Bluetooth","Navigation","Sunroof/Moonroof","Heated Seats","Leather Seats","Apple CarPlay","Android Auto","Keyless Entry","Push-Button Start","Alloy Wheels","Blind Spot Monitor"],
};

const FEATURE_CHIPS = [
  "Backup Camera","Bluetooth","Navigation","Sunroof/Moonroof",
  "Heated Seats","Leather Seats","Apple CarPlay","Android Auto",
  "Remote Start","Blind Spot Monitor","Lane Assist",
  "Adaptive Cruise","Third Row","Tow Package","AWD/4WD",
  "Premium Audio","Keyless Entry","Push-Button Start","Alloy Wheels",
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  AVAILABLE:  { label: "Available",  color: "#00D4AA" },
  PENDING:    { label: "Pending",    color: "#F59E0B" },
  IN_SERVICE: { label: "In Service", color: "#EF4444" },
  WHOLESALE:  { label: "Wholesale",  color: "#94A3B8" },
};

const fmtPrice = (n: number | null) =>
  n != null ? "$" + n.toLocaleString() : "—";

/* ── Field ──────────────────────────────────────────────── */
function Field({
  label, name, value, onChange,
  type = "text", placeholder = "", required = false,
  options, span2 = false,
}: {
  label: string; name: keyof FormState; value: string;
  onChange: (name: keyof FormState, val: string) => void;
  type?: string; placeholder?: string; required?: boolean;
  options?: { label: string; value: string }[];
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--text-secondary)" }}>
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      {options ? (
        <select value={value} onChange={e => onChange(name, e.target.value)}
          className="input-field">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder} rows={3} className="input-field"
          style={{ height: "auto" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder} required={required} className="input-field" />
      )}
    </div>
  );
}

/* ── Media Upload ───────────────────────────────────────── */
function MediaUpload({ onChange }: { onChange?: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const updatePreviews = (next: string[]) => {
    setPreviews(next);
    onChange?.(next);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const pending = Array.from(files).filter(f => f.type.startsWith("image/"));
    const readers = pending.map(file => new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(urls => {
      setPreviews(prev => {
        const next = [...prev, ...urls];
        onChange?.(next);
        return next;
      });
    });
  };

  const remove = (i: number) => {
    const next = previews.filter((_, idx) => idx !== i);
    updatePreviews(next);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-default)"}`,
          borderRadius: "0.75rem",
          background: dragging ? "rgba(0,212,170,0.04)" : "var(--bg-hover)",
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "0.6rem",
          background: "rgba(0,212,170,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <Upload style={{ width: 20, height: 20, color: "var(--accent)" }} />
        </div>
        <p style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          Drop photos here or <span style={{ color: "var(--accent)" }}>browse</span>
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
          JPG, PNG, WEBP — up to 20 MB each · First photo becomes cover
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple
          style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* Thumbnails */}
      {previews.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          gap: 8, marginTop: 12,
        }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "4/3" }}>
              {/* Cover badge */}
              {i === 0 && (
                <div style={{
                  position: "absolute", top: 4, left: 4, zIndex: 2,
                  background: "var(--accent)", color: "#fff",
                  fontSize: 9, fontWeight: 700,
                  padding: "2px 6px", borderRadius: 4,
                  letterSpacing: "0.04em",
                }}>COVER</div>
              )}
              <img src={src} alt={`Photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" onClick={e => { e.stopPropagation(); remove(i); }}
                style={{
                  position: "absolute", top: 4, right: 4, zIndex: 2,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}>
                <X style={{ width: 10, height: 10, color: "#fff" }} />
              </button>
            </div>
          ))}
          {/* Add more tile */}
          <div onClick={() => inputRef.current?.click()}
            style={{
              aspectRatio: "4/3", borderRadius: 8,
              border: `2px dashed var(--border-default)`,
              background: "var(--bg-hover)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", gap: 4,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
          >
            <ImageIcon style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Add more</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────── */
function Section({
  title, icon: Icon, open, onToggle, children, accent = false,
}: {
  title: string; icon: React.ElementType; open: boolean;
  onToggle: () => void; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <div className="rounded-lg border overflow-hidden mb-3"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: accent ? "rgba(0,212,170,0.12)" : "var(--bg-hover)" }}>
            <Icon className="w-4 h-4"
              style={{ color: accent ? "var(--accent)" : "var(--text-tertiary)" }} />
          </div>
          <span className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}>
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp   className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />}
      </button>

      {open && (
        <div className="px-5 pt-5 pb-5 border-t"
          style={{ borderColor: "var(--border-default)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Live preview card ──────────────────────────────────── */
function LivePreviewCard({ form, coverPhoto }: { form: FormState; coverPhoto?: string }) {
  const ask  = parseFloat(form.askingPrice) || null;
  const cost = parseFloat(form.costBasis)   || null;
  const g    = ask && cost ? ask - cost : null;
  const title = [form.year, form.make, form.model, form.trim].filter(Boolean).join(" ") || "Vehicle Preview";
  const sm    = STATUS_META[form.status] ?? STATUS_META.AVAILABLE;

  return (
    <div className="rounded-lg border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
      {/* Photo area */}
      <div className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{ background: "var(--bg-hover)" }}>
        {coverPhoto ? (
          <img src={coverPhoto} alt="Cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <Car className="w-14 h-14" style={{ color: "var(--text-tertiary)", opacity: 0.2 }} />
            <div className="absolute inset-0 flex items-end justify-center pb-3">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {form.make ? `${form.year || ""} ${form.make}`.trim() : "Fill details to preview"}
              </p>
            </div>
          </>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded text-xs font-semibold"
            style={{ background: sm.color + "22", color: sm.color }}>
            {sm.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        {form.stockNumber && (
          <p className="text-xs font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>
            #{form.stockNumber}
          </p>
        )}
        <h3 className="font-semibold text-sm leading-snug mb-3"
          style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.mileage && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              <Gauge className="w-2.5 h-2.5" />
              {Number(form.mileage).toLocaleString()} mi
            </span>
          )}
          {form.fuelType && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              <Fuel className="w-2.5 h-2.5" />
              {form.fuelType.charAt(0) + form.fuelType.slice(1).toLowerCase()}
            </span>
          )}
          {form.exteriorColor && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              <Palette className="w-2.5 h-2.5" />{form.exteriorColor}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between pt-3 border-t"
          style={{ borderColor: "var(--border-default)" }}>
          <div>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {ask ? fmtPrice(ask) : "—"}
            </p>
            {cost && (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Cost {fmtPrice(cost)}
              </p>
            )}
          </div>
          {g !== null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: g >= 0 ? "rgba(0,212,170,0.10)" : "rgba(239,68,68,0.10)" }}>
              <TrendingUp className="w-3 h-3"
                style={{ color: g >= 0 ? "var(--accent)" : "#EF4444" }} />
              <span className="text-xs font-bold"
                style={{ color: g >= 0 ? "var(--accent)" : "#EF4444" }}>
                {fmtPrice(g)} gross
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Deal snapshot ──────────────────────────────────────── */
function DealSnapshot({ form }: { form: FormState }) {
  const ask    = parseFloat(form.askingPrice) || 0;
  const cost   = parseFloat(form.costBasis)   || 0;
  const margin = ask && cost ? Math.round(((ask - cost) / ask) * 100) : null;

  return (
    <div className="rounded-lg border p-4"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3"
        style={{ color: "var(--text-tertiary)" }}>
        Deal Snapshot
      </p>
      {[
        { label: "Asking", val: ask  ? fmtPrice(ask)  : "—", color: "var(--text-primary)" },
        { label: "Cost",   val: cost ? fmtPrice(cost) : "—", color: "var(--text-primary)" },
        {
          label: "Gross", val: ask && cost ? fmtPrice(ask - cost) : "—",
          color: ask - cost > 0 ? "var(--accent)" : ask - cost < 0 ? "#EF4444" : "var(--text-tertiary)",
        },
        {
          label: "Margin", val: margin !== null ? margin + "%" : "—",
          color: margin !== null && margin > 0 ? "var(--accent)" : "var(--text-tertiary)",
        },
      ].map(({ label, val, color }) => (
        <div key={label} className="flex justify-between py-1.5 border-b last:border-0"
          style={{ borderColor: "var(--border-default)" }}>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
          <span className="text-xs font-semibold" style={{ color }}>{val}</span>
        </div>
      ))}
      {margin !== null && margin < 8 && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded text-xs"
          style={{ background: "rgba(245,158,11,0.10)", color: "#F59E0B" }}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Margin below 8% — consider adjusting.
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function NewInventoryPage() {
  const router = useRouter();
  const [form,    setForm]    = useState<FormState>(DUMMY);
  const [open,    setOpen]    = useState({ id: true, specs: true, pricing: true, lot: false, desc: false });
  const [vinLoad, setVinLoad] = useState(false);
  const [vinMsg,  setVinMsg]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);

  // Keep form imageUrls in sync with uploaded photos
  const handlePhotosChange = (urls: string[]) => {
    setForm(p => ({ ...p, imageUrls: urls }));
    setCoverPhoto(urls[0]);
  };

  const set = (name: keyof FormState, val: string) =>
    setForm(p => ({ ...p, [name]: val }));
  const tog = (k: keyof typeof open) =>
    setOpen(p => ({ ...p, [k]: !p[k] }));
  const toggleFeature = (f: string) =>
    setForm(p => ({
      ...p,
      features: p.features.includes(f)
        ? p.features.filter(x => x !== f)
        : [...p.features, f],
    }));

  /* VIN decode */
  const decodeVin = async () => {
    if (form.vin.length !== 17) { setVinMsg("VIN must be exactly 17 characters"); return; }
    setVinLoad(true); setVinMsg("");
    try {
      const res  = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${form.vin}?format=json`
      );
      const data = await res.json();
      const get  = (v: string) =>
        data.Results?.find((r: any) => r.Variable === v)?.Value ?? "";

      const fuel   = get("Fuel Type - Primary").toUpperCase();
      const fuelMap: Record<string, string> = {
        GASOLINE: "GASOLINE", GAS: "GASOLINE", DIESEL: "DIESEL",
        HYBRID: "HYBRID", ELECTRIC: "ELECTRIC",
      };
      const tx   = get("Transmission Style").toUpperCase();
      const txMap: Record<string, string> = {
        MANUAL: "MANUAL", AUTOMATIC: "AUTOMATIC", CVT: "CVT",
      };

      setForm(p => ({
        ...p,
        year:         get("Model Year"),
        make:         get("Make"),
        model:        get("Model"),
        trim:         get("Trim"),
        bodyStyle:    get("Body Class"),
        doors:        get("Doors"),
        drivetrain:   get("Drive Type"),
        engine:       get("Displacement (L)")
          ? get("Displacement (L)") + "L " + get("Engine Configuration")
          : "",
        fuelType:     fuelMap[fuel]  || "GASOLINE",
        transmission: txMap[tx]      || "AUTOMATIC",
      }));
      setVinMsg("✓ VIN decoded — review and confirm below");
    } catch {
      setVinMsg("Could not decode VIN — fill in manually");
    } finally {
      setVinLoad(false);
    }
  };

  /* Submit */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockNumber:   form.stockNumber,
          vin:           form.vin           || null,
          year:          form.year          ? parseInt(form.year)          : null,
          make:          form.make          || null,
          model:         form.model         || null,
          trim:          form.trim          || null,
          bodyStyle:     form.bodyStyle     || null,
          drivetrain:    form.drivetrain    || null,
          exteriorColor: form.exteriorColor || null,
          interiorColor: form.interiorColor || null,
          fuelType:      form.fuelType,
          transmission:  form.transmission,
          engine:        form.engine        || null,
          mileage:       form.mileage       ? parseInt(form.mileage)       : null,
          condition:     form.condition,
          askingPrice:   form.askingPrice   ? parseFloat(form.askingPrice) : null,
          costBasis:     form.costBasis     ? parseFloat(form.costBasis)   : null,
          msrp:          form.msrp          ? parseFloat(form.msrp)        : null,
          status:        form.status,
          location:      form.location      || null,
          lotSection:    form.lotSection    || null,
          description:   form.description   || null,
          features:      form.features,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
      setSuccess(true);
      setTimeout(() => router.push("/inventory"), 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>

      {/* ── Sub-header ──────────────────────────────────── */}
      <div className="px-6 pt-8 pb-5 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3">
          <Link href="/inventory"
            className="p-1.5 rounded transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
              (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
              (e.currentTarget.style.background = "transparent")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}>
              Add Vehicle
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Showing sample vehicle — edit any field or decode a new VIN
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inventory" className="btn-secondary">Cancel</Link>
          <button
            type="submit" form="inv-form"
            disabled={saving || success}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {success
              ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              : saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : "Save Vehicle"}
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

        {/* LEFT */}
        <form id="inv-form" onSubmit={submit}>
          {error && (
            <div className="mb-4 px-4 py-3 rounded border text-sm"
              style={{ background: "rgba(239,68,68,0.08)", borderColor: "#EF4444", color: "#EF4444" }}>
              {error}
            </div>
          )}

          {/* VIN bar */}
          <div className="rounded-lg border px-5 py-4 mb-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}>
                  VIN <span style={{ color: "var(--text-tertiary)" }}>(17 characters)</span>
                </label>
                <input
                  value={form.vin}
                  onChange={e => set("vin", e.target.value.toUpperCase())}
                  placeholder="1HGCM82633A004352"
                  maxLength={17}
                  className="input-field font-mono"
                />
              </div>
              <button type="button" onClick={decodeVin}
                disabled={vinLoad || form.vin.length !== 17}
                className="btn-primary flex items-center gap-2 disabled:opacity-40">
                {vinLoad
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Decoding…</>
                  : <><Zap className="w-4 h-4" /> Decode VIN</>}
              </button>
            </div>
            {vinMsg && (
              <p className="text-xs mt-2"
                style={{ color: vinMsg.startsWith("✓") ? "var(--accent)" : "#F59E0B" }}>
                {vinMsg}
              </p>
            )}
          </div>

          {/* ── Photos section (standalone, always open) ─── */}
          <div className="rounded-lg border overflow-hidden mb-3"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
            {/* Section header */}
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "rgba(0,212,170,0.12)" }}>
                <ImageIcon className="w-4 h-4" style={{ color: "var(--accent)" }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Photos
              </span>
            </div>
            {/* Divider + upload area with top spacing */}
            <div className="border-t px-5 pt-5 pb-5"
              style={{ borderColor: "var(--border-default)" }}>
              <MediaUpload onChange={handlePhotosChange} />
            </div>
          </div>

          {/* Identity */}
          <Section title="Identity" icon={Car} open={open.id} onToggle={() => tog("id")} accent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Stock #"    name="stockNumber"   value={form.stockNumber}   onChange={set} required />
              <Field label="Year"       name="year"          value={form.year}           onChange={set} type="number" placeholder="2022" />
              <Field label="Make"       name="make"          value={form.make}           onChange={set} placeholder="Toyota" />
              <Field label="Model"      name="model"         value={form.model}          onChange={set} placeholder="Camry" />
              <Field label="Trim"       name="trim"          value={form.trim}           onChange={set} placeholder="XSE V6" />
              <Field label="Body Style" name="bodyStyle"     value={form.bodyStyle}      onChange={set} placeholder="Sedan" />
              <Field label="Condition"  name="condition"     value={form.condition}      onChange={set}
                options={[
                  { label: "New",               value: "NEW"     },
                  { label: "Used (Good)",        value: "USED"      },
                  { label: "Used (Excellent)",    value: "USED_EXCELLENT" },
                  { label: "Used (Fair)",         value: "USED_FAIR"      },
                  { label: "Certified Pre-Owned",value: "CPO"    },
                  { label: "Salvage",           value: "SALVAGE" },
                ]} />
              <Field label="Status"     name="status"        value={form.status}         onChange={set}
                options={Object.entries(STATUS_META).map(([v, m]) => ({ value: v, label: m.label }))} />
            </div>
          </Section>

          {/* Specs */}
          <Section title="Specs" icon={Gauge} open={open.specs} onToggle={() => tog("specs")}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Mileage"      name="mileage"      value={form.mileage}      onChange={set} type="number" placeholder="32000" />
              <Field label="Fuel Type"    name="fuelType"     value={form.fuelType}     onChange={set}
                options={["GASOLINE","DIESEL","HYBRID","ELECTRIC","OTHER"].map(v => ({
                  value: v, label: v.charAt(0) + v.slice(1).toLowerCase(),
                }))} />
              <Field label="Transmission" name="transmission" value={form.transmission} onChange={set}
                options={[
                  { label: "Automatic", value: "AUTOMATIC" },
                  { label: "Manual",    value: "MANUAL"    },
                  { label: "CVT",       value: "CVT"       },
                ]} />
              <Field label="Drivetrain"   name="drivetrain"   value={form.drivetrain}   onChange={set} placeholder="FWD" />
              <Field label="Engine"       name="engine"       value={form.engine}       onChange={set} placeholder="2.5L 4-cyl" />
              <Field label="Doors"        name="doors"        value={form.doors}        onChange={set} type="number" placeholder="4" />
              <Field label="Ext. Color"   name="exteriorColor" value={form.exteriorColor} onChange={set} placeholder="Pearl White" />
              <Field label="Int. Color"   name="interiorColor" value={form.interiorColor} onChange={set} placeholder="Black" />
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing" icon={DollarSign} open={open.pricing} onToggle={() => tog("pricing")} accent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Asking Price"  name="askingPrice" value={form.askingPrice} onChange={set} type="number" placeholder="28500" required />
              <Field label="Cost Basis"    name="costBasis"   value={form.costBasis}   onChange={set} type="number" placeholder="24000" />
              <Field label="MSRP (if new)" name="msrp"        value={form.msrp}        onChange={set} type="number" placeholder="31000" />
            </div>
          </Section>

          {/* Lot Info */}
          <Section title="Lot Info" icon={MapPin} open={open.lot} onToggle={() => tog("lot")}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Location"    name="location"   value={form.location}   onChange={set} placeholder="123 Main St, Austin TX" />
              <Field label="Lot Section" name="lotSection" value={form.lotSection} onChange={set} placeholder="Row B, Spot 12" />
            </div>
          </Section>

          {/* Description & Features */}
          <Section title="Description & Features" icon={Car} open={open.desc} onToggle={() => tog("desc")}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Optional notes or selling points…"
                  rows={3}
                  className="input-field"
                  style={{ height: "auto" }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}>
                  Features / Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_CHIPS.map(f => {
                    const on = form.features.includes(f);
                    return (
                      <button key={f} type="button" onClick={() => toggleFeature(f)}
                        className="px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                        style={{
                          background:  on ? "rgba(0,212,170,0.12)" : "var(--bg-hover)",
                          borderColor: on ? "var(--accent)"         : "var(--border-default)",
                          color:       on ? "var(--accent)"         : "var(--text-secondary)",
                        }}>
                        {on ? "✓ " : ""}{f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>
        </form>

        {/* RIGHT: live preview */}
        <div className="xl:sticky xl:top-20 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide px-1"
            style={{ color: "var(--text-tertiary)" }}>
            Live Preview
          </p>
          <LivePreviewCard form={form} coverPhoto={coverPhoto} />
          <DealSnapshot    form={form} />
        </div>
      </div>
    </div>
  );
}
