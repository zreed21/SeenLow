import { db } from "@/db";
import { orders, orderHistory, notifications, deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { refundPaymentIntent } from "@/lib/payments";
import { estimateProcessingFeeCents, toCents } from "./pricing";
import { quoteForDeal } from "./quote";
import { recordPriceObservation } from "./priceObservations";
import { recordSkuOutcome } from "./skuHealth";

/**
 * Order state transitions. Payment state and fulfillment state are SEPARATE:
 * money is frozen on payment success; the partner buy is its own lifecycle that
 * can be held or reversed without touching the captured amount.
 *
 * Every function here is idempotent so the Stripe webhook and the client
 * fallback can both call it safely.
 */

export async function markOrderPaid(opts: {
  orderId: number;
  paymentIntentId?: string;
  checkoutSessionId?: string;
  amountPaidCents?: number;
  method?: string;
  last4?: string;
}) {
  const rows = await db.select().from(orders).where(eq(orders.id, opts.orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false, reason: "not_found" as const };
  if (order.paidAmountFrozen !== null || order.paymentStatus === "paid") return { ok: true, idempotent: true, order };

  // Freeze the paid amount: this is the number that matters in a dispute.
  const frozen = opts.amountPaidCents != null
    ? (opts.amountPaidCents / 100).toFixed(2)
    : order.totalAmount;

  const [updated] = await db.update(orders).set({
    paymentStatus: "paid",
    paidAmountFrozen: frozen,
    stripeFeeUsd: order.stripeFeeUsd ?? (estimateProcessingFeeCents(toCents(frozen)) / 100).toFixed(2),
    paidAt: new Date(),
    paymentMethod: opts.method || order.paymentMethod || "card",
    paymentCardLast4: opts.last4 || order.paymentCardLast4,
    paymentTransactionId: opts.paymentIntentId || order.paymentTransactionId,
    stripePaymentIntentId: opts.paymentIntentId || order.stripePaymentIntentId,
    stripeCheckoutSessionId: opts.checkoutSessionId || order.stripeCheckoutSessionId,
    dropshipStatus: "retailer_order_placed",
    blindShippingRequestedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(orders.id, opts.orderId)).returning();

  const now = new Date();
  await db.insert(orderHistory).values([
    {
      orderId: order.id,
      status: "payment_received",
      title: "Payment Confirmed",
      description: `Payment of $${frozen} was captured successfully.`,
      location: "Secure Payment Gateway",
      timestamp: now,
    },
    {
      orderId: order.id,
      status: "retailer_order_placed",
      title: "Order Confirmed & Preparing",
      description: "Your item is confirmed and being prepared for shipment.",
      location: "Order Processing",
      timestamp: new Date(now.getTime() + 1200),
    },
  ]);

  // Decrement availability once, on payment.
  const dealRows = await db.select().from(deals).where(eq(deals.id, order.dealId)).limit(1);
  if (dealRows[0]) {
    const address = JSON.parse(order.shippingAddress || "{}");
    const afterSaleQuote = { ok: true as const, deal: dealRows[0], ...quoteForDeal(dealRows[0], address.state || "CA", Number(order.quotedSellPrice || 0)) };
    await recordPriceObservation("after_sale", afterSaleQuote, { orderId: order.id,
      available: dealRows[0].stockQuantity > 0 && !["sold_out", "expired"].includes(dealRows[0].stockStatus), evidence: { paidAmount: frozen } });
    const left = Math.max(0, (dealRows[0].stockQuantity || 1) - 1);
    await db.update(deals).set({
      stockQuantity: left,
      stockStatus: left === 0 ? "sold_out" : left < 3 ? "low_stock" : "in_stock",
      isTop50: left === 0 ? false : dealRows[0].isTop50,
      updatedAt: new Date(),
    }).where(eq(deals.id, order.dealId));
  }

  await recordSkuOutcome({ dealId: order.dealId, orderId: order.id, type: "paid" });

  await db.insert(notifications).values({
    userId: order.userId,
    title: `🎉 Order #${order.orderNumber} Confirmed!`,
    message: `Your order is confirmed. You saved $${Number(order.customerSavings).toFixed(2)}.`,
    type: "order_shipped",
    isRead: false,
    link: "/orders",
  });

  return { ok: true, order: updated };
}

/** Pause the partner buy / shipment (dispute, early fraud warning, refund). */
export async function holdFulfillment(orderId: number, reason: string, extra: Partial<typeof orders.$inferInsert> = {}) {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false };

  await db.update(orders).set({ fulfillmentHold: true, holdReason: reason, updatedAt: new Date(), ...extra })
    .where(eq(orders.id, orderId));

  await db.insert(orderHistory).values({
    orderId,
    status: "hold",
    title: "Fulfillment Paused",
    description: reason,
    location: "Risk Review",
    timestamp: new Date(),
  });

  return { ok: true, alreadyPurchased: order.partnerPurchased };
}

/**
 * Refund — full or partial.
 * Full: partner OOS/cancelled after payment. No IOUs.
 * Partial: one item in a split shipment failed (amountUsd < total).
 */
export async function refundOrder(orderId: number, reason: string, amountUsd?: number, actor = "agent") {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false, error: "Order not found" };

  const alreadyRefunded = Number(order.refundAmount || 0);
  const paid = Number(order.paidAmountFrozen || order.totalAmount);
  const alreadyPaidOut = Number(order.partnerPurchasePrice || 0);

  // Partial refund requested?
  const isPartial = amountUsd != null && amountUsd > 0 && amountUsd < paid - alreadyRefunded;
  if (!isPartial && order.paymentStatus === "refunded") return { ok: true, idempotent: true };

  const refundAmount = isPartial ? Number(amountUsd) : paid - alreadyRefunded;
  if (refundAmount <= 0) return { ok: false, error: "Nothing left to refund." };

  if (order.stripePaymentIntentId) {
    await refundPaymentIntent(order.stripePaymentIntentId, {
      amountCents: Math.round(refundAmount * 100),
      reason: isPartial ? "requested_by_customer" : "requested_by_customer",
    });
  }

  await db.update(orders).set({
    paymentStatus: isPartial ? "partially_refunded" : "refunded",
    refundedAt: new Date(),
    refundAmount: (alreadyRefunded + refundAmount).toFixed(2),
    // Partner already bought? Keep the hold so nobody ships a refunded line.
    dropshipStatus: isPartial ? order.dropshipStatus : "cancelled",
    fulfillmentHold: true,
    holdReason: reason,
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId));

  await db.insert(orderHistory).values({
    orderId,
    status: isPartial ? "partial_refund" : "cancelled",
    title: isPartial ? "Partial Refund Issued" : "Order Cancelled & Refunded",
    description: isPartial
      ? `${reason} A partial refund of $${refundAmount.toFixed(2)} has been issued to your original payment method.`
      : `${reason} A refund of $${refundAmount.toFixed(2)} has been issued to your original payment method.`,
    location: "Refunds",
    timestamp: new Date(),
  });

  await db.insert(notifications).values({
    userId: order.userId,
    title: `Order #${order.orderNumber} ${isPartial ? "partially refunded" : "refunded"}`,
    message: `${reason} ${isPartial ? `$${refundAmount.toFixed(2)} has been refunded.` : "You have been refunded."}`,
    type: "system",
    isRead: false,
    link: "/orders",
  });

  return { ok: true, refundAmount, isPartial, partnerAlreadyPurchased: alreadyPaidOut > 0 };
}
