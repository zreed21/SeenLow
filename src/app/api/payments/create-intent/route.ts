import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildQuote, orderQuoteFields } from "@/lib/quote";
import { paymentQuoteConflict } from "@/lib/paymentQuote";
import { createPaymentIntent, ensureStripeCustomer, type PaymentMetadata } from "@/lib/payments";
import { withCors, preflight, isAuthorized } from "@/lib/apiAccess";
import { recordPriceObservation } from "@/lib/priceObservations";
import { getMonetizationSettings, resolveRail } from "@/lib/monetization";
import { sourceSellableForDeal } from "@/lib/sourceCertification";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * Step 2 of checkout: create the PaymentIntent for a pending order.
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

    // Already paid → never create a second intent.
    if (order.paymentStatus !== "pending") {
      return withCors(request, { success: false, code: "ALREADY_PAID", error: "Only an unpaid pending order can start a payment." }, { status: 409 });
    }

    const address = JSON.parse(order.shippingAddress || "{}");
    const quote = await buildQuote(order.dealId, address.state || "CA", Number(order.quotedSellPrice || 0));
    if (!quote.ok) {
      return withCors(request, { success: false, code: quote.code, error: quote.error }, { status: 409 });
    }

    // Source moved while they sat on the page → fail with the new total.
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
    await recordPriceObservation("before_sale", quote, { orderId: order.id, evidence: { paymentRail: "intent" } });
    const conflict = paymentQuoteConflict(order, quote, body.acceptedTotal);
    if (conflict) return withCors(request, conflict, { status: 409 });

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

    // Repeat buyers: reuse/attach a Stripe Customer
    const stripeCustomerId = await ensureStripeCustomer(order.userEmail).catch(() => null);

    const intent = await createPaymentIntent({
      amountCents: quote.amountCents,
      metadata,
      customerEmail: order.userEmail,
      customerId: stripeCustomerId || undefined,
      description: `SeenLow — order ${order.orderNumber}`,
    });

    // Persist the Stripe handle on our order
    await db.update(orders).set({
      stripePaymentIntentId: intent.paymentIntentId,
      paymentProvider: intent.provider,
      ...orderQuoteFields(quote),
      updatedAt: new Date(),
    }).where(eq(orders.id, order.id));

    return withCors(request, {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      provider: intent.provider,
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      publishableKey: intent.publishableKey,
      captureMethod: intent.captureMethod,
      statementDescriptor: intent.statementDescriptor,
      breakdown: {
        itemPrice: quote.itemPrice,
        shippingFee: quote.shippingFee,
        requiredProductFee: quote.requiredProductFee,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
      },
    });
  } catch (error) {
    console.error("create-intent failed", error);
    return withCors(request, { success: false, error: "Unable to start payment" }, { status: 500 });
  }
}
