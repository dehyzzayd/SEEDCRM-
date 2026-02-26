"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, CheckCircle2, Building2, User, Mail, Lock, Zap } from "lucide-react";
import Link from "next/link";

function DehydLogo({ color = "currentColor", height = 32 }: { color?: string; height?: number }) {
  const width = Math.round(height * 4);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" height={height} width={width} fill={color} aria-label="Dehy">
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />
      <text x="38" y="30" fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif" fontSize="26" fontWeight="600" letterSpacing="-0.5" fill={color}>Dehy</text>
    </svg>
  );
}

const TIERS = [
  { id: "FREE",       label: "Free",       price: "$0",   desc: "Up to 3 users, 50 deals/mo" },
  { id: "PRO",        label: "Pro",        price: "$499", desc: "Up to 10 users, unlimited deals" },
  { id: "ENTERPRISE", label: "Enterprise", price: "$999", desc: "Unlimited users & deals, SLA" },
];

function RegisterForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const tierParam   = searchParams.get("tier") || "FREE";

  const [step, setStep]       = useState<"info" | "done">("info");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPw, setShowPw]   = useState(false);

  // Form fields
  const [orgName,   setOrgName]   = useState("");
  const [timezone,  setTimezone]  = useState("America/Chicago");
  const [fullName,  setFullName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [tier,      setTier]      = useState(tierParam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, timezone, fullName, email, password, tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign-in failed. Please log in manually.");
        setLoading(false);
        return;
      }

      // If paid tier, go to checkout; else go to dashboard
      if (tier !== "FREE") {
        router.push(`/checkout?tier=${tier}`);
      } else {
        setStep("done");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">You&apos;re all set!</h1>
          <p className="text-sm text-text-secondary">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <DehydLogo color="var(--text-primary)" height={34} />
        </div>

        <div className="card p-6">
          <h1 className="text-base font-semibold text-text-primary mb-1">Create your workspace</h1>
          <p className="text-xs text-text-tertiary mb-6">Set up your trading firm on Dehy in 2 minutes</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tier picker */}
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`rounded border p-2.5 text-left transition-fast ${
                      tier === t.id
                        ? "border-accent bg-accent/10"
                        : "border-border-default hover:border-border-strong"
                    }`}
                  >
                    <div className="text-xs font-semibold text-text-primary">{t.label}</div>
                    <div className="text-[11px] text-accent font-mono mt-0.5">{t.price}<span className="text-text-disabled">/mo</span></div>
                    <div className="text-[10px] text-text-tertiary mt-1 leading-tight">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Company info */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Company
              </p>
              <div>
                <label className="text-xs text-text-tertiary block mb-1">Company Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
                  placeholder="Acme Energy Trading LLC"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
                >
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="America/Houston">Houston (CT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Amsterdam">Amsterdam (CET)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                </select>
              </div>
            </div>

            {/* Admin user */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" /> Admin Account
              </p>
              <div>
                <label className="text-xs text-text-tertiary block mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
                  placeholder="jane@yourcompany.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 pr-9 text-sm text-text-primary focus:border-accent outline-none transition-fast"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-fast"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded bg-danger/10 border border-danger/20 px-3 py-2">
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center disabled:opacity-50 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating workspace…
                </>
              ) : tier === "FREE" ? "Create Free Workspace" : `Continue to Payment →`}
            </button>
          </form>

          <p className="text-center text-[11px] text-text-disabled mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-text-disabled mt-6">
          By signing up you agree to our Terms of Service · Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
