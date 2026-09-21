import { NextRequest } from "next/server";
import { evaluateAgentRefund } from "@/lib/agentGate";
import { refundOrder } from "@/lib/orderLifecycle";
import { withCors, preflight } from "@/lib/apiAccess";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { recordSkuOutcome } from "@/lib/skuHealth";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * Agent-refund helper with a hard cap. Above the cap a human must use the
 * dashboard. Never lets the agent touch a charge other than to refund it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = Number(body.orderId);
    const reason = String(body.reason || "The partner could not fulfill this order.");
    const amountUsd = body.amountUsd != null ? Number(body.amountUsd) : undefined;
    const actor = String(body.actor || "agent");

    if (!orderId) return withCors(request, { success: false, error: "orderId is required." }, { status: 400 });

    const decision = await evaluateAgentRefund(orderId, amountUsd ?? 0, actor);
    if (!decision.allowed) {
      return withCors(request, { success: false, allowed: false, reason: decision.reason, rules: decision.rules }, { status: 409 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    const result = await refundOrder(orderId, reason, amountUsd, actor);
    if (result.ok && order && /out of stock|could not fulfill|cancel/i.test(reason)) {
      await recordSkuOutcome({ dealId: order.dealId, orderId, type: "partner_cancel", amount: Number(result.refundAmount || order.totalAmount), notes: reason });
    }
    return withCors(request, { success: result.ok, ...result });
  } catch (error) {
    console.error("agent refund failed", error);
    return withCors(request, { success: false, error: "Unable to process refund." }, { status: 500 });
  }
}
