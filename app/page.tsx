"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car, Users, FileText, BarChart3, ArrowRight, Zap,
  Smartphone, Check, X, ChevronDown, Star, DollarSign,
  AlertTriangle, Layers, Database, Sun, Moon,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

// ─── DESIGN TOKENS (mirrors login page exactly) ───────────────────────────────
const ACCENT      = "#10B981";
const ACCENT_HOV  = "#059669";
const ACCENT_GLOW = "rgba(16,185,129,0.12)";
const ACCENT_RING = "rgba(16,185,129,0.25)";

function useThemeTokens(isDark: boolean) {
  return {
    bg:            isDark ? "#0A0F1A"                : "#F4F7FA",
    bgPanel:       isDark ? "#0F1623"                : "#FFFFFF",
    bgCard:        isDark ? "#111827"                : "#FFFFFF",
    bgInput:       isDark ? "#141C2E"                : "#F8FAFC",
    bgHover:       isDark ? "#1A2235"                : "#EEF2F7",
    border:        isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    borderHov:     isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)",
    textPrimary:   isDark ? "#F0F4FF"                : "#0F172A",
    textSecondary: isDark ? "#8A9BB5"                : "#64748B",
    textMuted:     isDark ? "rgba(138,155,181,0.55)" : "rgba(100,116,139,0.55)",
  };
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "35,000+", label: "Independent Lots in the US",   sub: "underserved by legacy software"      },
  { value: "$1,500",  label: "Avg. monthly competitor cost", sub: "before add-ons & per-user fees"      },
  { value: "47 hrs",  label: "Avg. lead response time",      sub: "without a modern CRM"                },
  { value: "68%",     label: "Dealers on spreadsheets",      sub: "or pen-and-paper workflows"          },
];

const PAIN_POINTS = [
  {
    icon: DollarSign,
    title: "Frazer is stuck in 2008",
    desc: "Windows-only, no mobile, no real-time analytics. $129–$199/mo feels affordable until you count every deal you're losing.",
    color: ACCENT,
  },
  {
    icon: AlertTriangle,
    title: "DealerCenter nickel-and-dimes you",
    desc: "Starts at $60/mo — but meaningful features pile up fast. Complicated UI, steep curve, add-on fees for everything that matters.",
    color: "#F59E0B",
  },
  {
    icon: Layers,
    title: "vAuto costs a fortune",
    desc: "$600–$2,000/mo, built for franchise giants. Most features are irrelevant if you're running 20–200 cars on an independent lot.",
    color: "#8B5CF6",
  },
  {
    icon: Database,
    title: "DealerSocket requires a PhD",
    desc: "$1,000–$3,000/mo with weeks of onboarding. Designed for 50-location groups — overkill for a lean, fast-moving operation.",
    color: "#06B6D4",
  },
];

const FEATURES = [
  { icon: Car,       title: "Smart Inventory",  tag: "Core",    desc: "VIN decode in seconds, aging alerts, live market valuation, photo management, and filterable pipeline view. Never let a unit sit unseen." },
  { icon: Users,     title: "Deal Pipeline",    tag: "Core",    desc: "Kanban-style deal board with stage tracking, gross preview, F&I product builder, and one-click customer portal. Close faster, leak less profit." },
  { icon: FileText,  title: "Docs & Compliance",tag: "Core",    desc: "Auto-generate buyer guides, spot-delivery packets, BHPH notes, and state forms. E-sign ready. No more printing stacks of paper." },
  { icon: BarChart3, title: "Live Analytics",   tag: "Insight", desc: "Real-time gross per unit, floor-plan aging, sales velocity by model, and front/back-end profit breakdown. Your numbers, always current." },
  { icon: Zap,       title: "AI Lead Response", tag: "AI",      desc: "Respond to web leads in under 60 seconds, 24/7, via SMS and email. Re-engage cold prospects automatically. Never miss a buyer again." },
  { icon: Smartphone,title: "Mobile-First",     tag: "UX",      desc: "Full functionality on iOS and Android. Walk the lot, scan VINs, close deals, and check your numbers — all from your phone." },
];

const COMPARE = [
  { feature: "Starting Price",        dealerseed: "$149/mo",   frazer: "$129/mo",  dealerCenter: "$60/mo*",   vAuto: "$600/mo",  dealerSocket: "$1,000/mo", note: "* DealerCenter price rises sharply with add-ons" },
  { feature: "Mobile App",            dealerseed: true,        frazer: false,      dealerCenter: true,        vAuto: true,       dealerSocket: true  },
  { feature: "AI Lead Response",      dealerseed: true,        frazer: false,      dealerCenter: false,       vAuto: false,      dealerSocket: true  },
  { feature: "Real-Time Analytics",   dealerseed: true,        frazer: false,      dealerCenter: "Limited",   vAuto: true,       dealerSocket: true  },
  { feature: "VIN Decoder",           dealerseed: true,        frazer: true,       dealerCenter: true,        vAuto: true,       dealerSocket: true  },
  { feature: "No Per-User Fees",      dealerseed: true,        frazer: true,       dealerCenter: false,       vAuto: false,      dealerSocket: false },
  { feature: "No Long-Term Contract", dealerseed: true,        frazer: false,      dealerCenter: false,       vAuto: false,      dealerSocket: false },
  { feature: "Browser-Based",         dealerseed: true,        frazer: false,      dealerCenter: true,        vAuto: true,       dealerSocket: true  },
  { feature: "E-Sign Documents",      dealerseed: true,        frazer: false,      dealerCenter: "Add-on",    vAuto: false,      dealerSocket: "Add-on" },
  { feature: "Setup Time",            dealerseed: "< 1 day",   frazer: "3–5 days", dealerCenter: "2–3 days",  vAuto: "1–2 wks",  dealerSocket: "2–4 wks" },
];

const STEPS = [
  { num: "01", title: "Import your inventory",  desc: "Paste a VIN or bulk-upload from CSV. We decode, enrich, and price every unit using live market data in under a minute." },
  { num: "02", title: "Manage every deal",       desc: "From first contact to funded deal. Leads, offers, trade-ins, F&I, docs — all in one place, visible to your whole team." },
  { num: "03", title: "Watch the numbers move",  desc: "Your dashboard updates in real time. Gross per unit, floor-plan cost, sales velocity, aging risk — everything a GM needs to act, not guess." },
];

const REVIEWS = [
  { name: "Carlos M.",  title: "Owner, Rio Grande Auto Sales",  stars: 5, text: "Switched from Frazer after 7 years. The difference is night and day — my team actually uses this without complaining." },
  { name: "Tanya R.",   title: "GM, Northside Pre-Owned",       stars: 5, text: "We were spending $2,400/month on DealerSocket for half the features we used. Dealerseed does everything for a third of the cost." },
  { name: "Devon K.",   title: "Finance Manager, Lakeland Motors", stars: 5, text: "The gross preview updates as I'm structuring the deal. I haven't had a back-end surprise in three months." },
];

const PLANS = [
  {
    name: "Starter", price: "$149", per: "/mo", highlight: false,
    desc: "Everything a single-location lot needs to run professionally.",
    cta: "Start Free Trial", href: "/auth/register",
    features: ["Up to 75 active units","Unlimited users","VIN decoder + live pricing","Deal pipeline (Kanban)","Basic document generation","Email & SMS lead capture","Standard analytics dashboard","Mobile app (iOS + Android)"],
  },
  {
    name: "Pro", price: "$299", per: "/mo", highlight: true,
    desc: "For growing lots that need AI, automation, and deeper insight.",
    cta: "Start Free Trial", href: "/auth/register",
    features: ["Unlimited active units","Unlimited users","Everything in Starter","AI 24/7 lead response","E-sign document suite","BHPH payment tracking","Advanced analytics + gross reports","Priority support (< 2 hr response)"],
  },
  {
    name: "Enterprise", price: "Custom", per: "", highlight: false,
    desc: "Multi-rooftop groups with custom integrations and white-glove onboarding.",
    cta: "Talk to Sales", href: "/contact",
    features: ["Everything in Pro","Multi-location dashboard","Custom DMS integration","Dedicated account manager","Custom reporting & exports","SLA-backed uptime guarantee","On-site onboarding available","API access"],
  },
];

const FAQS = [
  { q: "How long does setup take?",              a: "Most dealers are live in under a day. Import your inventory via CSV or VIN scan, invite your team, and start closing — no IT consultant required." },
  { q: "Can I import data from Frazer or DealerCenter?", a: "Yes. We support CSV import from any system, and our onboarding team helps you migrate inventory, customer records, and deal history." },
  { q: "Is there a contract or lock-in?",        a: "No contracts, no lock-in. Month-to-month only. Cancel any time from your account settings." },
  { q: "Does Dealerseed work for BHPH lots?",    a: "Absolutely. Our Pro plan includes BHPH payment tracking, collections workflow, and buyer guide generation — everything a buy-here-pay-here operation needs." },
  { q: "What does the free trial include?",      a: "Full access to the Pro tier for 14 days, no credit card required. Your data stays yours if you decide it's not the right fit." },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CellVal({ val }: { val: boolean | string }) {
  if (val === true)  return <Check  size={16} color={ACCENT}    strokeWidth={2.5} />;
  if (val === false) return <X      size={16} color="#EF4444"   strokeWidth={2.5} />;
  return <span style={{ color: "#8A9BB5", fontSize: 12 }}>{val}</span>;
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
      ))}
    </span>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar({ isDark, toggleTheme, tokens }: { isDark: boolean; toggleTheme: () => void; tokens: ReturnType<typeof useThemeTokens> }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled
          ? isDark ? "rgba(10,15,26,0.88)" : "rgba(244,247,250,0.88)"
          : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? `1px solid ${tokens.border}` : "none",
        transition: "all 0.25s ease",
      }}
    >
      {/* Wordmark — all caps, no icon */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: tokens.textPrimary,
        }}>
          Dealer<span style={{ color: ACCENT }}>seed</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {["Features", "Compare", "Pricing"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            style={{ color: tokens.textSecondary, fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = tokens.textPrimary)}
            onMouseLeave={e => (e.currentTarget.style.color = tokens.textSecondary)}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {/* Theme toggle — same style as login page */}
        <button
          onClick={toggleTheme}
          style={{
            padding: "0.4rem", borderRadius: "0.5rem",
            border: `1px solid ${tokens.border}`,
            background: tokens.bgPanel,
            color: tokens.textSecondary,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <Link href="/auth/login"
          style={{ color: tokens.textSecondary, fontSize: 13, textDecoration: "none", padding: "7px 14px" }}
        >
          Sign in
        </Link>

        <Link href="/auth/register"
          style={{
            background: ACCENT,
            color: "#fff",
            fontSize: 13, fontWeight: 600,
            padding: "8px 18px",
            borderRadius: "0.5rem",
            textDecoration: "none",
            boxShadow: `0 0 18px ${ACCENT_GLOW}`,
            transition: "background 0.2s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = ACCENT_HOV)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = ACCENT)}
        >
          Start Free Trial
        </Link>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero({ isDark, tokens }: { isDark: boolean; tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "120px 2rem 80px",
      position: "relative", overflow: "hidden",
    }}>

      {/* Grid — exact same as login page */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: isDark
          ? `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
             linear-gradient(90deg,rgba(255,255,255,0.03) 1px, transparent 1px)`
          : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
             linear-gradient(90deg,rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* Radial green glow orb — same as login page */}
      <div style={{
        position: "absolute",
        top: "-10rem", left: "50%",
        transform: "translateX(-50%)",
        width: 700, height: 700,
        borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: `rgba(16,185,129,0.08)`,
        border: `1px solid rgba(16,185,129,0.22)`,
        borderRadius: 999,
        padding: "5px 16px",
        marginBottom: 32,
        position: "relative",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
        <span style={{ color: "#6EE7B7", fontSize: 12, fontWeight: 500 }}>
          Built for independent & BHPH dealers — not franchise giants
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
        fontWeight: 800,
        letterSpacing: -2,
        lineHeight: 1.08,
        color: tokens.textPrimary,
        maxWidth: 780,
        marginBottom: 22,
        position: "relative",
      }}>
        The dealer CRM your{" "}
        <span style={{
          background: `linear-gradient(135deg, ${ACCENT}, #34D399)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          entire team
        </span>{" "}
        will actually use
      </h1>

      {/* Subline */}
      <p style={{
        color: tokens.textSecondary,
        fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
        maxWidth: 540, lineHeight: 1.7,
        marginBottom: 44,
        position: "relative",
      }}>
        Inventory, deals, docs, analytics, and AI lead response — one modern browser-based platform.
        No Windows installs. No $1,500/mo invoices. No excuses.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", position: "relative" }}>
        <Link href="/auth/register" style={{
          background: ACCENT,
          color: "#fff", fontWeight: 700, fontSize: 14,
          padding: "13px 30px",
          borderRadius: "0.6rem",
          textDecoration: "none",
          boxShadow: `0 0 32px ${ACCENT_GLOW}`,
          display: "flex", alignItems: "center", gap: 8,
          transition: "background 0.2s",
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = ACCENT_HOV)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = ACCENT)}
        >
          Start Free Trial — 14 Days <ArrowRight size={15} />
        </Link>
        <a href="#compare" style={{
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${tokens.border}`,
          color: tokens.textPrimary,
          fontWeight: 600, fontSize: 14,
          padding: "13px 30px",
          borderRadius: "0.6rem",
          textDecoration: "none",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          Compare vs. Frazer / vAuto
        </a>
      </div>

      <p style={{ color: tokens.textMuted, fontSize: 12, marginTop: 20, position: "relative" }}>
        No credit card required · Cancel any time · Setup in under 1 day
      </p>

      {/* ── Mock Dashboard Preview ── */}
      <div style={{
        marginTop: 72,
        width: "100%", maxWidth: 880,
        borderRadius: "1rem",
        border: `1px solid ${tokens.border}`,
        background: tokens.bgPanel,
        overflow: "hidden",
        boxShadow: isDark
          ? `0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px ${ACCENT_GLOW}`
          : `0 1px 3px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.1)`,
        position: "relative",
      }}>
        {/* Window chrome */}
        <div style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${tokens.border}`,
          display: "flex", alignItems: "center", gap: 7,
          background: tokens.bgCard,
        }}>
          {["#EF4444","#F59E0B","#22C55E"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
          <div style={{
            marginLeft: 10,
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            borderRadius: 5, padding: "3px 14px",
            color: tokens.textSecondary, fontSize: 11,
          }}>
            app.dealerseed.com/dashboard
          </div>
        </div>

        {/* KPI row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          borderBottom: `1px solid ${tokens.border}`,
        }}>
          {[
            { label: "Units In Stock",    val: "84",    change: "+6 this month",   up: true  },
            { label: "Deals This Month",  val: "23",    change: "+4 vs last mo.",  up: true  },
            { label: "Avg. Front Gross",  val: "$2,840",change: "+$220 vs last mo",up: true  },
            { label: "Aging > 45 Days",   val: "7",     change: "↓2 improved",     up: true  },
          ].map((k, i) => (
            <div key={i} style={{
              padding: "18px 22px",
              borderRight: i < 3 ? `1px solid ${tokens.border}` : "none",
            }}>
              <div style={{ color: tokens.textSecondary, fontSize: 11, marginBottom: 5 }}>{k.label}</div>
              <div style={{ color: tokens.textPrimary, fontSize: 22, fontWeight: 700, letterSpacing: -0.8 }}>{k.val}</div>
              <div style={{ color: ACCENT, fontSize: 11, marginTop: 3 }}>{k.change}</div>
            </div>
          ))}
        </div>

        {/* Kanban pipeline preview */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", padding: 20 }}>
          {[
            { stage: "New Lead",    color: "#3B82F6", count: 11 },
            { stage: "Contacted",   color: "#8B5CF6", count: 7  },
            { stage: "Test Drive",  color: "#F59E0B", count: 5  },
            { stage: "Negotiating", color: "#EF4444", count: 3  },
            { stage: "Funded",      color: ACCENT,    count: 8  },
          ].map((col, ci) => (
            <div key={ci} style={{ flex: "0 0 160px", marginRight: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: tokens.textSecondary, fontSize: 11, fontWeight: 600 }}>{col.stage}</span>
                <span style={{
                  background: col.color + "22", color: col.color,
                  borderRadius: 999, padding: "1px 7px",
                  fontSize: 10, fontWeight: 700,
                }}>{col.count}</span>
              </div>
              {Array.from({ length: 3 }).map((_, di) => (
                <div key={di} style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 7, padding: "9px 10px", marginBottom: 7,
                }}>
                  <div style={{ width: "70%", height: 7, background: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)", borderRadius: 4, marginBottom: 5 }} />
                  <div style={{ width: "50%", height: 5, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────

function StatsBar({ tokens }: { tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section style={{
      padding: "56px 2rem",
      borderTop: `1px solid ${tokens.border}`,
      borderBottom: `1px solid ${tokens.border}`,
      background: tokens.bgPanel,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "0 20px",
            borderRight: i < 3 ? `1px solid ${tokens.border}` : "none",
          }}>
            <div style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 800, color: ACCENT, letterSpacing: -1, marginBottom: 5 }}>{s.value}</div>
            <div style={{ color: tokens.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
            <div style={{ color: tokens.textSecondary, fontSize: 12 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PAIN POINTS ──────────────────────────────────────────────────────────────

function PainPoints({ isDark, tokens }: { isDark: boolean; tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section style={{ padding: "96px 2rem", maxWidth: 1200, margin: "0 auto" }}>

      {/* Section label — same pill style as login badge */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#FCA5A5",
          borderRadius: 999, padding: "4px 14px",
          fontSize: 11, fontWeight: 600,
          display: "inline-block", marginBottom: 18,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>The Problem</span>
        <h2 style={{
          fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
          fontWeight: 800, letterSpacing: -1.5,
          color: tokens.textPrimary, marginBottom: 14,
        }}>
          Your current software is costing you deals
        </h2>
        <p style={{ color: tokens.textSecondary, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
          Legacy platforms were built for a different era. Here's what you're actually dealing with.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 18 }}>
        {PAIN_POINTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i}
              style={{
                background: tokens.bgCard,
                border: `1px solid ${tokens.border}`,
                borderRadius: "1rem", padding: 26,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = p.color + "44";
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = isDark ? `0 12px 32px rgba(0,0,0,0.3)` : `0 8px 24px rgba(0,0,0,0.08)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = tokens.border;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: p.color + "15",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Icon size={19} color={p.color} />
              </div>
              <h3 style={{ color: tokens.textPrimary, fontWeight: 700, fontSize: 16, marginBottom: 9 }}>{p.title}</h3>
              <p style={{ color: tokens.textSecondary, fontSize: 13, lineHeight: 1.65 }}>{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

function Features({ isDark, tokens }: { isDark: boolean; tokens: ReturnType<typeof useThemeTokens> }) {
  const tagColors: Record<string, string> = {
    Core: ACCENT, Insight: "#8B5CF6", AI: "#06B6D4", UX: "#F59E0B",
  };

  return (
    <section id="features" style={{
      padding: "96px 2rem",
      background: tokens.bgPanel,
      borderTop: `1px solid ${tokens.border}`,
      borderBottom: `1px solid ${tokens.border}`,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            background: `rgba(16,185,129,0.08)`,
            border: `1px solid rgba(16,185,129,0.22)`,
            color: "#6EE7B7",
            borderRadius: 999, padding: "4px 14px",
            fontSize: 11, fontWeight: 600,
            display: "inline-block", marginBottom: 18,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>Features</span>
          <h2 style={{
            fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
            fontWeight: 800, letterSpacing: -1.5,
            color: tokens.textPrimary, marginBottom: 14,
          }}>
            Everything you need. Nothing you don't.
          </h2>
          <p style={{ color: tokens.textSecondary, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            One platform covering inventory to funded deal — without the enterprise price tag.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const c = tagColors[f.tag] || ACCENT;
            return (
              <div key={i}
                style={{
                  background: tokens.bgCard,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "1rem", padding: 26,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = c + "44";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = tokens.border;
                  el.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: c + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={19} color={c} />
                  </div>
                  <span style={{
                    background: c + "15", color: c,
                    borderRadius: 999, padding: "2px 10px",
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
                  }}>{f.tag}</span>
                </div>
                <h3 style={{ color: tokens.textPrimary, fontWeight: 700, fontSize: 16, marginBottom: 9 }}>{f.title}</h3>
                <p style={{ color: tokens.textSecondary, fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── COMPARE TABLE ────────────────────────────────────────────────────────────

function CompareTable({ tokens }: { tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section id="compare" style={{ padding: "96px 2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.22)",
          color: "#C4B5FD",
          borderRadius: 999, padding: "4px 14px",
          fontSize: 11, fontWeight: 600,
          display: "inline-block", marginBottom: 18,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>Comparison</span>
        <h2 style={{
          fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
          fontWeight: 800, letterSpacing: -1.5,
          color: tokens.textPrimary, marginBottom: 14,
        }}>
          See how we stack up
        </h2>
        <p style={{ color: tokens.textSecondary, fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
          Real features, real pricing. No "contact us for quote" games.
        </p>
      </div>

      <div style={{
        borderRadius: "1rem",
        border: `1px solid ${tokens.border}`,
        overflow: "hidden",
        background: tokens.bgCard,
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: tokens.bgPanel }}>
                <th style={{ padding: "15px 22px", textAlign: "left", color: tokens.textSecondary, fontSize: 12, fontWeight: 600, borderBottom: `1px solid ${tokens.border}`, minWidth: 190 }}>
                  Feature
                </th>
                {[
                  { name: "DEALERSEED", highlight: true },
                  { name: "Frazer",       highlight: false },
                  { name: "DealerCenter", highlight: false },
                  { name: "vAuto",        highlight: false },
                  { name: "DealerSocket", highlight: false },
                ].map(col => (
                  <th key={col.name} style={{
                    padding: "15px 18px", textAlign: "center",
                    color: col.highlight ? ACCENT : tokens.textSecondary,
                    fontSize: 12, fontWeight: 700,
                    borderBottom: `1px solid ${tokens.border}`,
                    background: col.highlight ? `rgba(16,185,129,0.05)` : "transparent",
                    minWidth: 120,
                  }}>
                    {col.name}
                    {col.highlight && (
                      <span style={{
                        background: ACCENT, color: "#fff",
                        fontSize: 8, fontWeight: 800,
                        padding: "2px 7px", borderRadius: 999,
                        marginLeft: 7, letterSpacing: 0.5,
                        verticalAlign: "middle",
                      }}>YOU</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < COMPARE.length - 1 ? `1px solid ${tokens.border}` : "none" }}>
                  <td style={{ padding: "13px 22px", color: tokens.textPrimary, fontSize: 13 }}>
                    {row.feature}
                    {row.note && <div style={{ color: tokens.textSecondary, fontSize: 10, marginTop: 2 }}>{row.note}</div>}
                  </td>
                  {[row.dealerseed, row.frazer, row.dealerCenter, row.vAuto, row.dealerSocket].map((val, ci) => (
                    <td key={ci} style={{
                      padding: "13px 18px", textAlign: "center",
                      background: ci === 0 ? `rgba(16,185,129,0.03)` : "transparent",
                    }}>
                      <CellVal val={val as boolean | string} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ color: tokens.textMuted, fontSize: 11, textAlign: "center", marginTop: 14 }}>
        Competitor pricing sourced from Capterra, G2, debexpert.com, autoraptor.com — February 2026
      </p>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks({ tokens }: { tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section style={{
      padding: "96px 2rem",
      background: tokens.bgPanel,
      borderTop: `1px solid ${tokens.border}`,
      borderBottom: `1px solid ${tokens.border}`,
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.22)",
            color: "#67E8F9",
            borderRadius: 999, padding: "4px 14px",
            fontSize: 11, fontWeight: 600,
            display: "inline-block", marginBottom: 18,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>How It Works</span>
          <h2 style={{
            fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
            fontWeight: 800, letterSpacing: -1.5, color: tokens.textPrimary,
          }}>
            Live in under a day
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 28, alignItems: "flex-start",
              padding: "32px 0",
              borderBottom: i < STEPS.length - 1 ? `1px solid ${tokens.border}` : "none",
            }}>
              <div style={{
                flexShrink: 0, width: 52, height: 52,
                borderRadius: 13,
                background: `rgba(16,185,129,0.10)`,
                border: `1px solid rgba(16,185,129,0.25)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ACCENT, fontSize: 18, fontWeight: 800, letterSpacing: -1,
              }}>
                {step.num}
              </div>
              <div>
                <h3 style={{ color: tokens.textPrimary, fontWeight: 700, fontSize: 18, marginBottom: 9 }}>{step.title}</h3>
                <p style={{ color: tokens.textSecondary, fontSize: 14, lineHeight: 1.7, maxWidth: 580 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

function Reviews({ tokens }: { tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section style={{ padding: "96px 2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.22)",
          color: "#FCD34D",
          borderRadius: 999, padding: "4px 14px",
          fontSize: 11, fontWeight: 600,
          display: "inline-block", marginBottom: 18,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>Testimonials</span>
        <h2 style={{
          fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
          fontWeight: 800, letterSpacing: -1.5, color: tokens.textPrimary,
        }}>
          Dealers who made the switch
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 18 }}>
        {REVIEWS.map((r, i) => (
          <div key={i} style={{
            background: tokens.bgCard,
            border: `1px solid ${tokens.border}`,
            borderRadius: "1rem", padding: 26,
          }}>
            <Stars n={r.stars} />
            <p style={{
              color: tokens.textPrimary, fontSize: 14,
              lineHeight: 1.7, margin: "14px 0 22px",
              fontStyle: "italic",
            }}>"{r.text}"</p>
            <div>
              <div style={{ color: tokens.textPrimary, fontWeight: 700, fontSize: 13 }}>{r.name}</div>
              <div style={{ color: tokens.textSecondary, fontSize: 12 }}>{r.title}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function Pricing({ isDark, tokens }: { isDark: boolean; tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section id="pricing" style={{
      padding: "96px 2rem",
      background: tokens.bgPanel,
      borderTop: `1px solid ${tokens.border}`,
      borderBottom: `1px solid ${tokens.border}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            background: `rgba(16,185,129,0.08)`,
            border: `1px solid rgba(16,185,129,0.22)`,
            color: "#6EE7B7",
            borderRadius: 999, padding: "4px 14px",
            fontSize: 11, fontWeight: 600,
            display: "inline-block", marginBottom: 18,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>Pricing</span>
          <h2 style={{
            fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
            fontWeight: 800, letterSpacing: -1.5, color: tokens.textPrimary, marginBottom: 14,
          }}>
            Transparent pricing. Zero surprises.
          </h2>
          <p style={{ color: tokens.textSecondary, fontSize: 15, maxWidth: 440, margin: "0 auto" }}>
            Every plan includes unlimited users. No per-seat fees. No hidden add-ons.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 18 }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{
              background: plan.highlight
                ? isDark
                  ? `linear-gradient(160deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))`
                  : `linear-gradient(160deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))`
                : tokens.bgCard,
              border: plan.highlight ? `1.5px solid rgba(16,185,129,0.35)` : `1px solid ${tokens.border}`,
              borderRadius: "1.1rem", padding: 30,
              position: "relative",
              transition: "transform 0.2s",
              boxShadow: plan.highlight ? `0 0 40px ${ACCENT_GLOW}` : "none",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
            >
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%",
                  transform: "translateX(-50%)",
                  background: ACCENT, color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  padding: "3px 14px", borderRadius: 999,
                  letterSpacing: 1, whiteSpace: "nowrap",
                }}>MOST POPULAR</div>
              )}
              <div style={{ marginBottom: 22 }}>
                <h3 style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: 700, marginBottom: 5 }}>{plan.name}</h3>
                <p style={{ color: tokens.textSecondary, fontSize: 12 }}>{plan.desc}</p>
              </div>
              <div style={{ marginBottom: 26 }}>
                <span style={{ color: tokens.textPrimary, fontSize: 38, fontWeight: 800, letterSpacing: -2 }}>{plan.price}</span>
                <span style={{ color: tokens.textSecondary, fontSize: 14 }}>{plan.per}</span>
              </div>
              <Link href={plan.href} style={{
                display: "block", textAlign: "center",
                padding: "11px 0", borderRadius: "0.5rem",
                fontWeight: 700, fontSize: 13,
                textDecoration: "none",
                background: plan.highlight ? ACCENT : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                color: plan.highlight ? "#fff" : tokens.textPrimary,
                marginBottom: 24,
                transition: "background 0.2s",
                boxShadow: plan.highlight ? `0 0 20px ${ACCENT_GLOW}` : "none",
              }}
                onMouseEnter={e => { if (plan.highlight) (e.currentTarget as HTMLAnchorElement).style.background = ACCENT_HOV; }}
                onMouseLeave={e => { if (plan.highlight) (e.currentTarget as HTMLAnchorElement).style.background = ACCENT; }}
              >
                {plan.cta}
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {plan.features.map((feat, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <Check size={14} color={ACCENT} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: tokens.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ({ tokens }: { tokens: ReturnType<typeof useThemeTokens> }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ padding: "96px 2rem", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <h2 style={{
          fontSize: "clamp(1.7rem,3.5vw,2.4rem)",
          fontWeight: 800, letterSpacing: -1.5, color: tokens.textPrimary,
        }}>
          Frequently asked questions
        </h2>
      </div>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${tokens.border}` }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", background: "none", border: "none",
              padding: "20px 0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", textAlign: "left", gap: 16,
            }}
          >
            <span style={{ color: tokens.textPrimary, fontSize: 14, fontWeight: 600 }}>{faq.q}</span>
            <ChevronDown size={16} color={tokens.textSecondary}
              style={{ flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            />
          </button>
          {open === i && (
            <div style={{ paddingBottom: 20 }}>
              <p style={{ color: tokens.textSecondary, fontSize: 13, lineHeight: 1.75 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA({ isDark, tokens }: { isDark: boolean; tokens: ReturnType<typeof useThemeTokens> }) {
  return (
    <section style={{
      padding: "96px 2rem", textAlign: "center",
      background: tokens.bgPanel,
      borderTop: `1px solid ${tokens.border}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Same orb as hero */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Same grid as hero */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: isDark
          ? `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
             linear-gradient(90deg,rgba(255,255,255,0.03) 1px, transparent 1px)`
          : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
             linear-gradient(90deg,rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{
          fontSize: "clamp(2rem,4vw,3rem)",
          fontWeight: 800, letterSpacing: -2,
          color: tokens.textPrimary, marginBottom: 16,
        }}>
          Ready to grow your lot?
        </h2>
        <p style={{ color: tokens.textSecondary, fontSize: 15, marginBottom: 38, lineHeight: 1.7 }}>
          Join dealers who replaced Frazer, DealerCenter, and spreadsheets with a platform built for 2026.
          Free 14-day trial. No card needed.
        </p>
        <Link href="/auth/register" style={{
          background: ACCENT, color: "#fff",
          fontWeight: 700, fontSize: 15,
          padding: "14px 36px", borderRadius: "0.6rem",
          textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 9,
          boxShadow: `0 0 36px ${ACCENT_GLOW}`,
          transition: "background 0.2s",
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = ACCENT_HOV)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = ACCENT)}
        >
          Start Free Trial <ArrowRight size={16} />
        </Link>
        <p style={{ color: tokens.textMuted, fontSize: 12, marginTop: 18 }}>
          No credit card · No contract · Cancel any time
        </p>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ tokens }: { tokens: ReturnType<typeof useThemeTokens> }) {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      padding: "56px 2rem 28px",
      borderTop: `1px solid ${tokens.border}`,
      background: tokens.bg,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", flexWrap: "wrap", gap: 44,
        justifyContent: "space-between", marginBottom: 44,
      }}>
        {/* Brand */}
        <div style={{ maxWidth: 260 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800, fontSize: 15,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: tokens.textPrimary,
            }}>
              Dealer<span style={{ color: ACCENT }}>seed</span>
            </span>
          </div>
          <p style={{ color: tokens.textSecondary, fontSize: 12, lineHeight: 1.7 }}>
            The modern dealer management platform built for independent and BHPH lots.
          </p>
        </div>

        {/* Link columns */}
        {[
          { heading: "Product",  links: ["Features","Pricing","Compare","Changelog"] },
          { heading: "Company",  links: ["About","Blog","Careers","Contact"]         },
          { heading: "Legal",    links: ["Privacy Policy","Terms of Service","Cookie Policy"] },
        ].map(col => (
          <div key={col.heading}>
            <h4 style={{ color: tokens.textPrimary, fontWeight: 700, fontSize: 12, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {col.heading}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {col.links.map(l => (
                <a key={l} href="#"
                  style={{ color: tokens.textSecondary, fontSize: 12, textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = tokens.textPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.color = tokens.textSecondary)}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        borderTop: `1px solid ${tokens.border}`, paddingTop: 22,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ color: tokens.textMuted, fontSize: 11 }}>© {year} DEALERSEED. All rights reserved.</span>
        <span style={{ color: tokens.textMuted, fontSize: 11 }}>Built for the lot. Not the boardroom.</span>
      </div>
    </footer>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === "dark";
  const tokens = useThemeTokens(isDark);

  return (
    <div style={{
      background: tokens.bg,
      color: tokens.textPrimary,
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} tokens={tokens} />
      <Hero   isDark={isDark} tokens={tokens} />
      <StatsBar tokens={tokens} />
      <PainPoints isDark={isDark} tokens={tokens} />
      <Features   isDark={isDark} tokens={tokens} />
      <CompareTable tokens={tokens} />
      <HowItWorks   tokens={tokens} />
      <Reviews      tokens={tokens} />
      <Pricing      isDark={isDark} tokens={tokens} />
      <FAQ          tokens={tokens} />
      <FinalCTA     isDark={isDark} tokens={tokens} />
      <Footer       tokens={tokens} />
    </div>
  );
}
