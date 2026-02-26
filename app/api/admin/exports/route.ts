import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v).replace(/\r?\n/g, " ");
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "orgs";

  let csv = "";
  let filename = "export.csv";

  if (type === "orgs") {
    const orgs = await prisma.organization.findMany({
      include: { _count: { select: { users: true, deals: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = toCSV(
      orgs.map((o) => ({
        id: o.id,
        name: o.name,
        tier: o.subscriptionTier,
        users: o._count.users,
        deals: o._count.deals,
        stripeCustomerId: o.stripeCustomerId ?? "",
        createdAt: o.createdAt.toISOString(),
      }))
    );
    filename = "organizations.csv";
  }

  else if (type === "users") {
    const users = await prisma.user.findMany({
      include: { organization: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = toCSV(
      users.map((u) => ({
        id: u.id,
        name: u.name ?? "",
        email: u.email,
        role: u.role,
        organization: u.organization?.name ?? "",
        createdAt: u.createdAt.toISOString(),
      }))
    );
    filename = "users.csv";
  }

  else if (type === "deals") {
    const deals = await prisma.deal.findMany({
      include: {
        organization: { select: { name: true } },
        counterparty:  { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    csv = toCSV(
      deals.map((d) => ({
        id: d.id,
        title: d.title ?? "",
        status: d.status,
        commodity: d.commodity ?? "",
        volume: d.volume?.toString() ?? "",
        price: d.price?.toString() ?? "",
        organization: d.organization?.name ?? "",
        counterparty: d.counterparty?.name ?? "",
        createdAt: d.createdAt.toISOString(),
      }))
    );
    filename = "deals.csv";
  }

  else if (type === "billing") {
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        subscriptionTier: true,
        stripeCustomerId: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    csv = toCSV(
      orgs.map((o) => ({
        id: o.id,
        name: o.name,
        tier: o.subscriptionTier,
        stripeConnected: o.stripeCustomerId ? "yes" : "no",
        stripeCustomerId: o.stripeCustomerId ?? "",
        updatedAt: o.updatedAt.toISOString(),
      }))
    );
    filename = "billing.csv";
  }

  else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
