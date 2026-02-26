import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID, DEMO_USER_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { updateDealSchema } from "@/lib/validators/deal";
import { STAGE_PROBABILITY_MAP } from "@/lib/constants";
import type { DealStage } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      counterparty: true,
      assignedUser: { select: { id: true, name: true, avatarUrl: true } },
      milestones: { orderBy: { enteredAt: "asc" } },
      documents: { include: { uploadedBy: { select: { id: true, name: true } } } },
      activities: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: deal });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireOrg();
    if (isAuthError(ctx)) return ctx;
    const { organizationId, userId } = ctx;

    const body  = await req.json();
    const input = updateDealSchema.parse(body);

    const existing = await prisma.deal.findFirst({
      where: { id: params.id, organizationId },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Handle stage change
    if (input.stage && input.stage !== existing.stage) {
      await prisma.dealMilestone.updateMany({
        where: { dealId: params.id, exitedAt: null },
        data:  { exitedAt: new Date() },
      });
      await prisma.dealMilestone.create({
        data: { dealId: params.id, stage: input.stage, enteredAt: new Date() },
      });
      await prisma.activity.create({
        data: {
          organizationId,
          dealId: params.id,
          userId,
          type:        "STAGE_CHANGE",
          title:       `Stage changed to ${input.stage}`,
          description: `Deal moved from ${existing.stage} to ${input.stage}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata: { fromStage: existing.stage, toStage: input.stage } as any,
        },
      });
      if (input.probability === undefined) {
        input.probability = STAGE_PROBABILITY_MAP[input.stage as DealStage] ?? existing.probability;
      }
    }

    const volume             = input.volume ?? Number(existing.volume);
    const price              = input.fixedPrice ?? Number(existing.fixedPrice) ?? 0;
    const probability        = input.probability ?? existing.probability;
    const totalNotionalValue = volume * price || Number(existing.totalNotionalValue);
    const weightedValue      = totalNotionalValue * probability / 100;

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        ...input,
        totalNotionalValue,
        weightedValue,
        closedAt: input.stage && ["SETTLED", "DEAD"].includes(input.stage)
          ? existing.closedAt ?? new Date()
          : existing.closedAt,
      },
      include: {
        counterparty: { select: { id: true, name: true, shortName: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: deal });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;
  await prisma.deal.deleteMany({ where: { id: params.id, organizationId: orgId } });
  return NextResponse.json({ data: { deleted: true } });
}

// silence unused import warning when not in auth-required mode
void DEMO_USER_ID;
