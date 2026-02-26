"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
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

const PLAN_INFO: Record<string, { name: string; price: string; features: string[] }> = {
  PRO: {
    name: "Pro",
    price: "$499/mo",
    features: ["Up to 10 users", "Unlimited deals", "Priority support", "Market data feeds"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "$999/mo",
    features: ["Unlimited users", "All Pro features", "SSO/SAML", "Dedicated account manager", "SLA 99.9%"],
  },
};

function CheckoutContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const tier         = searchParams.get("tier") || "PRO";
  const plan         = PLAN_INFO[tier] ?? PLAN_INFO.PRO;

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // If not logged in, redirect to register first
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/register?tier=${tier}`);
    }
  }, [status, tier, router]);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start checkout.");
        setLoading(false);
        return;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <DehydLogo color="var(--text-primary)" height={34} />
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/pricing" className="text-text-tertiary hover:text-text-secondary transition-fast">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base font-semibold text-text-primary">Complete your subscription</h1>
          </div>
          <p className="text-xs text-text-tertiary mb-6 ml-6">Secure checkout via Stripe</p>

          {/* Plan summary */}
          <div className="rounded-lg bg-bg-panel border border-border-default p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-text-primary">DEHY {plan.name}</span>
                <p className="text-xs text-text-tertiary mt-0.5">Billed monthly · Cancel anytime</p>
              </div>
              <span className="text-lg font-bold text-accent font-mono">{plan.price}</span>
            </div>
            <ul className="space-y-1.5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Who's paying */}
          {session?.user && (
            <div className="rounded bg-bg-hover border border-border-default px-3 py-2.5 mb-4 text-xs">
              <span className="text-text-tertiary">Billing to: </span>
              <span className="text-text-primary font-medium">{session.user.email}</span>
              {" · "}
              <span className="text-text-secondary">{(session.user as Record<string, string>).orgName}</span>
            </div>
          )}

          {error && (
            <div className="rounded bg-danger/10 border border-danger/20 px-3 py-2 mb-4">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          {/* Stripe note */}
          <div className="rounded bg-bg-panel border border-border-default px-3 py-2.5 mb-4 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              You&apos;ll be redirected to <strong className="text-text-primary">Stripe</strong> to enter
              your payment details securely. DEHY never stores your card information.
            </p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full btn-primary justify-center disabled:opacity-50 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to Stripe…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Pay with Stripe →
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-text-disabled mt-3">
            256-bit SSL encryption · PCI DSS compliant
          </p>
        </div>

        <p className="text-center text-[11px] text-text-disabled mt-4">
          Questions?{" "}
          <a href="mailto:billing@dehy.io" className="text-accent hover:underline">billing@dehy.io</a>
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
