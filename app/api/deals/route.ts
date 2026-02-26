import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID, DEMO_USER_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createDealSchema, dealFiltersSchema } from "@/lib/validators/deal";
import { generateDealNumber } from "@/lib/utils";
import { STAGE_PROBABILITY_MAP } from "@/lib/constants";
import type { DealStage } from "@/types";


export async function GET(req: NextRequest) {
  try {
    const ctx = await requireOrg();
    const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;
    const { searchParams } = new URL(req.url);
    const filters = dealFiltersSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, sortBy, sortOrder, stage, commodity, direction, counterpartyId, assignedUserId, search } = filters;

    const stages = stage ? stage.split(",") : undefined;
    const commodities = commodity ? commodity.split(",") : undefined;

    const where = {
      organizationId: orgId,
      ...(stages ? { stage: { in: stages as DealStage[] } } : {}),
      ...(commodities ? { commodity: { in: commodities as never[] } } : {}),
      ...(direction ? { direction: direction as never } : {}),
      ...(counterpartyId ? { counterpartyId } : {}),
      ...(assignedUserId ? { assignedUserId } : {}),
      ...(search
        ? {
            OR: [
              { dealNumber: { contains: search, mode: "insensitive" as const } },
              { counterparty: { name: { contains: search, mode: "insensitive" as const } } },
              { deliveryPoint: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          counterparty: { select: { id: true, name: true, shortName: true, type: true, creditRating: true } },
          assignedUser: { select: { id: true, name: true, avatarUrl: true } },
          milestones: { orderBy: { enteredAt: "asc" } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.deal.count({ where }),
    ]);

    return NextResponse.json({
      data: deals,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireOrg();
    if (isAuthError(ctx)) return ctx;
    const { organizationId, userId } = ctx;

    const body = await req.json();
    const input = createDealSchema.parse(body);

    // Auto-set probability based on stage
    const probability = input.probability ?? STAGE_PROBABILITY_MAP[input.stage as DealStage] ?? 10;

    // Get next sequence number
    const count = await prisma.deal.count({ where: { organizationId } });
    const dealNumber = generateDealNumber(count + 1);

    // Compute notional
    const price = input.fixedPrice ?? 0;
    const totalNotionalValue = input.volume * price;
    const weightedValue = totalNotionalValue * probability / 100;

    const deal = await prisma.deal.create({
      data: {
        organizationId,
        dealNumber,
        counterpartyId: input.counterpartyId,
        assignedUserId: input.assignedUserId ?? userId,
        direction: input.direction,
        commodity: input.commodity,
        deliveryPoint: input.deliveryPoint,
        product: input.product,
        startDate: input.startDate,
        endDate: input.endDate,
        volume: input.volume,
        volumeUnit: input.volumeUnit,
        priceType: input.priceType,
        fixedPrice: input.fixedPrice,
        indexName: input.indexName,
        indexAdjustment: input.indexAdjustment,
        currency: input.currency,
        totalNotionalValue,
        weightedValue,
        stage: input.stage,
        probability,
        source: input.source,
        brokerName: input.brokerName,
        brokerFee: input.brokerFee,
        internalNotes: input.internalNotes,
        externalNotes: input.externalNotes,
        tags: input.tags ?? [],
      },
      include: {
        counterparty: true,
        assignedUser: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Create initial milestone
    await prisma.dealMilestone.create({
      data: { dealId: deal.id, stage: input.stage, enteredAt: new Date() },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        organizationId,
        dealId: deal.id,
        counterpartyId: input.counterpartyId,
        userId: input.assignedUserId ?? userId,
        type: "SYSTEM",
        title: `Deal ${dealNumber} created`,
        description: `${input.direction} ${input.commodity.replace(/_/g, " ")} deal created`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: { stage: input.stage } as any,
      },
    });

    return NextResponse.json({ data: deal }, { status: 201 });
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes("ZodError")) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
