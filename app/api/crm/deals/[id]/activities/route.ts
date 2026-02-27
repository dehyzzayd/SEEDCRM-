import { NextResponse }            from "next/server";
import { prisma }                  from "@/lib/prisma";
import { requireOrg, isAuthError } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  const deal = await prisma.salesDeal.findFirst({
    where: {
      id:             params.id,
      organizationId: ctx.organizationId,
    },
    select: { id: true },
  });

  if (!deal)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const activities = await prisma.activity.findMany({
    where: { salesDealId: params.id },
    include: {
      user: {
        select: {
          id:        true,
          name:      true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ activities });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  try {
    const body = await request.json();

    if (!body.title)
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 },
      );

    // Verify deal belongs to this org
    const deal = await prisma.salesDeal.findFirst({
      where: {
        id:             params.id,
        organizationId: ctx.organizationId,
      },
      select: { id: true, customerId: true },
    });

    if (!deal)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const activity = await prisma.activity.create({
      data: {
        organizationId: ctx.organizationId,
        salesDealId:    params.id,
        customerId:     deal.customerId,
        userId:         ctx.userId,
        type:           body.type        ?? "NOTE",
        title:          body.title,
        description:    body.description || null,
        metadata:       body.metadata    || null,
      },
      include: {
        user: {
          select: {
            id:        true,
            name:      true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/crm/deals/[id]/activities]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
