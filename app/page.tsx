"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import {
  Zap, TrendingUp, Shield, BarChart3, FileText, Users, Bell,
  ArrowRight, CheckCircle2, Star, ChevronRight, Sun, Moon,
} from "lucide-react";

/* ── Logo ─────────────────────────────────────────────────────────────────── */
function DehydLogo({ color = "#FFFFFF", height = 32 }: { color?: string; height?: number }) {
  const width = Math.round(height * 4.2);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" height={height} width={width} fill={color} aria-label="Dehy">
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />
      <text x="38" y="30" fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif" fontSize="26" fontWeight="600" letterSpacing="-0.5" fill={color}>Dehy</text>
    </svg>
  );
}

/* ── Theme tokens — reactive to light/dark ───────────────────────────────── */
function useTokens(isLight: boolean) {
  return {
    bg:          isLight ? "#F4F7FA"              : "#000000",
    panel:       isLight ? "#FFFFFF"              : "#0A0A0A",
    card:        isLight ? "#FFFFFF"              : "#111111",
    border:      isLight ? "rgba(0,0,0,0.08)"     : "rgba(255,255,255,0.07)",
    accent:      isLight ? "#009E7F"              : "#00D4AA",
    accentDim:   isLight ? "rgba(0,158,127,0.08)" : "rgba(0,212,170,0.12)",
    accentBord:  isLight ? "rgba(0,158,127,0.20)" : "rgba(0,212,170,0.20)",
    white:       isLight ? "#1A2333"              : "#FFFFFF",
    muted:       isLight ? "#445268"              : "rgba(255,255,255,0.50)",
    faint:       isLight ? "rgba(0,0,0,0.30)"     : "rgba(255,255,255,0.22)",
    gridLine:    isLight ? "rgba(0,158,127,0.06)" : "rgba(0,212,170,0.04)",
    orbColor:    isLight ? "rgba(0,158,127,0.05)" : "rgba(0,212,170,0.06)",
    navBg:       isLight ? "rgba(255,255,255,0.92)": "rgba(0,0,0,0.85)",
    shadow:      isLight ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
    cardShadow:  isLight ? "0 2px 12px rgba(0,0,0,0.06)" : "0 24px 80px rgba(0,0,0,0.8)",
  };
}

/* ── Background (grid + orb) ─────────────────────────────────────────────── */
function PageBackground({ T }: { T: ReturnType<typeof useTokens> }) {
  return (
    <>
      {/* Grid */}
      <div style={{
        position:        "fixed",
        inset:           0,
        zIndex:          0,
        pointerEvents:   "none",
        backgroundImage: `linear-gradient(${T.gridLine} 1px, transparent 1px),
                          linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px)`,
        backgroundSize:  "40px 40px",
        transition:      "opacity 0.3s ease",
      }} />
      {/* Top orb */}
      <div style={{
        position:     "fixed",
        top:          "-10%",
        left:         "50%",
        transform:    "translateX(-50%)",
        width:        800,
        height:       600,
        borderRadius: "50%",
        background:   `radial-gradient(circle, ${T.orbColor} 0%, transparent 70%)`,
        pointerEvents:"none",
        zIndex:       0,
      }} />
    </>
  );
}

/* ── Dashboard Mock ──────────────────────────────────────────────────────── */
function DashboardMock({ T }: { T: ReturnType<typeof useTokens> }) {
  const deals = [
    { id: "D-2847", name: "Shell Gas Purchase Q2",  qty: "50,000 MMBtu", price: "$3.24", dir: "BUY",  status: "EXECUTING", pnl: "+$12,400", pnlCol: "#22C55E" },
    { id: "D-2848", name: "Meridian → BP LNG",      qty: "25,000 MMBtu", price: "$3.18", dir: "SELL", status: "PENDING",   pnl: "+$4,200",  pnlCol: "#22C55E" },
    { id: "D-2849", name: "ERCOT Power Swap Jul",   qty: "200 MWh",      price: "$42.80",dir: "SELL", status: "CONFIRMED", pnl: "-$1,800",  pnlCol: "#EF4444" },
    { id: "D-2850", name: "WTI Crude Spot Jul",     qty: "1,000 bbl",    price: "$83.40",dir: "BUY",  status: "DRAFT",     pnl: "$0",       pnlCol: T.faint   },
    { id: "D-2851", name: "Henry Hub Sep Futures",  qty: "30,000 MMBtu", price: "$3.41", dir: "BUY",  status: "CONFIRMED", pnl: "+$8,700",  pnlCol: "#22C55E" },
  ];
  const dirColor  = (d: string) => d === "BUY" ? "#22C55E" : "#EF4444";
  const statusBg  = (s: string) => {
    if (s === "EXECUTING") return `${T.accentDim}`;
    if (s === "CONFIRMED") return "rgba(34,197,94,0.10)";
    if (s === "PENDING")   return "rgba(245,158,11,0.10)";
    return "rgba(128,128,128,0.08)";
  };
  const statusCol = (s: string) => {
    if (s === "EXECUTING") return T.accent;
    if (s === "CONFIRMED") return "#22C55E";
    if (s === "PENDING")   return "#F59E0B";
    return T.faint;
  };
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: "hidden",
      boxShadow: T.cardShadow,
    }}>
      <div style={{ background: T.card, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>)}
        </div>
        <span style={{ fontSize: 11, color: T.faint, fontFamily: "monospace", marginLeft: 8 }}>Dehy — Deal Pipeline</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>● LIVE</span>
          <span style={{ fontSize: 11, color: T.faint }}>Meridian Energy Trading</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, borderBottom: `1px solid ${T.border}` }}>
        {[
          { l: "Total Pipeline",  v: "$284.5M",    sub: "+12.4% MTD",      vc: T.accent    },
          { l: "Open Exposure",   v: "$18.4M",     sub: "4 counterparties", vc: "#F59E0B"  },
          { l: "HH Spot",         v: "$3.24/MMBtu",sub: "▲ 0.08 today",    vc: "#3B82F6"  },
          { l: "MTD P&L",         v: "+$23,500",   sub: "47 closed deals",  vc: "#22C55E"  },
        ].map(m => (
          <div key={m.l} style={{ padding: "16px 20px", background: T.panel, borderRight: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.faint, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: m.vc, fontFamily: "monospace", marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: T.faint }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 60px 100px 90px", padding: "8px 20px", borderBottom: `1px solid ${T.border}` }}>
          {["ID","Deal Name","Volume","Price","Dir","Status","P&L"].map(h => (
            <div key={h} style={{ fontSize: 10, color: T.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>
        {deals.map((d, i) => (
          <div key={d.id} style={{
            display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 60px 100px 90px",
            padding: "11px 20px", alignItems: "center",
            background: i % 2 === 0 ? "transparent" : (T.panel === "#FFFFFF" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.015)"),
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 11, color: T.faint, fontFamily: "monospace" }}>{d.id}</div>
            <div style={{ fontSize: 12, color: T.white, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>{d.qty}</div>
            <div style={{ fontSize: 12, color: T.white, fontFamily: "monospace", fontWeight: 600 }}>{d.price}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: dirColor(d.dir), background: `${dirColor(d.dir)}18`, padding: "2px 8px", borderRadius: 4, display: "inline-block" }}>{d.dir}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: statusCol(d.status), background: statusBg(d.status), padding: "3px 8px", borderRadius: 4, display: "inline-block" }}>{d.status}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: d.pnlCol, fontFamily: "monospace" }}>{d.pnl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Kanban Mock ─────────────────────────────────────────────────────────── */
function KanbanMock({ T }: { T: ReturnType<typeof useTokens> }) {
  const cols = [
    { label: "Prospecting", color: T.faint,   cards: [{ name: "Vitol LNG Contract", val: "$4.2M", co: "Vitol" }, { name: "ExxonMobil NGL", val: "$1.8M", co: "ExxonMobil" }] },
    { label: "Negotiating", color: "#F59E0B", cards: [{ name: "Shell Gas Q3", val: "$6.1M", co: "Shell" }, { name: "BP Crude Spot", val: "$12.4M", co: "BP" }, { name: "Trafigura NGL", val: "$3.3M", co: "Trafigura" }] },
    { label: "Confirmed",   color: "#3B82F6", cards: [{ name: "TotalEnergies Power", val: "$8.8M", co: "TotalEnergies" }, { name: "Cargill Commodities", val: "$2.2M", co: "Cargill" }] },
    { label: "Executing",   color: T.accent,  cards: [{ name: "Meridian → Cheniere", val: "$22.5M", co: "Cheniere" }] },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {cols.map(col => (
        <div key={col.label}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{col.label}</span>
            <span style={{ fontSize: 10, color: T.faint, marginLeft: "auto" }}>{col.cards.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {col.cards.map(c => (
              <div key={c.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", boxShadow: T.shadow }}>
                <div style={{ fontSize: 11, color: T.white, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>{c.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: T.faint }}>{c.co}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: "monospace" }}>{c.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Market Mock ─────────────────────────────────────────────────────────── */
function MarketMock({ T }: { T: ReturnType<typeof useTokens> }) {
  const prices = [
    { name: "Henry Hub",  val: "$3.24", chg: "+0.08", pct: "+2.5%",  pos: true  },
    { name: "WTI Crude",  val: "$83.40",chg: "-0.62", pct: "-0.7%",  pos: false },
    { name: "Brent",      val: "$87.15",chg: "+0.33", pct: "+0.4%",  pos: true  },
    { name: "ERCOT (RT)", val: "$42.80",chg: "+5.20", pct: "+13.8%", pos: true  },
    { name: "TTF Gas",    val: "€28.40",chg: "-0.90", pct: "-3.1%",  pos: false },
    { name: "NBP Gas",    val: "70p",   chg: "+1.20", pct: "+1.7%",  pos: true  },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
      {prices.map(p => (
        <div key={p.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", boxShadow: T.shadow }}>
          <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.name}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "monospace", margin: "6px 0 2px" }}>{p.val}</div>
          <div style={{ fontSize: 12, color: p.pos ? "#22C55E" : "#EF4444", fontWeight: 600 }}>
            {p.pos ? "▲" : "▼"} {p.chg} ({p.pct})
          </div>
          <div style={{ height: 28, display: "flex", alignItems: "flex-end", gap: 2, marginTop: 8 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const seed = (p.val.charCodeAt(1) + i * 7) % 100;
              const h    = 25 + Math.abs(Math.sin(i * 0.9 + seed * 0.1) * 55);
              return (
                <div key={i} style={{
                  flex: 1, height: `${Math.max(15, Math.min(100, h))}%`,
                  background: p.pos ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                  borderRadius: 1,
                }}/>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Plans ───────────────────────────────────────────────────────────────── */
const PLANS = [
  { name: "Free",       price: "$0",   period: "/month", desc: "Individual traders and small desks",      cta: "Start Free",       href: "/auth/register?tier=FREE", highlight: false,
    features: ["Up to 3 users","50 deals / month","Basic pipeline view","Market price feed","Email support"] },
  { name: "Pro",        price: "$499", period: "/month", desc: "Growing trading firms and teams",          cta: "Start Pro Trial",  href: "/auth/register?tier=PRO",  highlight: true,
    features: ["Up to 20 users","Unlimited deals","Kanban + table views","Live credit exposure","Custom reports & export","Stripe billing portal","Priority support"] },
  { name: "Enterprise", price: "$999", period: "/month", desc: "Large organisations with custom needs",    cta: "Contact Sales",    href: "mailto:sales@dehy.io",     highlight: false,
    features: ["Unlimited users","All Pro features","API access","Custom integrations","SLA & dedicated support","On-prem option"] },
];

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { theme, toggleTheme } = useAppStore();
  const isLight  = theme === "light";
  const T        = useTokens(isLight);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const navLinks = [
    { label: "Features",  href: "#features"  },
    { label: "Dashboard", href: "#dashboard" },
    { label: "Pricing",   href: "#pricing"   },
  ];

  return (
    <div
      data-theme={theme}
      style={{
        background: T.bg, color: T.white,
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh", position: "relative",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <PageBackground T={T} />

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 60,
        borderBottom: `1px solid ${T.border}`,
        background: T.navBg,
        backdropFilter: "blur(16px)",
        transition: "background 0.2s ease",
      }}>
        <DehydLogo color={T.white} height={28} />
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navLinks.map(n => (
            <a key={n.href} href={n.href} style={{ fontSize: 13, color: T.muted, textDecoration: "none", transition: "color 0.15s" }}
               onMouseEnter={e => (e.currentTarget.style.color = T.white)}
               onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>
              {n.label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", transition: "all 0.2s",
          }}>
            {isLight
              ? <Moon style={{ width: 15, height: 15, color: T.muted }} />
              : <Sun  style={{ width: 15, height: 15, color: T.muted }} />
            }
          </button>
          <Link href="/auth/login" style={{
            fontSize: 13, color: T.muted, textDecoration: "none",
            padding: "7px 16px", border: `1px solid ${T.border}`, borderRadius: 7,
            transition: "all 0.15s",
          }}>
            Sign in
          </Link>
          <Link href="/auth/register" style={{
            fontSize: 13, color: isLight ? "#FFFFFF" : "#000",
            fontWeight: 600, textDecoration: "none",
            padding: "7px 16px", background: T.accent, borderRadius: 7,
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 40px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 99,
          background: T.accentDim, border: `1px solid ${T.accentBord}`,
          fontSize: 12, color: T.accent, fontWeight: 600, marginBottom: 28,
        }}>
          <Zap style={{ width: 12, height: 12 }} />
          Built for energy &amp; commodity traders
        </div>

        <h1 style={{
          fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-0.03em", margin: "0 auto 24px", maxWidth: 900,
          color: T.white,
        }}>
          The deal management platform<br />
          <span style={{ color: T.accent }}>built for energy traders.</span>
        </h1>

        <p style={{ fontSize: "clamp(15px,1.8vw,19px)", color: T.muted, maxWidth: 620, margin: "0 auto 44px", lineHeight: 1.7 }}>
          Dehy replaces scattered spreadsheets with a unified CRM — manage deals, track
          credit exposure, monitor live commodity prices, and close faster.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", background: T.accent,
            color: isLight ? "#FFFFFF" : "#000",
            fontWeight: 700, fontSize: 15, borderRadius: 9, textDecoration: "none",
          }}>
            Start free — no credit card <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link href="/auth/login" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", border: `1px solid ${T.border}`, color: T.white,
            fontWeight: 500, fontSize: 15, borderRadius: 9, textDecoration: "none",
          }}>
            View live demo
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "center", marginTop: 56, flexWrap: "wrap" }}>
          {[{ v: "$2.4B+", l: "pipeline managed" }, { v: "12,000+", l: "deals tracked" }, { v: "98 ms", l: "avg response" }, { v: "99.9%", l: "uptime" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.white, fontFamily: "monospace" }}>{s.v}</div>
              <div style={{ fontSize: 12, color: T.faint, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard Screenshot ─────────────────────────────────── */}
      <section id="dashboard" style={{ padding: "40px 40px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12, color: T.white }}>
              Your entire trading desk, in one view.
            </h2>
            <p style={{ fontSize: 16, color: T.muted, maxWidth: 540, margin: "0 auto" }}>
              Real-time deal pipeline, P&L tracking, and live market prices — all on one screen.
            </p>
          </div>
          <DashboardMock T={T} />
        </div>
      </section>

      {/* ── Kanban Section ──────────────────────────────────────── */}
      <section style={{ padding: "80px 40px", background: T.panel, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 99, background: T.accentDim, border: `1px solid ${T.accentBord}`, fontSize: 11, color: T.accent, fontWeight: 600, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Pipeline Management
            </div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.2, color: T.white }}>
              Kanban or table —<br/>your workflow, your way.
            </h2>
            <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.75, marginBottom: 28, maxWidth: 420 }}>
              Move deals through Prospecting → Negotiating → Confirmed → Executing with drag-and-drop simplicity.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Drag-and-drop Kanban board","Deal value & counterparty visible at a glance","Filter by commodity, direction, or status","One-click CSV / Excel export"].map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: T.muted }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: T.accent, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <KanbanMock T={T} />
        </div>
      </section>

      {/* ── Market Data Section ──────────────────────────────────── */}
      <section style={{ padding: "80px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <MarketMock T={T} />
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 99, background: T.accentDim, border: `1px solid ${T.accentBord}`, fontSize: 11, color: T.accent, fontWeight: 600, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Live Market Data
            </div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.2, color: T.white }}>
              Henry Hub, WTI, Brent,<br/>ERCOT — all live.
            </h2>
            <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.75, marginBottom: 28, maxWidth: 420 }}>
              Powered by the EIA API, Dehy surfaces real-time commodity prices with sparklines and day-over-day changes.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {["HH, WTI, Brent, NBP, TTF & ERCOT","Day-change % and sparkline trend","Automatic refresh every 60 seconds","Historical price context"].map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: T.muted }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: T.accent, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 40px", background: T.panel, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12, color: T.white }}>
              Everything a trading desk needs.
            </h2>
            <p style={{ fontSize: 16, color: T.muted, maxWidth: 540, margin: "0 auto" }}>
              From first contact to final settlement — Dehy handles the full deal lifecycle.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { icon: BarChart3,  title: "Deal Pipeline",     desc: "Track every deal from prospecting to settlement. Kanban & table views with custom filters." },
              { icon: Shield,     title: "Credit Risk",       desc: "Live exposure per counterparty. Credit rating badges, limit monitoring, and alerts." },
              { icon: TrendingUp, title: "Market Data",       desc: "HH, WTI, Brent, ERCOT, TTF prices via EIA API — live sparklines, day-change alerts." },
              { icon: FileText,   title: "Contracts",         desc: "Store and version contracts linked to deals. Track execution and settlement status." },
              { icon: BarChart3,  title: "Reports & Export",  desc: "MTD P&L, pipeline summary, exposure reports. Export to CSV / Excel in one click." },
              { icon: Users,      title: "Team & Roles",      desc: "Multi-tenant orgs with role-based access. Admin, trader, viewer permission levels." },
              { icon: Bell,       title: "Smart Alerts",      desc: "Price threshold, credit limit, and deal-stage alerts. Delivered in-app and by email." },
              { icon: TrendingUp, title: "Counterparty CRM",  desc: "Full counterparty profiles: contact info, credit rating, deal history, and documents." },
              { icon: Zap,        title: "Fast & Edge-ready", desc: "Sub-100ms API responses. Built on Postgres + Prisma + Next.js 14 App Router." },
            ].map(f => (
              <div key={f.title} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px", boxShadow: T.shadow }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: T.accentDim, border: `1px solid ${T.accentBord}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon style={{ width: 18, height: 18, color: T.accent }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.white, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12, color: T.white }}>
              Simple, transparent pricing.
            </h2>
            <p style={{ fontSize: 16, color: T.muted, maxWidth: 480, margin: "0 auto" }}>Start free. Upgrade when your desk grows.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? T.accentDim : T.card,
                border: `1px solid ${plan.highlight ? T.accent : T.border}`,
                borderRadius: 14, padding: "32px 28px", position: "relative",
                boxShadow: plan.highlight ? `0 0 40px ${T.accentDim}` : T.shadow,
              }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: T.accent, color: isLight ? "#fff" : "#000", fontWeight: 700, fontSize: 11, padding: "4px 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>
                    <Star style={{ width: 10, height: 10 }} /> Most popular
                  </div>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: plan.highlight ? T.accent : T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{plan.name}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "12px 0 6px" }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: T.white, fontFamily: "monospace" }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: T.faint }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>{plan.desc}</p>
                <Link href={plan.href} style={{ display: "block", textAlign: "center", padding: "11px 20px", background: plan.highlight ? T.accent : "transparent", border: `1px solid ${plan.highlight ? T.accent : T.border}`, color: plan.highlight ? (isLight ? "#fff" : "#000") : T.white, fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: "none", marginBottom: 24 }}>
                  {plan.cta}
                </Link>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: T.muted }}>
                      <CheckCircle2 style={{ width: 15, height: 15, color: plan.highlight ? T.accent : T.faint, flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section style={{ padding: "80px 40px", background: T.panel, borderTop: `1px solid ${T.border}`, textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <DehydLogo color={T.white} height={36} />
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.025em", margin: "24px 0 14px", color: T.white }}>
            Ready to close more deals?
          </h2>
          <p style={{ fontSize: 16, color: T.muted, marginBottom: 36, lineHeight: 1.7 }}>
            Start with a free account — no credit card required. Upgrade any time as your desk grows.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", background: T.accent, color: isLight ? "#fff" : "#000", fontWeight: 700, fontSize: 15, borderRadius: 9, textDecoration: "none" }}>
              Get started free <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", border: `1px solid ${T.border}`, color: T.white, fontWeight: 500, fontSize: 15, borderRadius: 9, textDecoration: "none" }}>
              Sign in <ChevronRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ padding: "24px 40px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
        <DehydLogo color={T.faint} height={22} />
        <p style={{ fontSize: 12, color: T.faint }}>© {new Date().getFullYear()} Dehy. Built for energy &amp; commodity traders.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {[["Sign in","/auth/login"],["Register","/auth/register"],["Pricing","#pricing"]].map(([l,h]) => (
            <Link key={l} href={h} style={{ fontSize: 12, color: T.faint, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
