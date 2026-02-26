import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImpersonateButton } from "./ImpersonateButton";
import { LogIn, ShieldAlert } from "lucide-react";

export default async function ImpersonatePage() {
  const orgs = await prisma.organization.findMany({
    include: {
      users: {
        where: { role: { in: ["ADMIN", "TRADER"] } },
        select: { id: true, name: true, email: true, role: true },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader
        title="Impersonate Account"
        description="Log in as any organization's user to debug issues. A banner will appear reminding you that you are impersonating."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Impersonate" }]}
      />

      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-orange-300">
          Impersonation creates a temporary session token valid for 1 hour. All actions taken while impersonating are logged in the activity log. Use only to resolve customer issues.
        </p>
      </div>

      <div className="space-y-3">
        {orgs.map((org) => (
          <div key={org.id} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{org.name}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{org.subscriptionTier}</p>
              </div>
            </div>
            <div className="space-y-2">
              {org.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-3">
                    <LogIn className="w-3.5 h-3.5 text-text-tertiary" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">{user.name ?? user.email}</p>
                      <p className="text-xs text-text-tertiary">{user.email} · {user.role}</p>
                    </div>
                  </div>
                  <ImpersonateButton userId={user.id} userName={user.name ?? user.email} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
