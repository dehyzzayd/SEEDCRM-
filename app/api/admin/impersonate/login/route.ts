import { NextResponse } from "next/server";
import { impersonationTokens } from "../route";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const entry = impersonationTokens.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 401 });
  }

  impersonationTokens.delete(token); // one-time use

  const user = await prisma.user.findUnique({
    where: { id: entry.userId },
    include: { organization: { select: { id: true, name: true, subscriptionTier: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const jwt = await encode({
    token: {
      sub:            user.id,
      id:             user.id,
      email:          user.email,
      name:           user.name,
      role:           user.role,
      organizationId: user.organizationId,
      orgName:        user.organization?.name,
      tier:           user.organization?.subscriptionTier,
      impersonating:  true,
    },
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("next-auth.session-token", jwt, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   3600,
  });
  return response;
}
