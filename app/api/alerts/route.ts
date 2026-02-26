import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID, DEMO_USER_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ctx    = await requireOrg();
  const orgId  = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;
  const userId = isAuthError(ctx) ? DEMO_USER_ID : ctx.userId;

  const { searchParams } = new URL(req.url);
  const pageSize   = parseInt(searchParams.get("pageSize") ?? "20");
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const where = {
    organizationId: orgId,
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
    }),
    prisma.alert.count({ where }),
  ]);

  return NextResponse.json({ data: alerts, meta: { total, page: 1, pageSize, totalPages: 1 } });
}

export async function PATCH(req: NextRequest) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const { ids } = await req.json();
  if (!Array.isArray(ids)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.alert.updateMany({
    where: { id: { in: ids }, organizationId: orgId },
    data:  { isRead: true, readAt: new Date() },
  });

  return NextResponse.json({ data: { updated: ids.length } });
}
