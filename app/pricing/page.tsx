import Link from "next/link";
import {
  CheckCircle2, Zap, Shield, BarChart3, Users, TrendingUp,
  ArrowRight, Activity, FileText, Building2, Bell, GitPullRequest,
} from "lucide-react";

function DehydLogo({ color = "#FFFFFF", height = 28 }: { color?: string; height?: number }) {
  const width = Math.round(height * 4.2);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" height={height} width={width} fill={color} aria-label="Dehy">
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />
      <text x="38" y="30" fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif" fontSize="26" fontWeight="600" letterSpacing="-0.5" fill={color}>Dehy</text>
    </svg>
  );
}

/* ─── Static data ─────────────────────────────────────────────────────────── */

const STATS = [
  { value: "$2.4B",  label: "Pipeline tracked" },
  { value: "12,000", label: "Deals closed" },
  { value: "98ms",   label: "Avg page load" },
  { value: "99.9%",  label: "Uptime SLA" },
];

const PLANS = [
  {
    id: "FREE", name: "Free", price: "$0", period: "/month",
    desc: "Individual traders & small desks getting started.",
    cta: "Start Free", ctaHref: "/auth/register?tier=FREE", highlight: false,
    features: ["3 users", "50 deals / month", "Deal pipeline (Kanban)", "Counterparty management", "Standard reports", "Community support"],
  },
  {
    id: "PRO", name: "Pro", price: "$499", period: "/month",
    desc: "Active desks that need full workflow automation.",
    cta: "Start 14-Day Trial", ctaHref: "/auth/register?tier=PRO", highlight: true,
    features: ["10 users", "Unlimited deals", "Kanban + table views", "Contract lifecycle", "Market data (EIA/NYMEX)", "P&L & exposure reports", "Email alerts", "Priority support", "Custom credit limits"],
  },
  {
    id: "ENTERPRISE", name: "Enterprise", price: "$999", period: "/month",
    desc: "Large operations with compliance & integration needs.",
    cta: "Contact Sales", ctaHref: "/auth/register?tier=ENTERPRISE", highlight: false,
    features: ["Unlimited users", "Unlimited deals & contracts", "All Pro features", "ETRM/CTRM integrations", "SSO / SAML", "Dedicated account manager", "99.9% SLA", "Audit logs", "Custom reporting", "Phone + Slack support"],
  },
];

const FEATURES = [
  { icon: GitPullRequest, title: "Deal Pipeline", desc: "Kanban and spreadsheet views from origination to settlement. Every stage, colour-coded and timestamped." },
  { icon: Shield,         title: "Credit Risk",   desc: "Set credit limits per counterparty. Get instant breach alerts. Visual utilisation bars that turn red at 85%." },
  { icon: TrendingUp,     title: "Market Data",   desc: "Live Henry Hub, WTI, Brent, ERCOT prices pulled from EIA. Zoomable sparkline charts, 90-day history." },
  { icon: FileText,       title: "Contracts",     desc: "ISDA, NAESB, PPA — track expiry dates, auto-flag contracts expiring in 30 days, full document store." },
  { icon: BarChart3,      title: "Reports",       desc: "Five auto-generated reports: pipeline summary, credit exposure, P&L, deal velocity, contract health." },
  { icon: Users,          title: "Team",          desc: "Assign deals, log calls/emails/meetings, mention teammates. Full audit trail per deal and counterparty." },
];

/* ─── Inline CRM mock-ups (pure HTML/CSS, no images needed) ──────────────── */

function DashboardMockup() {
  const metrics = [
    { label: "Active Deals",    value: "47",     sub: "+3 this week",   color: "#00D4AA" },
    { label: "Pipeline Value",  value: "$284M",  sub: "Weighted: $142M",color: "#3B82F6" },
    { label: "Credit Exposure", value: "$18.4M", sub: "of $45M limit",  color: "#F59E0B" },
    { label: "Contracts Due",   value: "6",      sub: "expiring 30 days",color: "#EF4444" },
  ];
  const deals = [
    { id: "DEHY-2026-0047", cp: "BP Energy",        stage: "FIRM BID",     val: "$12.4M",  dir: "SELL", color: "#3B82F6" },
    { id: "DEHY-2026-0046", cp: "Shell Trading",    stage: "CREDIT REVIEW",val: "$8.1M",   dir: "BUY",  color: "#F59E0B" },
    { id: "DEHY-2026-0045", cp: "Calpine Corp",     stage: "LEGAL REVIEW", val: "$22.0M",  dir: "SELL", color: "#8B5CF6" },
    { id: "DEHY-2026-0044", cp: "Constellation",    stage: "EXECUTED",     val: "$5.7M",   dir: "BUY",  color: "#00D4AA" },
  ];
  return (
    <div style={{ background: "#0A0A0A", borderRadius: 12, border: "1px solid #222", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Topbar */}
      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: "#555", fontFamily: "monospace" }}>DEHY — Dashboard</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Dashboard","Deals","Counterparties","Market"].map(t => (
            <span key={t} style={{ fontSize: 10, color: t === "Dashboard" ? "#00D4AA" : "#555", padding: "2px 8px", borderRadius: 4, background: t === "Dashboard" ? "rgba(0,212,170,0.1)" : "transparent" }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF", fontFamily: "monospace", marginBottom: 2 }}>{m.value}</div>
              <div style={{ fontSize: 9, color: m.color }}>{m.sub}</div>
            </div>
          ))}
        </div>
        {/* Deal table */}
        <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", borderBottom: "1px solid #1E1E1E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>RECENT DEALS</span>
            <span style={{ fontSize: 10, color: "#00D4AA" }}>View all →</span>
          </div>
          {deals.map((d, i) => (
            <div key={d.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px 90px 60px", gap: 8, padding: "9px 14px", borderBottom: i < deals.length-1 ? "1px solid #1A1A1A" : "none", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{d.id}</span>
              <span style={{ fontSize: 11, color: "#CCC" }}>{d.cp}</span>
              <span style={{ fontSize: 9, color: d.color, background: `${d.color}18`, padding: "2px 7px", borderRadius: 4, textAlign: "center" }}>{d.stage}</span>
              <span style={{ fontSize: 11, color: "#FFF", fontFamily: "monospace", textAlign: "right" }}>{d.val}</span>
              <span style={{ fontSize: 9, color: d.dir === "BUY" ? "#10B981" : "#3B82F6", textAlign: "center" }}>{d.dir}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanMockup() {
  const cols = [
    { label: "ORIGINATION", color: "#555",    count: 8,  deals: ["Exelon Corp · $4.2M","DTE Energy · $1.8M"] },
    { label: "FIRM BID",    color: "#3B82F6", count: 5,  deals: ["BP Energy · $12.4M","Chevron · $7.1M"] },
    { label: "CREDIT REVIEW",color:"#F59E0B", count: 3,  deals: ["Shell Trading · $8.1M"] },
    { label: "EXECUTED",    color: "#00D4AA", count: 12, deals: ["Constellation · $5.7M","Calpine · $22M"] },
  ];
  return (
    <div style={{ background: "#0A0A0A", borderRadius: 12, border: "1px solid #222", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: "#555", fontFamily: "monospace" }}>DEHY — Deal Pipeline (Kanban)</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, padding: 16 }}>
        {cols.map(col => (
          <div key={col.label} style={{ background: "#111", borderRadius: 8, border: "1px solid #1E1E1E", padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: col.color, fontWeight: 700, letterSpacing: "0.08em" }}>{col.label}</span>
              <span style={{ fontSize: 9, color: "#555", background: "#1A1A1A", padding: "1px 6px", borderRadius: 10 }}>{col.count}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {col.deals.map(d => (
                <div key={d} style={{ background: "#1A1A1A", borderRadius: 6, padding: "8px 10px", borderLeft: `2px solid ${col.color}` }}>
                  <div style={{ fontSize: 10, color: "#DDD", marginBottom: 3 }}>{d.split("·")[0].trim()}</div>
                  <div style={{ fontSize: 11, color: col.color, fontFamily: "monospace" }}>{d.split("·")[1]?.trim()}</div>
                </div>
              ))}
              <div style={{ border: "1px dashed #2A2A2A", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}>
                <span style={{ fontSize: 9, color: "#444" }}>+ Add deal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketMockup() {
  const prices = [
    { name: "Henry Hub",  val: "$3.24", chg: "+0.08", pct: "+2.5%", up: true  },
    { name: "WTI Crude",  val: "$71.40",chg: "-0.62", pct: "-0.9%", up: false },
    { name: "Brent Crude",val: "$75.18",chg: "+0.31", pct: "+0.4%", up: true  },
    { name: "ERCOT North",val: "$42.15",chg: "+3.20", pct: "+8.2%", up: true  },
    { name: "PJM West",   val: "$38.90",chg: "-1.10", pct: "-2.7%", up: false },
  ];
  // Mini sparkline bars
  const bars = [4,5,3,6,4,7,5,8,6,9,7,8];
  return (
    <div style={{ background: "#0A0A0A", borderRadius: 12, border: "1px solid #222", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: "#555", fontFamily: "monospace" }}>DEHY — Market Data</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {prices.slice(0,4).map(p => (
            <div key={p.name} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFF", fontFamily: "monospace" }}>{p.val}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: p.up ? "#10B981" : "#EF4444", fontFamily: "monospace" }}>{p.chg}</div>
                <div style={{ fontSize: 10, color: p.up ? "#10B981" : "#EF4444" }}>{p.pct}</div>
                {/* Sparkline */}
                <div style={{ display: "flex", gap: 2, marginTop: 4, alignItems: "flex-end", height: 16 }}>
                  {bars.map((h, i) => (
                    <div key={i} style={{ width: 3, height: h * 1.5, background: p.up ? "#10B981" : "#EF4444", opacity: 0.5 + (i/bars.length)*0.5, borderRadius: 1 }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>ERCOT North Hub (RT)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#FFF", fontFamily: "monospace" }}>{prices[3].val} <span style={{ fontSize: 11, color: "#10B981" }}>▲ {prices[3].pct}</span></div>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28 }}>
            {[5,4,6,5,8,7,9,8,10,9,11,12].map((h, i) => (
              <div key={i} style={{ width: 4, height: h * 2, background: `linear-gradient(to top, #00D4AA, #00D4AA88)`, borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsMockup() {
  const alerts = [
    { type: "CREDIT",   msg: "Shell Trading at 87% credit utilisation",  time: "2m ago",  color: "#EF4444", dot: "🔴" },
    { type: "CONTRACT", msg: "ISDA Master expires in 28 days — Calpine", time: "1h ago",  color: "#F59E0B", dot: "🟡" },
    { type: "PRICE",    msg: "Henry Hub up 8.2% — check open positions", time: "4h ago",  color: "#3B82F6", dot: "🔵" },
    { type: "DEAL",     msg: "DEHY-2026-0044 moved to EXECUTED stage",   time: "6h ago",  color: "#00D4AA", dot: "🟢" },
  ];
  return (
    <div style={{ background: "#0A0A0A", borderRadius: 12, border: "1px solid #222", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: "#555", fontFamily: "monospace" }}>DEHY — Alerts</span>
        </div>
        <span style={{ fontSize: 9, background: "#EF4444", color: "#FFF", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>3 urgent</span>
      </div>
      <div style={{ padding: "8px 0" }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: i < alerts.length-1 ? "1px solid #1A1A1A" : "none", alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, marginTop: 4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: a.color, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 2 }}>{a.type}</div>
              <div style={{ fontSize: 11, color: "#CCC" }}>{a.msg}</div>
            </div>
            <span style={{ fontSize: 9, color: "#444", flexShrink: 0 }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <div style={{ background: "#000000", color: "#FFFFFF", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Sticky Nav ─────────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid #1E1E1E", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <DehydLogo color="#FFFFFF" height={26} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/auth/login" style={{ fontSize: 13, color: "#888", padding: "6px 14px", textDecoration: "none", borderRadius: 6, transition: "color 120ms" }}>
            Sign In
          </Link>
          <Link href="/auth/register" style={{ fontSize: 13, fontWeight: 600, background: "#00D4AA", color: "#000", padding: "7px 18px", borderRadius: 6, textDecoration: "none" }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px 60px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 100, padding: "5px 14px", marginBottom: 28 }}>
          <Zap style={{ width: 12, height: 12, color: "#00D4AA" }} />
          <span style={{ fontSize: 11, color: "#00D4AA", fontWeight: 600, letterSpacing: "0.04em" }}>DEAL ENGINE FOR HYDROCARBON YIELD</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em" }}>
          Stop managing deals<br />
          <span style={{ color: "#00D4AA" }}>in spreadsheets.</span>
        </h1>
        <p style={{ fontSize: 18, color: "#888", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
          DEHY is the trading-desk CRM built for oil, gas, and power. Pipeline, credit risk,
          market data, and contracts — all in one place, loading in under 100ms.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" style={{ fontSize: 14, fontWeight: 700, background: "#00D4AA", color: "#000", padding: "12px 28px", borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Start Free — No Card Required <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link href="/auth/login" style={{ fontSize: 14, color: "#888", background: "#111", border: "1px solid #222", padding: "12px 28px", borderRadius: 8, textDecoration: "none" }}>
            View Live Demo →
          </Link>
        </div>
        <p style={{ fontSize: 11, color: "#444", marginTop: 14 }}>
          Demo credentials pre-filled · zayd@meridian.energy / dehy2026!
        </p>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111", padding: "28px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", padding: "0 24px", borderRight: i < STATS.length-1 ? "1px solid #1E1E1E" : "none" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "monospace", color: "#FFF", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard screenshot ────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#00D4AA", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>THE DASHBOARD</div>
          <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em" }}>
            Everything at a glance
          </h2>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            One screen shows your pipeline value, credit exposure, recent activity, and live market prices. No switching between tools.
          </p>
        </div>
        <DashboardMockup />
      </section>

      {/* ── Kanban screenshot ───────────────────────────────────────── */}
      <section style={{ padding: "0 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>DEAL PIPELINE</div>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em" }}>
              Kanban that traders actually use
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
              Drag deals through 9 stages from Origination to Settled. Every card shows counterparty, notional, direction, and weighted value. Switch to table view for spreadsheet-style bulk editing.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["9 deal stages with probability weighting", "BUY/SELL direction colour coding", "Filter by commodity, counterparty, or trader", "⌘K global search across all deals"].map(f => (
                <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#999" }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#00D4AA", flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <KanbanMockup />
        </div>
      </section>

      {/* ── Market Data ─────────────────────────────────────────────── */}
      <section style={{ background: "#080808", borderTop: "1px solid #111", borderBottom: "1px solid #111", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <MarketMockup />
          <div>
            <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>MARKET DATA</div>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em" }}>
              Live prices, inside your CRM
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
              Henry Hub, WTI, Brent, ERCOT, PJM — live prices pulled from EIA and refreshed every 5 minutes. Zoomable 90-day history charts. No separate Bloomberg terminal needed for daily price checks.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["EIA natural gas & crude data", "Power prices (ERCOT, PJM, CAISO)", "90-day price history with sparklines", "Price alerts when thresholds are hit"].map(f => (
                <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#999" }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#00D4AA", flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Alerts / Credit ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>CREDIT RISK & ALERTS</div>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em" }}>
              Know before it becomes a problem
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
              Set credit limits per counterparty. Real-time utilisation bars turn orange at 60%, red at 85%. Instant alerts for contract expirations, price moves, and stage changes — before your compliance team asks.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Per-counterparty credit limits & live exposure", "Contracts expiring in 30 days flagged automatically", "Price threshold alerts for open positions", "Full activity audit trail per deal"].map(f => (
                <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#999" }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#00D4AA", flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <AlertsMockup />
        </div>
      </section>

      {/* ── Feature grid ───────────────────────────────────────────── */}
      <section style={{ background: "#080808", borderTop: "1px solid #111", borderBottom: "1px solid #111", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Everything your desk needs
            </h2>
            <p style={{ fontSize: 14, color: "#666", maxWidth: 420, margin: "0 auto" }}>
              Built by people who understand energy trading. Not a generic CRM with an energy plugin.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: 12, padding: 24, display: "flex", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <f.icon style={{ width: 18, height: 18, color: "#00D4AA" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FFF", marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 14, color: "#666" }}>
            Start free. Upgrade when your desk grows. Cancel any time.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {PLANS.map(p => (
            <div key={p.id} style={{
              background: p.highlight ? "rgba(0,212,170,0.04)" : "#0D0D0D",
              border: `1px solid ${p.highlight ? "#00D4AA44" : "#1A1A1A"}`,
              borderRadius: 14, padding: 28, display: "flex", flexDirection: "column",
              boxShadow: p.highlight ? "0 0 40px rgba(0,212,170,0.08)" : "none",
              position: "relative", overflow: "hidden"
            }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #00D4AA, transparent)" }} />
              )}
              {p.highlight && (
                <div style={{ fontSize: 9, fontWeight: 800, color: "#00D4AA", letterSpacing: "0.12em", marginBottom: 12 }}>✦ MOST POPULAR</div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#FFF", marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "monospace", color: "#FFF" }}>{p.price}</span>
                  <span style={{ fontSize: 12, color: "#555", paddingBottom: 6 }}>{p.period}</span>
                </div>
                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, flex: 1, display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#888" }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: "#00D4AA", flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.ctaHref} style={{
                display: "block", textAlign: "center", padding: "11px 20px", borderRadius: 8,
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                background: p.highlight ? "#00D4AA" : "transparent",
                color: p.highlight ? "#000" : "#888",
                border: p.highlight ? "none" : "1px solid #2A2A2A",
                transition: "all 120ms"
              }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#444", marginTop: 24 }}>
          All plans include deal tracking, counterparty management, and basic reporting · No setup fees
        </p>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section style={{ background: "#080808", borderTop: "1px solid #111", padding: "80px 32px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Activity style={{ width: 24, height: 24, color: "#00D4AA" }} />
          </div>
          <h2 style={{ fontSize: "clamp(24px,3vw,38px)", fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em" }}>
            Ready to run a cleaner desk?
          </h2>
          <p style={{ fontSize: 15, color: "#666", marginBottom: 32, lineHeight: 1.7 }}>
            Join trading firms that use DEHY to close deals faster, manage credit risk in real time,
            and stop digging through spreadsheets at month-end.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/register" style={{ fontSize: 14, fontWeight: 700, background: "#00D4AA", color: "#000", padding: "13px 32px", borderRadius: 8, textDecoration: "none" }}>
              Start Free Today
            </Link>
            <Link href="/auth/login" style={{ fontSize: 14, color: "#666", background: "#111", border: "1px solid #222", padding: "13px 32px", borderRadius: 8, textDecoration: "none" }}>
              Try the Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #111", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <DehydLogo color="#333333" height={20} />
        <p style={{ fontSize: 11, color: "#333" }}>
          © 2026 DEHY — Deal Engine for Hydrocarbon Yield
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Terms","Privacy","Status"].map(l => (
            <span key={l} style={{ fontSize: 11, color: "#333" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
