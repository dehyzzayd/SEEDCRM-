/**
 * Shared helper for API routes: extracts the authenticated user's organizationId.
 * Falls back to the demo org for the seeded Meridian workspace so existing
 * demo data keeps working when running the app locally without a live session.
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const DEMO_ORG_ID = "org_meridian";
export const DEMO_USER_ID = "user_zayd";

export type OrgContext = {
  organizationId: string;
  userId: string;
};

/**
 * Returns { organizationId, userId } for the current request.
 * Returns a 401 NextResponse if no session exists.
 */
export async function requireOrg(): Promise<OrgContext | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const u = session.user as Record<string, string>;
  return {
    organizationId: u.organizationId ?? DEMO_ORG_ID,
    userId:         u.id             ?? DEMO_USER_ID,
  };
}

/** Type-guard: returns true if the value is a NextResponse (auth error) */
export function isAuthError(v: OrgContext | NextResponse): v is NextResponse {
  return v instanceof NextResponse;
}
