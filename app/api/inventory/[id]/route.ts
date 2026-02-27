import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: params.id, organizationId: session.user.organizationId },
    include: { salesDeals: { include: { customer: true }, take: 5 } },
  });

  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vehicle });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const vehicle = await prisma.vehicle.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json({ vehicle });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.vehicle.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
