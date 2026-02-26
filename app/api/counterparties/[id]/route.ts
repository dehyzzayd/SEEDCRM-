import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { updateCounterpartySchema } from "@/lib/validators/counterparty";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const cp = await prisma.counterparty.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      contacts: true,
      _count: { select: { deals: true, contracts: true } },
    },
  });
  if (!cp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: cp });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;
  const { organizationId } = ctx;

  const body  = await req.json();
  const input = updateCounterpartySchema.parse(body);

  const existing = await prisma.counterparty.findFirst({
    where: { id: params.id, organizationId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cp = await prisma.counterparty.update({
    where: { id: params.id },
    data:  input,
  });
  return NextResponse.json({ data: cp });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;
  await prisma.counterparty.deleteMany({ where: { id: params.id, organizationId: orgId } });
  return NextResponse.json({ data: { deleted: true } });
}
