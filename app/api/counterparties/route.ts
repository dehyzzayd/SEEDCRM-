import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createCounterpartySchema } from "@/lib/validators/counterparty";

export async function GET(req: NextRequest) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const { searchParams } = new URL(req.url);
  const page      = parseInt(searchParams.get("page")      ?? "1");
  const pageSize  = parseInt(searchParams.get("pageSize")  ?? "25");
  const search    = searchParams.get("search")    ?? "";
  const type      = searchParams.get("type")      ?? "";
  const status    = searchParams.get("status")    ?? "";
  const sortBy    = searchParams.get("sortBy")    ?? "name";
  const sortOrder = (searchParams.get("sortOrder") ?? "asc") as "asc" | "desc";

  const where = {
    organizationId: orgId,
    ...(search ? {
      OR: [
        { name:      { contains: search, mode: "insensitive" as const } },
        { shortName: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(type   ? { type:   type   as never } : {}),
    ...(status ? { status: status as never } : {}),
  };

  const [counterparties, total] = await Promise.all([
    prisma.counterparty.findMany({
      where,
      include: {
        _count:   { select: { deals: true } },
        contacts: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: sortBy === "name"            ? { name: sortOrder }
             : sortBy === "creditLimit"     ? { creditLimit: sortOrder }
             : sortBy === "currentExposure" ? { currentExposure: sortOrder }
             : { name: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.counterparty.count({ where }),
  ]);

  return NextResponse.json({
    data: counterparties,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireOrg();
    if (isAuthError(ctx)) return ctx;
    const { organizationId } = ctx;

    const body  = await req.json();
    const input = createCounterpartySchema.parse(body);

    const cp = await prisma.counterparty.create({
      data: { ...input, organizationId },
    });

    return NextResponse.json({ data: cp }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create counterparty" }, { status: 500 });
  }
}
