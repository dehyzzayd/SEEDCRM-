import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function AdminOverviewPage() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, deals: true } },
      users: { where: { role: "ADMIN" }, select: { email: true, name: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const free       = orgs.filter((o) => o.subscriptionTier === "FREE").length;
  const pro        = orgs.filter((o) => o.subscriptionTier === "PRO").length;
  const enterprise = orgs.filter((o) => o.subscriptionTier === "ENTERPRISE").length;
  const totalUsers = orgs.reduce((s, o) => s + o._count.users, 0);
  const totalDeals = orgs.reduce((s, o) => s + o._count.deals, 0);
  const paying     = pro + enterprise;

  const tierBadge: Record<string, string> = {
    FREE:       "bg-surface-secondary text-text-tertiary border border-border-primary",
    PRO:        "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    ENTERPRISE: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Overview"
        description="SaaS control panel — all organizations, billing, and activity"
        actions={
          <Link
            href="/admin/exports"
            className="text-xs px-3 py-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            Export All →
          </Link>
        }
      />

      {/* Top metrics — plain server-safe cards, no icon props */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orgs",   value: orgs.length,  color: "text-text-primary"  },
          { label: "Total Users",  value: totalUsers,   color: "text-text-primary"  },
          { label: "Total Deals",  value: totalDeals,   color: "text-text-primary"  },
          { label: "Paying Orgs",  value: paying,       color: "text-green-400"     },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 flex flex-col gap-1">
            <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">{label}</span>
            <span className={`font-mono tabular-nums text-2xl font-semibold mt-1 ${color}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Tier breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-mono font-semibold text-text-primary">{free}</p>
          <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Free</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-mono font-semibold text-blue-400">{pro}</p>
          <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Pro</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-mono font-semibold text-orange-400">{enterprise}</p>
          <p className="text-xs text-text-tertiary uppercase tracking-wider mt-1">Enterprise</p>
        </div>
      </div>

      {/* Accounts table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">All Accounts</h2>
          <Link href="/admin/accounts" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-text-tertiary text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Organization</th>
              <th className="px-6 py-3 text-left">Owner</th>
              <th className="px-6 py-3 text-left">Tier</th>
              <th className="px-6 py-3 text-center">Users</th>
              <th className="px-6 py-3 text-center">Deals</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-left">Action</th>
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
                <td className="px-6 py-4 text-text-tertiary text-xs">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/${org.id}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    Manage →
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
