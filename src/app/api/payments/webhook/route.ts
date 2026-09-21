import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments";
import { markOrderPaid, holdFulfillment, refundOrder } from "@/lib/orderLifecycle";

/**
 * Single Stripe webhook for BOTH the app and the website (one Stripe account).
 * Signature is always verified server-side.
 *
 * Handled:
 *   checkout.session.completed        → create paid order (website Checkout)
 *   payment_intent.succeeded          → create paid order (app Payment Sheet)
 *   payment_intent.payment_failed     → leave cart unpaid
 *   charge.refunded                   → stop partner buy / stop shipping
 *   charge.dispute.created            → stop partner buy / stop shipping
 *   radar.early_fraud_warning.created → pause fulfillment
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ received: true, mode: "simulation" });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature || "", secret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const orderIdFrom = (meta?: Stripe.Metadata | null) => Number(meta?.order_id || 0);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const orderId = orderIdFrom(s.metadata);
        if (orderId) {
          await markOrderPaid({
            orderId,
            checkoutSessionId: s.id,
            paymentIntentId: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id,
            amountPaidCents: s.amount_total ?? undefined,
            method: "checkout",
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = orderIdFrom(pi.metadata);
        if (orderId) {
          await markOrderPaid({
            orderId,
            paymentIntentId: pi.id,
            amountPaidCents: pi.amount_received ?? pi.amount,
            method: pi.payment_method_types?.[0] || "card",
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        // Leave the cart unpaid. Nothing to reverse, nothing to fulfill.
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed for order", pi.metadata?.order_id, pi.last_payment_error?.message);
        break;
      }

      case "charge.refunded": {
        const ch = event.data.object as Stripe.Charge;
        const orderId = orderIdFrom(ch.metadata);
        if (orderId) await holdFulfillment(orderId, "Payment refunded — do not purchase from partner or ship.", { paymentStatus: "refunded", refundedAt: new Date() });
        break;
      }

      case "charge.dispute.created": {
        const d = event.data.object as Stripe.Dispute;
        const meta = (d.payment_intent && typeof d.payment_intent !== "string" ? d.payment_intent.metadata : null) || d.metadata;
        const orderId = orderIdFrom(meta);
        if (orderId) await holdFulfillment(orderId, "Chargeback opened — fulfillment stopped pending dispute review.", { disputeStatus: d.status });
        break;
      }

      case "radar.early_fraud_warning.created": {
        const efw = event.data.object as Stripe.Radar.EarlyFraudWarning;
        const pi = efw.payment_intent;
        let orderId = 0;
        if (pi && typeof pi !== "string") orderId = orderIdFrom(pi.metadata);
        else if (typeof pi === "string") {
          const retrieved = await stripe.paymentIntents.retrieve(pi);
          orderId = orderIdFrom(retrieved.metadata);
        }
        if (orderId) await holdFulfillment(orderId, "Early fraud warning received — fulfillment paused for review.", { earlyFraudWarning: true });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", event.type, err);
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
