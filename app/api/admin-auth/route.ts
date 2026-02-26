import { NextResponse } from "next/server";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const validEmail    = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return NextResponse.json(
      { error: "Admin credentials not configured in .env" },
      { status: 500 }
    );
  }

  if (email !== validEmail || password !== validPassword) {
    // Artificial delay to prevent brute force
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token    = await signAdminToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "strict",
    path:      "/admin",
    maxAge:    12 * 60 * 60, // 12 hours
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
