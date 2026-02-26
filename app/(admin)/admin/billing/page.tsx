import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function BillingPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:               true,
      name:             true,
      subscriptionTier: true,
      stripeCustomerId: true,
      createdAt:        true,
      updatedAt:        true,
    },
  });

  const connected    = orgs.filter((o) => o.stripeCustomerId).length;
  const notConnected = orgs.length - connected;
  const paying       = orgs.filter((o) => o.subscriptionTier !== "FREE").length;

  const tierBadge: Record<string, string> = {
    FREE:       "bg-surface-secondary text-text-tertiary border border-border-primary",
    PRO:        "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    ENTERPRISE: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader
        title="Billing"
        description="Subscription tiers and Stripe customer overview"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Billing" }]}
        actions={
          <Link
            href="/admin/exports?type=billing"
            className="text-xs px-3 py-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            Export Billing CSV →
          </Link>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts",    value: orgs.length,   color: "text-text-primary" },
          { label: "Paying",            value: paying,        color: "text-green-400"    },
          { label: "Stripe Connected",  value: connected,     color: "text-blue-400"     },
          { label: "Not Connected",     value: notConnected,  color: "text-text-tertiary"},
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">{label}</p>
            <p className={`font-mono tabular-nums text-2xl font-semibold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Billing table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-primary">
          <h2 className="text-sm font-semibold text-text-primary">All Subscriptions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-text-tertiary text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Organization</th>
              <th className="px-6 py-3 text-left">Tier</th>
              <th className="px-6 py-3 text-left">Stripe Customer ID</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Last Updated</th>
              <th className="px-6 py-3 text-left">Transactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-surface-secondary transition-colors">
                <td className="px-6 py-4 font-medium text-text-primary">{org.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierBadge[org.subscriptionTier]}`}>
                    {org.subscriptionTier}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-text-tertiary">
                  {org.stripeCustomerId ?? (
                    <span className="text-text-disabled italic">not connected</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {org.stripeCustomerId ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Connected
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-secondary text-text-disabled border border-border-primary">
                      No Stripe
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-text-tertiary text-xs">
                  {new Date(org.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/${org.id}/transactions`}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note about live Stripe data */}
      <div className="rounded-xl border border-border-primary bg-surface-secondary p-4">
        <p className="text-xs text-text-tertiary">
          💡 <strong className="text-text-secondary">Live invoice data</strong> is available per organization.
          Click <strong className="text-text-secondary">View →</strong> on any row to see full Stripe invoice history,
          payment status, and receipt links. Requires <code className="font-mono text-accent-primary">STRIPE_SECRET_KEY</code> in <code className="font-mono text-accent-primary">.env</code>.
        </p>
      </div>
    </div>
  );
}
