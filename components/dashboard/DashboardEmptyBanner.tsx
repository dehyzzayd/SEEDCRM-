import Link from "next/link";
import { Zap, GitPullRequest, Building2 } from "lucide-react";

export function DashboardEmptyBanner() {
  return (
    <div
      className="mx-6 mt-6 rounded-xl border p-6"
      style={{
        background:   "linear-gradient(135deg, rgba(0,212,170,0.04) 0%, rgba(0,212,170,0.01) 100%)",
        borderColor:  "rgba(0,212,170,0.15)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,212,170,0.10)", border: "1px solid rgba(0,212,170,0.20)" }}
        >
          <Zap className="w-5 h-5" style={{ color: "var(--accent)" }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Welcome to Dehy — your trading desk starts here
          </h3>
          <p className="text-xs text-text-tertiary leading-relaxed max-w-xl">
            Your dashboard will show live KPIs, P&L, pipeline value, and market prices once you add your first deal and counterparty.
            The whole platform auto-populates from your deal data — no manual reporting needed.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Link
              href="/deals/new"
              className="btn-primary inline-flex items-center gap-1.5 text-xs"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Log first deal
            </Link>
            <Link
              href="/counterparties"
              className="btn-secondary inline-flex items-center gap-1.5 text-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              Add counterparty
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
