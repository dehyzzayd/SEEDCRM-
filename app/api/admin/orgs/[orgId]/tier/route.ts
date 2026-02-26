import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tier } = await request.json();
  const validTiers = ["FREE", "PRO", "ENTERPRISE"];
  if (!validTiers.includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const org = await prisma.organization.update({
    where: { id: params.orgId },
    data: { subscriptionTier: tier },
  });

  return NextResponse.json({ success: true, tier: org.subscriptionTier });
}
