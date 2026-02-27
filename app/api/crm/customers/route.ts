import { NextResponse }            from "next/server";
import { prisma }                  from "@/lib/prisma";
import { requireOrg, isAuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  const { searchParams } = new URL(request.url);
  const q          = searchParams.get("q")?.trim() ?? "";
  const leadSource = searchParams.get("leadSource") ?? "";
  const creditTier = searchParams.get("creditTier") ?? "";
  const sortBy     = searchParams.get("sortBy")  ?? "createdAt";
  const sortDir    = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const page       = Math.max(1, Number(searchParams.get("page")     ?? 1));
  const pageSize   = Math.min(100, Number(searchParams.get("pageSize") ?? 50));

  const where = {
    organizationId: ctx.organizationId,
    ...(leadSource && { leadSource: leadSource as any }),
    ...(creditTier && { creditTier }),
    ...(q && {
      OR: [
        { firstName: { contains: q, mode: "insensitive" as const } },
        { lastName:  { contains: q, mode: "insensitive" as const } },
        { email:     { contains: q, mode: "insensitive" as const } },
        { phone:     { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      select: {
        id:          true,
        firstName:   true,
        lastName:    true,
        email:       true,
        phone:       true,
        creditTier:  true,
        preApproved: true,
        leadSource:  true,
        tags:        true,
        createdAt:   true,
        updatedAt:   true,
        _count: {
          select: {
            salesDeals: true,
            activities: true,
          },
        },
      },
      orderBy: { [sortBy]: sortDir },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ customers, total, page, pageSize });
}

export async function POST(request: Request) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  try {
    const body = await request.json();

    if (!body.firstName || !body.lastName)
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 },
      );

    const customer = await prisma.customer.create({
      data: {
        organizationId:    ctx.organizationId,
        firstName:         body.firstName,
        lastName:          body.lastName,
        email:             body.email             || null,
        phone:             body.phone             || null,
        altPhone:          body.altPhone          || null,
        address:           body.address           || null,
        city:              body.city              || null,
        state:             body.state             || null,
        zip:               body.zip               || null,
        creditTier:        body.creditTier        || null,
        preApproved:       body.preApproved       ?? false,
        preApprovedAmount: body.preApprovedAmount
          ? Number(body.preApprovedAmount)
          : null,
        preApprovedLender: body.preApprovedLender || null,
        leadSource:        body.leadSource        || "WALK_IN",
        referredBy:        body.referredBy        || null,
        notes:             body.notes             || null,
        tags:              Array.isArray(body.tags) ? body.tags : [],
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/crm/customers]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
