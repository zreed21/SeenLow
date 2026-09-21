import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildQuote, orderQuoteFields } from "@/lib/quote";
import { paymentQuoteConflict } from "@/lib/paymentQuote";
import { createCheckoutSession, type PaymentMetadata } from "@/lib/payments";
import { withCors, preflight, isAuthorized } from "@/lib/apiAccess";
import { recordPriceObservation } from "@/lib/priceObservations";
import { getMonetizationSettings, resolveRail } from "@/lib/monetization";
import { sourceSellableForDeal } from "@/lib/sourceCertification";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * Stripe Checkout Session for the WEBSITE (same Stripe account as the app).
 *
 *   ui_mode: "hosted"   → fastest, redirect to Stripe
 *   ui_mode: "embedded" → keeps the customer on your domain
 *
 * Stripe collects the shipping address (shipping_address_collection); that
 * address is what the partner order must use. Same metadata + idempotency as
 * the in-app PaymentIntent, so disputes look identical across both rails.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return withCors(request, { success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = Number(body.orderId);
    if (!orderId) {
      return withCors(request, { success: false, error: "orderId is required (call /api/orders/init first)" }, { status: 400 });
    }

    const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = rows[0];
    if (!order) return withCors(request, { success: false, error: "Order not found" }, { status: 404 });
    if (order.paymentStatus !== "pending") {
      return withCors(request, { success: false, code: "ALREADY_PAID", error: "Only an unpaid pending order can start a payment." }, { status: 409 });
    }

    const address = JSON.parse(order.shippingAddress || "{}");
    const quote = await buildQuote(order.dealId, address.state || "CA", Number(order.quotedSellPrice || 0));
    if (!quote.ok) return withCors(request, { success: false, code: quote.code, error: quote.error }, { status: 409 });

    {
      const sourceGate = await sourceSellableForDeal(quote.deal);
      if (!sourceGate.sellable) {
        return withCors(request, { success: false, code: "SOURCE_NOT_CERTIFIED",
          error: "This deal is unavailable." }, { status: 409 });
      }
      const decision = resolveRail(quote.deal, await getMonetizationSettings(), sourceGate.source);
      if (decision.rail !== "reseller" && !decision.resellerSecondary) {
        return withCors(request, { success: false, code: "AFFILIATE_ONLY",
          error: "Stripe checkout is off for this deal — it is bought directly at the retailer.",
          redirectPath: `/api/go/${quote.deal.id}` }, { status: 409 });
      }
    }
    await recordPriceObservation("before_sale", quote, { orderId: order.id, evidence: { paymentRail: "checkout_session" } });
    const conflict = paymentQuoteConflict(order, quote, body.acceptedTotal);
    if (conflict) return withCors(request, conflict, { status: 409 });

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const metadata: PaymentMetadata = {
      order_id: String(order.id),
      order_number: order.orderNumber,
      customer_id: order.customerRef || order.userId,
      line_skus: order.lineSkus || `deal-${order.dealId} x1`,
      quoted_sell_price: quote.itemPrice.toFixed(2),
      source_last_seen_price: quote.deal.dealPrice,
      source_name: quote.deal.retailer,
      fulfillment_model: "partner_retailer",
      ship_to_hash: order.shipToHash || "",
      address_id: order.addressId || "",
    };

    const session = await createCheckoutSession({
      amountCents: quote.amountCents,       // OUR price
      productName: order.productTitle,
      metadata,
      customerEmail: order.userEmail,
      uiMode: body.uiMode === "embedded" ? "embedded" : "hosted",
      successUrl: String(body.successUrl || `${origin}/?order=${order.id}&paid=1`),
      cancelUrl: String(body.cancelUrl || `${origin}/?order=${order.id}&cancelled=1`),
    });

    await db.update(orders).set({
      stripeCheckoutSessionId: session.id,
      paymentProvider: session.provider,
      ...orderQuoteFields(quote),
      updatedAt: new Date(),
    }).where(eq(orders.id, order.id));

    return withCors(request, {
      success: true,
      orderId: order.id,
      provider: session.provider,
      sessionId: session.id,
      url: session.url,
      clientSecret: session.clientSecret,
      total: quote.total,
    });
  } catch (error) {
    console.error("create-session failed", error);
    return withCors(request, { success: false, error: "Unable to start checkout session" }, { status: 500 });
  }
}
