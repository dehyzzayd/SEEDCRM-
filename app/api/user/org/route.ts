import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.user.findMany({
    where:   { organizationId: session.user.organizationId },
    select:  { name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ members });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { name, timezone, currency } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  }

  const org = await prisma.organization.update({
    where: { id: session.user.organizationId },
    data: {
      name: name.trim(),
      ...(timezone && { timezone }),
      ...(currency && { currency }),
    },
    select: { id: true, name: true },
  });

  return NextResponse.json({ success: true, org });
}
