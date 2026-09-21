import { NextRequest } from "next/server";
import { db } from "@/db";
import { deals, orders, orderHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markOrderPaid, refundOrder } from "@/lib/orderLifecycle";
import { retrievePaymentIntentStatus } from "@/lib/payments";
import { withCors, preflight } from "@/lib/apiAccess";
import { sourceSellableForDeal } from "@/lib/sourceCertification";
import { getMonetizationSettings, resolveRail } from "@/lib/monetization";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * Client fallback after a successful confirm, and the manual refund action.
 * Idempotent: if the webhook already marked the order paid, this is a no-op.
 * (The webhook remains the source of truth; this keeps UX correct when webhooks
 * are not reachable, e.g. local dev / preview.)
 */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const orderId = Number(id);
    const body = await request.json().catch(() => ({}));

    const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = rows[0];
    if (!order) return withCors(request, { success: false, error: "Order not found" }, { status: 404 });

    if (body.action === "refund") {
      const res = await refundOrder(orderId, String(body.reason || "The partner could not fulfill this order."));
      return withCors(request, { success: res.ok, ...res });
    }

    // Already-paid reconciliation is idempotent and must NEVER be blocked by a
    // source change that happened after authorization/capture.
    if (order.paymentStatus === "refunded" || order.paymentStatus === "cancelled") {
      return withCors(request, { success: false, error: "This order is no longer payable." }, { status: 409 });
    }

    if (order.stripePaymentIntentId) {
      // Real/simulated PaymentIntent exists: verify provider status, then
      // reconcile even if the source was blocked after auth. Otherwise money
      // succeeds at Stripe while our order remains orphaned.
      const status = await retrievePaymentIntentStatus(order.stripePaymentIntentId);
      if (status !== "succeeded" && status !== "processing" && status !== "requires_capture") {
        return withCors(request, { success: false, error: `Payment not complete (${status}).` }, { status: 409 });
      }
    } else if (order.paymentStatus !== "paid") {
      // No PaymentIntent: this is the simulation fallback only. It represents a
      // NEW payment, so run the same live source/rail guard before marking paid.
      if (order.paymentProvider !== "simulation") {
        return withCors(request, { success: false, error: "Waiting for the verified payment webhook." }, { status: 409 });
      }
      const [deal] = await db.select().from(deals).where(eq(deals.id, order.dealId)).limit(1);
      if (!deal) return withCors(request, { success: false, error: "Deal not found." }, { status: 404 });
      const sourceGate = await sourceSellableForDeal(deal);
      if (!sourceGate.sellable) {
        return withCors(request, { success: false, code: "SOURCE_NOT_CERTIFIED", error: "This deal is unavailable." }, { status: 409 });
      }
      const rail = resolveRail(deal, await getMonetizationSettings(), sourceGate.source);
      if (rail.rail !== "reseller" && !rail.resellerSecondary) {
        return withCors(request, { success: false, code: "AFFILIATE_ONLY",
          error: "This deal is purchased directly at the retailer.", redirectPath: `/api/go/${deal.id}` }, { status: 409 });
      }
    }

    const result = await markOrderPaid({
      orderId,
      paymentIntentId: order.stripePaymentIntentId || undefined,
      method: body.method || order.paymentMethod,
      last4: body.last4,
    });
    if (!result.ok) return withCors(request, { success: false, error: "Unable to finalize order" }, { status: 500 });

    const fresh = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const history = await db.select().from(orderHistory).where(eq(orderHistory.orderId, orderId)).orderBy(orderHistory.timestamp);
    const { retailer: _r, retailerOrderId: _ro, retailerBotLog: _rb, sourceName: _sn, sourceLastSeenPrice: _sp, ...publicOrder } = fresh[0];

    return withCors(request, { success: true, order: { ...publicOrder,
      dealPrice: publicOrder.quotedSellPrice ?? (Number(publicOrder.dealPrice) + Number(publicOrder.serviceFee)).toFixed(2), serviceFee: "0.00", history } });
  } catch (error) {
    console.error("finalize failed", error);
    return withCors(request, { success: false, error: "Unable to finalize order" }, { status: 500 });
  }
}
