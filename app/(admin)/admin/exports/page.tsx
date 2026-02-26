import { Download, Users, Building2, GitPullRequest, CreditCard } from "lucide-react";

const exports = [
  { type: "orgs",    label: "Organizations", description: "All accounts, tiers, user/deal counts, Stripe IDs", filename: "organizations.csv" },
  { type: "users",   label: "Users",          description: "All users, roles, linked organizations",             filename: "users.csv" },
  { type: "deals",   label: "Deals",          description: "All deals across every organization",               filename: "deals.csv" },
  { type: "billing", label: "Billing",        description: "Stripe connection status and tier per org",         filename: "billing.csv" },
];

export default function ExportsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Data Exports</h1>
        <p className="text-sm text-[var(--text-secondary)]">Download CSV snapshots of your platform data.</p>
      </div>

      <div className="grid gap-4">
        {exports.map((ex) => (
          <div
            key={ex.type}
            className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)]"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{ex.label}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{ex.description}</p>
            </div>
            <a
              href={`/api/admin/exports?type=${ex.type}`}
              download={ex.filename}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
