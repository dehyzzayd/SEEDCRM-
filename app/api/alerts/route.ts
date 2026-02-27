import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const pageSize   = parseInt(searchParams.get("pageSize") ?? "20");

  const alerts = await prisma.alert.findMany({
    where: {
      userId:         session.user.id,
      organizationId: session.user.organizationId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: "desc" },
    take: pageSize,
  });

  const total = await prisma.alert.count({
    where: {
      userId:         session.user.id,
      organizationId: session.user.organizationId,
      isRead: false,
    },
  });

  return NextResponse.json({ alerts, total });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { alertId, markAllRead } = await request.json();

  if (markAllRead) {
    await prisma.alert.updateMany({
      where: { userId: session.user.id, isRead: false },
      data:  { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  if (alertId) {
    await prisma.alert.update({
      where: { id: alertId },
      data:  { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
