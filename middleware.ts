import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/pricing",
  "/checkout",
  "/api/auth",
  "/api/billing/webhook",
  "/api/warmup",
  "/sys-warmup",
  "/favicon.ico",
  "/admin-login",
  "/api/admin-auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  )) {
    return NextResponse.next();
  }

  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    const valid = await verifyAdminToken(adminToken);
    if (!valid) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    return NextResponse.next();
  }

  const token = await getToken({
    req:    request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico).*)"],
};
