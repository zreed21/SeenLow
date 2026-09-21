import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, orderHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { agentActions } from "@/db/schema";
import { evaluatePartnerBuy, recordDenial, spendSummary, getSettings } from "@/lib/agentGate";
import { withCors, preflight } from "@/lib/apiAccess";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * THE ONLY ENDPOINT THE AGENT MAY USE TO SPEND.
 *
 * It cannot create, capture, or modify a Stripe charge. It authorizes + records
 * a partner-retailer purchase on the company card, and only when every rule in
 * `agentGate.ts` passes. A denial is logged, never silently swallowed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = Number(body.orderId);
    const partnerPrice = Number(body.partnerPrice);
    const actor = String(body.actor || "agent");
    const humanOverride = Boolean(body.humanOverride);

    if (!orderId || !Number.isFinite(partnerPrice) || partnerPrice <= 0) {
      return withCors(request, { success: false, error: "orderId and a positive partnerPrice are required." }, { status: 400 });
    }

    const decision = await evaluatePartnerBuy({ orderId, partnerPrice, actor, humanOverride });

    if (!decision.allowed) {
      await recordDenial({ orderId, partnerPrice, actor }, decision.reason);
      return withCors(request, {
        success: false,
        allowed: false,
        reason: decision.reason,
        rules: decision.rules,
        // Tell the caller what to do instead of buying.
        remediation: decision.reason.includes("Margin guard")
          ? "REFUND_OR_ESCALATE"
          : decision.reason.includes("not paid") ? "WAIT_FOR_PAYMENT" : "ESCALATE_TO_HUMAN",
      }, { status: 409 });
    }

    await db.insert(orderHistory).values({
      orderId,
      status: "retailer_processing",
      title: "Partner Purchase Authorized",
      description: `Fulfillment authorized under rule set ${decision.authId}. Estimated margin $${decision.marginUsd} (${decision.marginPercent}%).`,
      location: "Fulfillment Gate",
      timestamp: new Date(),
    });

    return withCors(request, {
      success: true,
      allowed: true,
      authorizationId: decision.authId,
      marginUsd: decision.marginUsd,
      marginPercent: decision.marginPercent,
      rules: decision.rules,
      card: decision.rules.card,
      instructions: "Proceed with the partner checkout using the company card. Do not exceed the authorized amount.",
    });
  } catch (error) {
    console.error("partner-buy failed", error);
    return withCors(request, { success: false, error: "Unable to evaluate partner buy." }, { status: 500 });
  }
}

/** Ops view: caps, spend to date, and the audit log. */
export async function GET(request: NextRequest) {
  const summary = await spendSummary();
  const recent = await db.select().from(agentActions).orderBy(desc(agentActions.createdAt)).limit(50);
  return withCors(request, { success: true, ...summary, recentActions: recent });
}
