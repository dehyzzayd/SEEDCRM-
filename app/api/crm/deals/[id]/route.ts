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
    include: {
      customer:     true,
      vehicle:      true,
      assignedUser: {
        select: {
          id:        true,
          name:      true,
          avatarUrl: true,
          email:     true,
        },
      },
      contract:  true,
      tradeIn:   true,
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
      },
      alerts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!deal)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ deal });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;

  try {
    const body = await request.json();

    // Strip nested relation fields — only pass scalar columns
    const {
      customer, vehicle, assignedUser,
      contract, tradeIn, activities, alerts,
      ...scalars
    } = body;

    await prisma.salesDeal.updateMany({
      where: {
        id:             params.id,
        organizationId: ctx.organizationId,
      },
      data: {
        ...scalars,
        ...(scalars.askingPrice   !== undefined && { askingPrice:   Number(scalars.askingPrice)   }),
        ...(scalars.offerPrice    !== undefined && { offerPrice:    Number(scalars.offerPrice)    }),
        ...(scalars.salePrice     !== undefined && { salePrice:     Number(scalars.salePrice)     }),
        ...(scalars.costBasis     !== undefined && { costBasis:     Number(scalars.costBasis)     }),
        ...(scalars.frontEndGross !== undefined && { frontEndGross: Number(scalars.frontEndGross) }),
        ...(scalars.backEndGross  !== undefined && { backEndGross:  Number(scalars.backEndGross)  }),
        ...(scalars.totalGross    !== undefined && { totalGross:    Number(scalars.totalGross)    }),
        ...(scalars.downPayment   !== undefined && { downPayment:   Number(scalars.downPayment)   }),
        ...(scalars.loanAmount    !== undefined && { loanAmount:    Number(scalars.loanAmount)    }),
      },
    });

    const updated = await prisma.salesDeal.findFirst({
      where: {
        id:             params.id,
        organizationId: ctx.organizationId,
      },
      include: {
        customer:     { select: { id: true, firstName: true, lastName: true } },
        vehicle:      { select: { id: true, year: true, make: true, model: true, stockNumber: true } },
        assignedUser: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ deal: updated });
  } catch (err: any) {
    console.error("[PATCH /api/crm/deals/[id]]", err?.message);
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
    await prisma.salesDeal.deleteMany({
      where: {
        id:             params.id,
        organizationId: ctx.organizationId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/crm/deals/[id]]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
