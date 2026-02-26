import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Store tokens in memory (fine for local/demo; swap for Redis in production)
export const impersonationTokens = new Map<string, { userId: string; expiresAt: number }>();

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await request.json();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const token     = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  impersonationTokens.set(token, { userId: user.id, expiresAt });

  // Log it
  await prisma.activity.create({
    data: {
      type:           "NOTE",
      description:    `SUPERADMIN generated impersonation token for user ${user.email}`,
      organizationId: (await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } }))!.organizationId!,
      userId:         session.user.id,
    },
  }).catch(() => {}); // non-blocking

  return NextResponse.json({ token });
}
