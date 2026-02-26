import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_COOKIE = "dehy-admin-token";
const secret       = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-min-32-chars-long!!"
);

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token       = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export { ADMIN_COOKIE };
