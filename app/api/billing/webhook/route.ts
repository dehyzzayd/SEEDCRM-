import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";


function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") {
    throw new Error("Stripe not configured");
  }
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret === "whsec_placeholder") {
    console.warn("[webhook] STRIPE_WEBHOOK_SECRET not set — skipping verification");
    return NextResponse.json({ received: true });
  }

  const sig  = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Subscription created or renewed
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId   = session.metadata?.organizationId;
        const tier    = session.metadata?.tier;

        if (orgId && tier) {
          await prisma.organization.update({
            where: { id: orgId },
            data:  { subscriptionTier: tier as "FREE" | "PRO" | "ENTERPRISE" },
          });
          console.log(`[webhook] Upgraded org ${orgId} to ${tier}`);
        }
        break;
      }

      // Subscription cancelled / expired → downgrade to FREE
      case "customer.subscription.deleted": {
        const sub     = event.data.object as Stripe.Subscription;
        const orgId   = sub.metadata?.organizationId;

        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data:  { subscriptionTier: "FREE" },
          });
          console.log(`[webhook] Downgraded org ${orgId} to FREE`);
        }
        break;
      }

      // Subscription updated (e.g., plan change)
      case "customer.subscription.updated": {
        const sub   = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.organizationId;
        const tier  = sub.metadata?.tier;

        if (orgId && tier) {
          await prisma.organization.update({
            where: { id: orgId },
            data:  { subscriptionTier: tier as "FREE" | "PRO" | "ENTERPRISE" },
          });
          console.log(`[webhook] Updated org ${orgId} to ${tier}`);
        }
        break;
      }

      // Payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[webhook] Payment failed for customer ${invoice.customer}`);
        // TODO: send email alert to org admin
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
