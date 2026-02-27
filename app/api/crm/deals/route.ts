import { NextResponse }            from "next/server";
import { prisma }                  from "@/lib/prisma";
import { requireOrg, isAuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  const { searchParams } = new URL(request.url);
  const q        = searchParams.get("q")?.trim() ?? "";
  const stage    = searchParams.get("stage")    ?? "";
  const assignee = searchParams.get("assignee") ?? "";
  const sortBy   = searchParams.get("sortBy")   ?? "createdAt";
  const sortDir  = searchParams.get("sortDir")  === "asc" ? "asc" : "desc";
  const page     = Math.max(1,   Number(searchParams.get("page")     ?? 1));
  const pageSize = Math.min(200, Number(searchParams.get("pageSize") ?? 100));

  const where = {
    organizationId: ctx.organizationId,
    ...(stage    && { stage:          stage    as any }),
    ...(assignee && { assignedUserId: assignee }),
    ...(q && {
      OR: [
        { dealNumber: { contains: q, mode: "insensitive" as const } },
        { customer:   { firstName: { contains: q, mode: "insensitive" as const } } },
        { customer:   { lastName:  { contains: q, mode: "insensitive" as const } } },
        { vehicle:    { make:        { contains: q, mode: "insensitive" as const } } },
        { vehicle:    { model:       { contains: q, mode: "insensitive" as const } } },
        { vehicle:    { stockNumber: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [deals, total] = await Promise.all([
    prisma.salesDeal.findMany({
      where,
      include: {
        customer: {
          select: {
            id:        true,
            firstName: true,
            lastName:  true,
            phone:     true,
            email:     true,
          },
        },
        vehicle: {
          select: {
            id:          true,
            year:        true,
            make:        true,
            model:       true,
            trim:        true,
            stockNumber: true,
            imageUrls:   true,
          },
        },
        assignedUser: {
          select: {
            id:        true,
            name:      true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { activities: true },
        },
      },
      orderBy: { [sortBy]: sortDir },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.salesDeal.count({ where }),
  ]);

  return NextResponse.json({ deals, total, page, pageSize });
}

export async function POST(request: Request) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  try {
    const body = await request.json();

    if (!body.customerId || !body.vehicleId)
      return NextResponse.json(
        { error: "customerId and vehicleId are required" },
        { status: 400 },
      );

    // Generate deal number
    const count = await prisma.salesDeal.count({
      where: { organizationId: ctx.organizationId },
    });
    const year       = new Date().getFullYear();
    const dealNumber = `LP-${year}-${String(count + 1).padStart(4, "0")}`;

    const deal = await prisma.salesDeal.create({
      data: {
        organizationId: ctx.organizationId,
        dealNumber,
        customerId:     body.customerId,
        vehicleId:      body.vehicleId,
        assignedUserId: body.assignedUserId ?? ctx.userId,
        stage:          body.stage          ?? "NEW_LEAD",
        leadSource:     body.leadSource     ?? "WALK_IN",
        probability:    body.probability    ?? 10,
        askingPrice:    body.askingPrice    ? Number(body.askingPrice) : 0,
        costBasis:      body.costBasis      ? Number(body.costBasis)   : 0,
        financeType:    body.financeType    ?? "CASH",
        hasTradeIn:     body.hasTradeIn     ?? false,
        internalNotes:  body.internalNotes  || null,
        tags:           Array.isArray(body.tags) ? body.tags : [],
      },
      include: {
        customer: {
          select: {
            id:        true,
            firstName: true,
            lastName:  true,
          },
        },
        vehicle: {
          select: {
            id:          true,
            year:        true,
            make:        true,
            model:       true,
            stockNumber: true,
          },
        },
        assignedUser: {
          select: {
            id:        true,
            name:      true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/crm/deals]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
