import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const { searchParams } = new URL(req.url);
  const q     = searchParams.get("q")     ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "8");

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const [deals, counterparties, contracts] = await Promise.all([
    prisma.deal.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { dealNumber:    { contains: q, mode: "insensitive" } },
          { deliveryPoint: { contains: q, mode: "insensitive" } },
          { counterparty:  { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { counterparty: { select: { shortName: true } } },
      take: Math.floor(limit / 3) + 2,
    }),
    prisma.counterparty.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name:      { contains: q, mode: "insensitive" } },
          { shortName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: Math.floor(limit / 3),
    }),
    prisma.contract.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { contractNumber: { contains: q, mode: "insensitive" } },
          { counterparty:   { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { counterparty: { select: { name: true } } },
      take: Math.floor(limit / 3),
    }),
  ]);

  const results = [
    ...deals.map(d => ({
      id:       d.id,
      type:     "deal" as const,
      title:    d.dealNumber,
      subtitle: `${d.direction} ${d.commodity.replace(/_/g, " ")} — ${d.counterparty?.shortName ?? ""}`,
      href:     `/deals/${d.id}`,
    })),
    ...counterparties.map(c => ({
      id:       c.id,
      type:     "counterparty" as const,
      title:    c.name,
      subtitle: `${c.shortName} · ${c.type}`,
      href:     `/counterparties/${c.id}`,
    })),
    ...contracts.map(c => ({
      id:       c.id,
      type:     "contract" as const,
      title:    c.contractNumber,
      subtitle: `${c.type} · ${c.counterparty?.name ?? ""}`,
      href:     `/contracts`,
    })),
  ].slice(0, limit);

  return NextResponse.json({ data: results });
}
