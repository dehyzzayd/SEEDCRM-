import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import Stripe from "stripe";

export default async function TransactionsPage({ params }: { params: { orgId: string } }) {
  const org = await prisma.organization.findUnique({
    where: { id: params.orgId },
    select: { id: true, name: true, stripeCustomerId: true, subscriptionTier: true },
  });

  if (!org) notFound();

  let invoices: Stripe.Invoice[] = [];
  let stripeError = "";

  if (org.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
      const result = await stripe.invoices.list({ customer: org.stripeCustomerId, limit: 50 });
      invoices = result.data;
    } catch {
      stripeError = "Could not load Stripe invoices. Check STRIPE_SECRET_KEY in .env.";
    }
  } else {
    stripeError = org.stripeCustomerId
      ? "STRIPE_SECRET_KEY not set in .env."
      : "No Stripe customer linked to this account yet.";
  }

  const statusColors: Record<string, string> = {
    paid:          "bg-green-500/10 text-green-400",
    open:          "bg-yellow-500/10 text-yellow-400",
    void:          "bg-surface-secondary text-text-tertiary",
    uncollectible: "bg-red-500/10 text-red-400",
    draft:         "bg-surface-secondary text-text-tertiary",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader
        title="Transaction History"
        subtitle={`${org.name} · ${org.subscriptionTier}${org.stripeCustomerId ? ` · ${org.stripeCustomerId}` : " · No Stripe customer"}`}
        backHref={`/admin/${org.id}`}
        backLabel={org.name}
      />

      {stripeError ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 p-6 text-sm">
          ⚠️ {stripeError}
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-border-primary bg-surface-primary p-6 text-text-tertiary text-sm">
          No invoices found for this customer.
        </div>
      ) : (
        <div className="rounded-xl border border-border-primary bg-surface-primary overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary text-text-tertiary text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Invoice ID</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-secondary transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-text-tertiary">{inv.id}</td>
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(inv.created * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-text-secondary max-w-xs truncate">
                    {inv.description ?? inv.lines.data[0]?.description ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-text-primary font-medium">
                    {inv.currency.toUpperCase()} {((inv.amount_paid ?? 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[inv.status ?? "draft"]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {inv.hosted_invoice_url ? (
                      <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-accent-primary hover:text-accent-hover underline">
                        View →
                      </a>
                    ) : <span className="text-text-tertiary">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
