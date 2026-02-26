import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { ChangeTierButton } from "./ChangeTierButton";

export default async function OrgDetailPage({ params }: { params: { orgId: string } }) {
  const org = await prisma.organization.findUnique({
    where: { id: params.orgId },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      _count: { select: { deals: true, counterparties: true, contracts: true } },
    },
  });

  if (!org) notFound();

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader
        title={org.name}
        subtitle={`Organization ID: ${org.id}`}
        backHref="/admin"
        backLabel="All Accounts"
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Users"      value={org._count.users}          />
        <MetricCard label="Total Deals"      value={org._count.deals}          />
        <MetricCard label="Contracts"        value={org._count.contracts}      />
      </div>

      {/* Org parameters */}
      <div className="rounded-xl border border-border-primary bg-surface-primary p-6 space-y-4">
        <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
          Account Parameters
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Subscription Tier",  value: org.subscriptionTier },
            { label: "Stripe Customer",    value: org.stripeCustomerId ?? "Not connected" },
            { label: "Counterparties",     value: org._count.counterparties },
            { label: "Created",            value: new Date(org.createdAt).toLocaleDateString() },
            { label: "Last Updated",       value: new Date(org.updatedAt).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-text-tertiary">{label}</p>
              <p className="text-sm font-medium text-text-primary mt-1 truncate">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tier management */}
      <div className="rounded-xl border border-border-primary bg-surface-primary p-6 space-y-4">
        <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
          Change Subscription Tier
        </h2>
        <div className="flex gap-3">
          {["FREE", "PRO", "ENTERPRISE"].map((tier) => (
            <ChangeTierButton
              key={tier}
              orgId={org.id}
              tier={tier}
              currentTier={org.subscriptionTier}
            />
          ))}
        </div>
        <p className="text-xs text-text-tertiary">
          Directly updates the database tier. No Stripe charge triggered from here.
        </p>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-border-primary bg-surface-primary p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Users ({org.users.length})
          </h2>
          <Link
            href={`/admin/${org.id}/transactions`}
            className="text-xs bg-surface-secondary hover:bg-surface-tertiary text-text-primary px-3 py-1.5 rounded-md transition-colors border border-border-primary"
          >
            View Transactions →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-text-tertiary text-xs uppercase">
            <tr>
              <th className="pb-3 text-left">Name</th>
              <th className="pb-3 text-left">Email</th>
              <th className="pb-3 text-left">Role</th>
              <th className="pb-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {org.users.map((user) => (
              <tr key={user.id}>
                <td className="py-3 text-text-primary">{user.name ?? "—"}</td>
                <td className="py-3 text-text-secondary">{user.email}</td>
                <td className="py-3">
                  <span className="text-xs bg-surface-secondary border border-border-primary px-2 py-1 rounded text-text-secondary">
                    {user.role}
                  </span>
                </td>
                <td className="py-3 text-text-tertiary text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
