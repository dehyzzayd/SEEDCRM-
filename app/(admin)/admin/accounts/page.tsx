import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function AccountsPage() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, deals: true, contracts: true } },
      users: {
        where: { role: "ADMIN" },
        select: { email: true, name: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tierBadge: Record<string, string> = {
    FREE:       "bg-surface-secondary text-text-tertiary border border-border-primary",
    PRO:        "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    ENTERPRISE: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Accounts"
        description={`${orgs.length} organizations on the platform`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Accounts" }]}
        actions={
          <Link
            href="/admin/exports"
            className="text-xs px-3 py-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            Export CSV →
          </Link>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Free",       value: orgs.filter((o) => o.subscriptionTier === "FREE").length,       color: "text-text-primary"  },
          { label: "Pro",        value: orgs.filter((o) => o.subscriptionTier === "PRO").length,        color: "text-blue-400"      },
          { label: "Enterprise", value: orgs.filter((o) => o.subscriptionTier === "ENTERPRISE").length, color: "text-orange-400"    },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-mono font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-text-tertiary text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Organization</th>
              <th className="px-6 py-3 text-left">Owner Email</th>
              <th className="px-6 py-3 text-left">Tier</th>
              <th className="px-6 py-3 text-center">Users</th>
              <th className="px-6 py-3 text-center">Deals</th>
              <th className="px-6 py-3 text-center">Contracts</th>
              <th className="px-6 py-3 text-left">Stripe ID</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-surface-secondary transition-colors">
                <td className="px-6 py-4 font-medium text-text-primary">{org.name}</td>
                <td className="px-6 py-4 text-text-secondary text-xs">
                  {org.users[0]?.email ?? <span className="text-text-disabled">—</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierBadge[org.subscriptionTier]}`}>
                    {org.subscriptionTier}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-text-secondary">{org._count.users}</td>
                <td className="px-6 py-4 text-center text-text-secondary">{org._count.deals}</td>
                <td className="px-6 py-4 text-center text-text-secondary">{org._count.contracts}</td>
                <td className="px-6 py-4 text-xs font-mono text-text-tertiary truncate max-w-[140px]">
                  {org.stripeCustomerId ?? <span className="text-text-disabled">not connected</span>}
                </td>
                <td className="px-6 py-4 text-text-tertiary text-xs">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Link
                    href={`/admin/${org.id}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    Manage →
                  </Link>
                  <Link
                    href={`/admin/${org.id}/transactions`}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    Billing →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
