import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function ActivityPage() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take:    200,
    include: {
      user:         { select: { name: true, email: true } },
      organization: { select: { name: true } },
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader
        title="Activity Log"
        description="Last 200 platform-wide events across all organizations"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Activity Log" }]}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-text-tertiary text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">Organization</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {activities.map((a) => (
              <tr key={a.id} className="hover:bg-surface-secondary transition-colors">
                <td className="px-6 py-3 text-xs text-text-tertiary font-mono whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-xs text-text-secondary">
                  {a.organization?.name ?? "—"}
                </td>
                <td className="px-6 py-3 text-xs text-text-secondary">
                  {a.user?.name ?? a.user?.email ?? "System"}
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-secondary border border-border-primary text-text-tertiary">
                    {a.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs text-text-secondary max-w-sm truncate">
                  {a.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
