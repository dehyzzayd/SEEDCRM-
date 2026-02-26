import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResetPasswordButton } from "./ResetPasswordButton";
import { ShieldCheck } from "lucide-react";

export default async function SecurityPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { organization: { select: { name: true } } },
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader
        title="Security"
        description="Reset passwords, manage sessions, and review access"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Security" }]}
      />

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-primary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-sm font-semibold text-text-primary">User Password Reset</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-text-tertiary text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Organization</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-secondary transition-colors">
                <td className="px-6 py-4">
                  <p className="text-xs font-medium text-text-primary">{user.name ?? "—"}</p>
                  <p className="text-xs text-text-tertiary">{user.email}</p>
                </td>
                <td className="px-6 py-4 text-xs text-text-secondary">
                  {user.organization?.name ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-secondary border border-border-primary text-text-tertiary">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ResetPasswordButton userId={user.id} userEmail={user.email ?? ""} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
