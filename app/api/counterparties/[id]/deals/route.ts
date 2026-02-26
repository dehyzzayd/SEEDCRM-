import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const deals = await prisma.deal.findMany({
    where: { counterpartyId: params.id, organizationId: orgId },
    include: {
      assignedUser: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: deals });
}
