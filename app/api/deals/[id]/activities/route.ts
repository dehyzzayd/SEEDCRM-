import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID, DEMO_USER_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createActivitySchema } from "@/lib/validators/activity";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const activities = await prisma.activity.findMany({
    where:   { dealId: params.id, organizationId: orgId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: activities });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;
  const { organizationId, userId } = ctx;

  const body  = await req.json();
  const input = createActivitySchema.parse(body);

  const deal = await prisma.deal.findFirst({
    where:  { id: params.id, organizationId },
    select: { counterpartyId: true },
  });

  const activity = await prisma.activity.create({
    data: {
      organizationId,
      dealId:         params.id,
      counterpartyId: deal?.counterpartyId,
      userId,
      type:        input.type,
      title:       input.title,
      description: input.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: (input.metadata ?? undefined) as any,
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json({ data: activity }, { status: 201 });
}

void DEMO_USER_ID;
