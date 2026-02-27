import { NextResponse }            from "next/server";
import { prisma }                  from "@/lib/prisma";
import { requireOrg, isAuthError } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  const customer = await prisma.customer.findFirst({
    where: {
      id:             params.id,
      organizationId: ctx.organizationId,
    },
    include: {
      salesDeals: {
        include: {
          vehicle: {
            select: {
              year:        true,
              make:        true,
              model:       true,
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
        },
        orderBy: { createdAt: "desc" },
      },
      activities: {
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
        take:    50,
      },
    },
  });

  if (!customer)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ customer });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  try {
    const body = await request.json();

    await prisma.customer.updateMany({
      where: {
        id:             params.id,
        organizationId: ctx.organizationId,
      },
      data: {
        firstName:         body.firstName         ?? undefined,
        lastName:          body.lastName          ?? undefined,
        email:             body.email             ?? undefined,
        phone:             body.phone             ?? undefined,
        altPhone:          body.altPhone          ?? undefined,
        address:           body.address           ?? undefined,
        city:              body.city              ?? undefined,
        state:             body.state             ?? undefined,
        zip:               body.zip               ?? undefined,
        creditTier:        body.creditTier        ?? undefined,
        preApproved:       body.preApproved       ?? undefined,
        preApprovedAmount: body.preApprovedAmount
          ? Number(body.preApprovedAmount)
          : undefined,
        preApprovedLender: body.preApprovedLender ?? undefined,
        leadSource:        body.leadSource        ?? undefined,
        referredBy:        body.referredBy        ?? undefined,
        notes:             body.notes             ?? undefined,
        tags:              Array.isArray(body.tags) ? body.tags : undefined,
      },
    });

    const updated = await prisma.customer.findFirst({
      where: { id: params.id, organizationId: ctx.organizationId },
    });

    return NextResponse.json({ customer: updated });
  } catch (err: any) {
    console.error("[PATCH /api/crm/customers/[id]]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  try {
    await prisma.customer.deleteMany({
      where: {
        id:             params.id,
        organizationId: ctx.organizationId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/crm/customers/[id]]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}