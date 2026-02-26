import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createContractSchema = z.object({
  counterpartyId:   z.string(),
  dealId:           z.string().optional().nullable(),
  contractNumber:   z.string().min(1),
  type:             z.enum(["ISDA_MASTER","NAESB","PPA","CUSTOM","AMENDMENT"]),
  status:           z.enum(["DRAFT","ACTIVE","EXPIRED","TERMINATED"]).default("DRAFT"),
  effectiveDate:    z.string().transform(s => new Date(s)),
  expirationDate:   z.string().optional().nullable().transform(s => s ? new Date(s) : null),
  autoRenew:        z.boolean().default(false),
  noticePeriodDays: z.number().default(30),
  alertDaysBefore:  z.number().default(30),
  keyTerms:         z.record(z.unknown()).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const { searchParams } = new URL(req.url);
  const page           = parseInt(searchParams.get("page")      ?? "1");
  const pageSize       = parseInt(searchParams.get("pageSize")  ?? "25");
  const status         = searchParams.get("status");
  const counterpartyId = searchParams.get("counterpartyId");
  const expiringDays   = searchParams.get("expiringDays");
  const now            = new Date();

  const where = {
    organizationId: orgId,
    ...(status         ? { status: status as never } : {}),
    ...(counterpartyId ? { counterpartyId } : {}),
    ...(expiringDays   ? {
      expirationDate: {
        gte: now,
        lte: new Date(now.getTime() + parseInt(expiringDays) * 86400000),
      },
    } : {}),
  };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      include: {
        counterparty: { select: { id: true, name: true, shortName: true } },
        deal:         { select: { id: true, dealNumber: true } },
      },
      orderBy: { expirationDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contract.count({ where }),
  ]);

  return NextResponse.json({ data: contracts, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } });
}

export async function POST(req: NextRequest) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;
  const { organizationId } = ctx;

  const body  = await req.json();
  const input = createContractSchema.parse(body);
  const { keyTerms, ...rest } = input;

  const contract = await prisma.contract.create({
    data: {
      ...rest,
      organizationId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keyTerms: keyTerms as any,
    },
    include: { counterparty: { select: { id: true, name: true, shortName: true } } },
  });
  return NextResponse.json({ data: contract }, { status: 201 });
}
