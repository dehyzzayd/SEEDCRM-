"use client";

import { useState }                       from "react";
import { signIn }                         from "next-auth/react";
import { useRouter, useSearchParams }     from "next/navigation";
import Link                               from "next/link";
import { Loader2, Eye, EyeOff, Sun, Moon, Zap } from "lucide-react";
import { useAppStore }                    from "@/store/app-store";
import { DehydLogo }                      from "@/components/ui/DehydLogo";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || "/dashboard";

  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === "dark";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  /* ── Theme tokens ── */
  const bg            = isDark ? "#0A0F1A"               : "#F4F7FA";
  const cardBg        = isDark ? "#0F1623"               : "#FFFFFF";
  const border        = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const inputBg       = isDark ? "#141C2E"               : "#F8FAFC";
  const textPrimary   = isDark ? "#F0F4FF"               : "#0F172A";
  const textSecondary = isDark ? "#8A9BB5"               : "#64748B";
  const accent        = "#10B981";
  const accentHov     = "#059669";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        transition: "background 0.3s",
      }}
    >
      {/* ── Grid background ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* ── Glowing orb ── */}
      <div
        style={{
          position: "absolute",
          top: "-12rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 50,
          padding: "0.5rem",
          borderRadius: "0.5rem",
          border: `1px solid ${border}`,
          background: cardBg,
          color: textSecondary,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ── Card ── */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px" }}>

        {/* ── Logo ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", gap: "0.5rem" }}>
          <DehydLogo
            variant="full"
            color={accent}
            height={36}
          />
          <p style={{
            fontSize: "0.7rem",
            color: textSecondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: "0.25rem",
          }}>
            Deal Engine for Hydrocarbon Yield
          </p>
        </div>

        {/* ── Form card ── */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: isDark
              ? "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, color: textPrimary, marginBottom: "0.25rem" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.8rem", color: textSecondary, marginBottom: "1.5rem" }}>
            Sign in to your trading workspace
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, color: textSecondary }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: "0.5rem",
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.875rem",
                  color: textPrimary,
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e  => (e.target.style.borderColor = accent)}
                onBlur={e   => (e.target.style.borderColor = border)}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 500, color: textSecondary }}>
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  style={{ fontSize: "0.7rem", color: accent, textDecoration: "none" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  style={{
                    background: inputBg,
                    border: `1px solid ${border}`,
                    borderRadius: "0.5rem",
                    padding: "0.625rem 2.5rem 0.625rem 0.875rem",
                    fontSize: "0.875rem",
                    color: textPrimary,
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e  => (e.target.style.borderColor = accent)}
                  onBlur={e   => (e.target.style.borderColor = border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: textSecondary,
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "0.5rem",
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.8rem",
                  color: "#F87171",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? accentHov : accent,
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.2s",
                marginTop: "0.25rem",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = accentHov); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = accent);    }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : <><Zap size={16} /> Sign In</>
              }
            </button>
          </form>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: textSecondary }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: accent, textDecoration: "none", fontWeight: 500 }}>
              Request access
            </Link>
          </p>
          <p style={{
            fontSize: "0.7rem",
            color: isDark ? "rgba(138,155,181,0.5)" : "rgba(100,116,139,0.5)",
            marginTop: "1rem",
          }}>
            © {new Date().getFullYear()} DEHY · Institutional Energy CRM
          </p>
        </div>

      </div>
    </div>
  );
}
