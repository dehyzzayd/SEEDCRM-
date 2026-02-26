import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Price ID map — replace with real Stripe Price IDs from your dashboard
const PRICE_IDS: Record<string, string> = {
  PRO:        process.env.STRIPE_PRICE_PRO_MONTHLY        ?? "",
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.");
  }
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json() as { tier: string };
    const priceId  = PRICE_IDS[tier];

    if (!priceId || priceId === "") {
      return NextResponse.json(
        { error: "Stripe Price ID not configured for this plan. Add it to .env and Stripe dashboard." },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    const org = await prisma.organization.findUnique({
      where: { id: (session.user as Record<string, string>).organizationId },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name:  org.name,
        metadata: {
          organizationId: org.id,
          userId:         session.user.id!,
        },
      });
      customerId = customer.id;

      await prisma.organization.update({
        where: { id: org.id },
        data:  { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer:             customerId,
      payment_method_types: ["card"],
      mode:                 "subscription",
      line_items: [
        { price: priceId, quantity: 1 },
      ],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url:  `${appUrl}/checkout?tier=${tier}&cancelled=true`,
      metadata: {
        organizationId: org.id,
        tier,
      },
      subscription_data: {
        metadata: {
          organizationId: org.id,
          tier,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
