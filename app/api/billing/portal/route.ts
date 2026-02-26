import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") {
    throw new Error("Stripe not configured. Add STRIPE_SECRET_KEY to .env.");
  }
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" });
}

export async function POST(req: NextRequest) {
  void req;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: (session.user as Record<string, string>).organizationId },
    });

    if (!org?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe first." },
        { status: 400 }
      );
    }

    const stripe  = getStripe();
    const appUrl  = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   org.stripeCustomerId,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    console.error("[billing/portal]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
