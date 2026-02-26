import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const contract = await prisma.contract.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      counterparty: true,
      deal: { select: { id: true, dealNumber: true } },
    },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: contract });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireOrg();
  if (isAuthError(ctx)) return ctx;
  const { organizationId } = ctx;

  const existing = await prisma.contract.findFirst({ where: { id: params.id, organizationId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body     = await req.json();
  const contract = await prisma.contract.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ data: contract });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;
  await prisma.contract.deleteMany({ where: { id: params.id, organizationId: orgId } });
  return NextResponse.json({ data: { deleted: true } });
}
