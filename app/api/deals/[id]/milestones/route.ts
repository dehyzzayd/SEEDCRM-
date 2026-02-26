import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const deal = await prisma.deal.findFirst({
    where:  { id: params.id, organizationId: orgId },
    select: { id: true },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const milestones = await prisma.dealMilestone.findMany({
    where:   { dealId: params.id },
    orderBy: { enteredAt: "asc" },
  });
  return NextResponse.json({ data: milestones });
}
