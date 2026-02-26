"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/store/app-store";

function LogoFull({ color = "currentColor" }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" height={30} width={120} fill={color} aria-label="Dehy">
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />
      <text x="38" y="30" fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif" fontSize="26" fontWeight="600" letterSpacing="-0.5" fill={color}>Dehy</text>
    </svg>
  );
}

export default function AdminLoginPage() {
  const router                  = useRouter();
  const { theme, toggleTheme }  = useAppStore();
  const isLight                 = theme === "light";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin-auth", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Invalid credentials");
      setLoading(false);
    }
  }

  // CSS variable values based on theme
  const bg         = isLight ? "#F4F7FA"              : "#000000";
  const cardBg     = isLight ? "#FFFFFF"              : "#111111";
  const cardBorder = isLight ? "#E2E8F0"              : "#222222";
  const textPrim   = isLight ? "#1A2333"              : "#FFFFFF";
  const textSec    = isLight ? "#6B7A8D"              : "rgba(255,255,255,0.35)";
  const inputBg    = isLight ? "#F4F7FA"              : "rgba(255,255,255,0.04)";
  const inputBord  = isLight ? "#E2E8F0"              : "rgba(255,255,255,0.08)";
  const inputFocus = isLight ? "#009E7F"              : "#00D4AA";
  const accent     = isLight ? "#009E7F"              : "#00D4AA";
  const accentHov  = isLight ? "#007A68"              : "#00B896";
  const labelColor = isLight ? "#445268"              : "rgba(255,255,255,0.45)";
  const gridLine   = isLight ? "rgba(0,158,127,0.06)" : "rgba(0,212,170,0.04)";
  const orbColor   = isLight ? "rgba(0,158,127,0.05)" : "rgba(0,212,170,0.06)";
  const badgeBg    = isLight ? "rgba(0,158,127,0.08)" : "rgba(0,212,170,0.08)";
  const badgeBord  = isLight ? "rgba(0,158,127,0.20)" : "rgba(0,212,170,0.20)";
  const footerText = isLight ? "rgba(0,0,0,0.25)"     : "rgba(255,255,255,0.18)";
  const shadowColor= isLight
    ? "0 0 60px rgba(0,158,127,0.06), 0 24px 80px rgba(0,0,0,0.08)"
    : "0 0 60px rgba(0,212,170,0.08), 0 24px 80px rgba(0,0,0,0.8)";

  // Prevent hydration flash
  if (!mounted) return null;

  return (
    <div
      data-theme={theme}
      style={{
        minHeight:      "100vh",
        background:     bg,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontFamily:     "Inter, system-ui, sans-serif",
        position:       "relative",
        overflow:       "hidden",
        transition:     "background 0.2s ease",
      }}
    >
      {/* Background grid */}
      <div style={{
        position:        "absolute",
        inset:           0,
        backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
        backgroundSize:  "40px 40px",
        transition:      "opacity 0.2s ease",
      }} />

      {/* Glow orb */}
      <div style={{
        position:     "absolute",
        top:          "15%",
        left:         "50%",
        transform:    "translateX(-50%)",
        width:        500,
        height:       500,
        borderRadius: "50%",
        background:   `radial-gradient(circle, ${orbColor} 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />

      {/* Theme toggle — top right */}
      <button
        onClick={toggleTheme}
        style={{
          position:       "fixed",
          top:            16,
          right:          16,
          zIndex:         100,
          width:          36,
          height:         36,
          borderRadius:   8,
          background:     cardBg,
          border:         `1px solid ${cardBorder}`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          cursor:         "pointer",
          transition:     "all 0.2s ease",
          boxShadow:      isLight ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {isLight
          ? <Moon style={{ width: 15, height: 15, color: textSec }} />
          : <Sun  style={{ width: 15, height: 15, color: textSec }} />
        }
      </button>

      {/* Card */}
      <div style={{
        position:       "relative",
        zIndex:         1,
        width:          "100%",
        maxWidth:       420,
        margin:         "0 16px",
        background:     cardBg,
        border:         `1px solid ${cardBorder}`,
        borderRadius:   16,
        padding:        "40px 36px",
        backdropFilter: "blur(20px)",
        boxShadow:      shadowColor,
        transition:     "background 0.2s ease, border-color 0.2s ease",
      }}>

        {/* Logo + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <LogoFull color={textPrim} />
          <span style={{
            fontSize:      9,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding:       "3px 7px",
            borderRadius:  5,
            background:    badgeBg,
            color:         accent,
            border:        `1px solid ${badgeBord}`,
          }}>
            Admin
          </span>
        </div>

        {/* Icon + title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            width:          48,
            height:         48,
            borderRadius:   12,
            background:     badgeBg,
            border:         `1px solid ${badgeBord}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            marginBottom:   14,
          }}>
            <ShieldCheck style={{ width: 22, height: 22, color: accent }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: textPrim, marginBottom: 6, lineHeight: 1.2 }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 13, color: textSec, lineHeight: 1.6 }}>
            Restricted to platform owners only.<br />
            Not linked to any user account.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding:      "10px 14px",
            background:   "rgba(239,68,68,0.10)",
            border:       "1px solid rgba(239,68,68,0.25)",
            borderRadius: 8,
            fontSize:     13,
            color:        "#EF4444",
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: labelColor, marginBottom: 6 }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              placeholder="admin@dehy.internal"
              style={{
                width:        "100%",
                padding:      "10px 14px",
                boxSizing:    "border-box",
                background:   inputBg,
                border:       `1px solid ${inputBord}`,
                borderRadius: 8,
                fontSize:     14,
                color:        textPrim,
                outline:      "none",
                fontFamily:   "inherit",
                transition:   "border-color 0.15s, background 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = inputFocus; }}
              onBlur={(e)  => { e.target.style.borderColor = inputBord; }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: labelColor, marginBottom: 6 }}>
              Admin Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
                placeholder="••••••••••••"
                style={{
                  width:        "100%",
                  padding:      "10px 44px 10px 14px",
                  boxSizing:    "border-box",
                  background:   inputBg,
                  border:       `1px solid ${inputBord}`,
                  borderRadius: 8,
                  fontSize:     14,
                  color:        textPrim,
                  outline:      "none",
                  fontFamily:   "inherit",
                  transition:   "border-color 0.15s, background 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = inputFocus; }}
                onBlur={(e)  => { e.target.style.borderColor = inputBord; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position:  "absolute",
                  right:     12,
                  top:       "50%",
                  transform: "translateY(-50%)",
                  background:"none",
                  border:    "none",
                  cursor:    "pointer",
                  padding:   0,
                  display:   "flex",
                }}
              >
                {showPw
                  ? <EyeOff style={{ width: 16, height: 16, color: textSec }} />
                  : <Eye    style={{ width: 16, height: 16, color: textSec }} />
                }
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width:          "100%",
              padding:        "11px 20px",
              background:     loading ? `${accent}80` : accent,
              border:         "none",
              borderRadius:   8,
              fontSize:       14,
              fontWeight:     600,
              color:          isLight ? "#FFFFFF" : "#000000",
              cursor:         loading ? "not-allowed" : "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
              marginTop:      4,
              fontFamily:     "inherit",
              transition:     "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = accentHov; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = accent;    }}
          >
            {loading && <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />}
            {loading ? "Authenticating…" : "Access Admin Panel"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ height: 1, background: cardBorder, margin: "24px 0" }} />

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: footerText, lineHeight: 1.6 }}>
          Credentials are set via environment variables only.<br />
          Session expires after 12 hours.
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px ${inputBg} inset !important;
          -webkit-text-fill-color: ${textPrim} !important;
        }
      `}</style>
    </div>
  );
}
