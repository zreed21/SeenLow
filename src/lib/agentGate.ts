import { db } from "@/db";
import { orders, agentActions, fulfillmentSettings, deals, sources } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { estimateProcessingFeeCents, toCents } from "./pricing";

/**
 * FULFILLMENT GATE
 *
 * The agent (AI or human ops) may buy from a partner retailer ONLY when every
 * rule here passes. It can never create or modify a Stripe charge — Stripe
 * money movement is customer → us, handled exclusively by /api/payments/* and
 * the webhook.
 *
 * The second purchase (us → partner) is a normal consumer checkout on the
 * partner's site using the company card, capped and audited here.
 */

export type Settings = typeof fulfillmentSettings.$inferSelect;

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(fulfillmentSettings).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(fulfillmentSettings).values({}).returning();
  return created;
}

export interface GateInput {
  orderId: number;
  partnerPrice: number;      // what the partner is asking right now
  actor?: string;
  humanOverride?: boolean;
}

export interface GateDecision {
  allowed: boolean;
  reason: string;
  authId?: string;
  rules: Record<string, string>;
  marginUsd?: number;
  marginPercent?: number;
}

async function log(entry: {
  orderId: number; action: string; allowed: boolean;
  amountUsd?: number; rules: Record<string, string>; reason: string; actor: string;
}) {
  await db.insert(agentActions).values({
    orderId: entry.orderId,
    action: entry.action,
    allowed: entry.allowed,
    amountUsd: entry.amountUsd?.toFixed(2),
    rulesChecked: JSON.stringify(entry.rules),
    decisionReason: entry.reason,
    actor: entry.actor,
  });
}

/** Every rule that must pass before the agent may spend company money. */
export async function evaluatePartnerBuy(input: GateInput): Promise<GateDecision> {
  const settings = await getSettings();
  const rules: Record<string, string> = {};
  const fail = (reason: string): GateDecision => ({ allowed: false, reason, rules });

  rules.fulfillment_enabled = settings.enabled ? "pass" : "fail";
  if (!settings.enabled) return fail("Fulfillment is globally disabled.");

  const rows = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  const order = rows[0];
  if (!order) return fail("Order not found.");

  // RULE: must be paid. Never spend on an unpaid cart.
  rules.payment_paid = order.paymentStatus === "paid" ? "pass" : "fail";
  if (order.paymentStatus !== "paid") return fail("Order is not paid. Fulfillment may not spend before payment.");

  // RULE: no risk holds (dispute, fraud warning, refund, manual hold).
  const held = order.fulfillmentHold || order.earlyFraudWarning || order.disputeStatus;
  rules.no_risk_hold = held ? "fail" : "pass";
  if (held) return fail(`Fulfillment hold active (${order.holdReason || order.disputeStatus || "risk flag"}).`);

  // RULE: not already purchased (idempotent — no double buy).
  rules.not_already_purchased = order.partnerPurchased ? "fail" : "pass";
  if (order.partnerPurchased) return fail("Partner purchase already recorded for this order.");

  // RULE: first five paid orders from a new non-chain source require a human.
  const [deal] = await db.select().from(deals).where(eq(deals.id, order.dealId));
  const [source] = deal?.sourceId ? await db.select().from(sources).where(eq(sources.id, deal.sourceId)) : [];
  const probation = source && !source.knownChain && source.paidOrders < 5;
  rules.source_probation = probation ? (input.humanOverride ? "human_override" : "fail") : "pass";
  if (probation && !input.humanOverride) return fail("Source is in its first five paid orders. Human approval is required before partner spend.");

  // RULE: per-order cap.
  const maxBuy = Number(settings.maxPartnerBuyUsd);
  rules.max_partner_buy = input.partnerPrice <= maxBuy ? "pass" : `fail (cap $${maxBuy})`;
  if (input.partnerPrice > maxBuy) return fail(`Partner price $${input.partnerPrice.toFixed(2)} exceeds the per-order cap of $${maxBuy.toFixed(2)}.`);

  // RULE: margin. Never buy above what the customer paid minus minimum margin,
  // unless a human explicitly overrides.
  const paid = Number(order.paidAmountFrozen || order.totalAmount);
  const quoted = Number(order.quotedSellPrice || paid);
  const estStripeFee = order.stripeFeeUsd !== null
    ? Number(order.stripeFeeUsd)
    : estimateProcessingFeeCents(toCents(paid)) / 100;
  const marginUsd = Number((quoted - input.partnerPrice - estStripeFee).toFixed(2));
  const marginPercent = quoted > 0 ? Number(((marginUsd / quoted) * 100).toFixed(2)) : -100;

  rules.margin_ok =
    (marginUsd >= Number(settings.minMarginUsd) && marginPercent >= Number(settings.minMarginPercent))
      ? `pass ($${marginUsd} / ${marginPercent}%)`
      : `fail ($${marginUsd} / ${marginPercent}%)`;

  const marginAcceptable = marginUsd >= Number(settings.minMarginUsd) && marginPercent >= Number(settings.minMarginPercent);
  if (!marginAcceptable) {
    if (input.humanOverride) {
      rules.margin_ok = `overridden_by_human ($${marginUsd} / ${marginPercent}%)`;
    } else if (!settings.allowLossPurchases) {
      return fail(
        `Margin guard: buying at $${input.partnerPrice.toFixed(2)} leaves $${marginUsd} (${marginPercent}%) after fees, ` +
        `below the $${Number(settings.minMarginUsd).toFixed(2)} / ${Number(settings.minMarginPercent).toFixed(1)}% floor. ` +
        `A human must approve or the order must be refunded.`
      );
    } else {
      rules.margin_ok = `allowed_loss ($${marginUsd})`;
    }
  }

  // RULE: aggregate spend caps (rolling, on today's / this month's approved buys).
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dayRow] = await db.select({ total: sql<string>`coalesce(sum(${agentActions.amountUsd}),0)` })
    .from(agentActions)
    .where(and(eq(agentActions.allowed, true), eq(agentActions.action, "partner_buy_approved"), gte(agentActions.createdAt, startOfDay)));
  const [monthRow] = await db.select({ total: sql<string>`coalesce(sum(${agentActions.amountUsd}),0)` })
    .from(agentActions)
    .where(and(eq(agentActions.allowed, true), eq(agentActions.action, "partner_buy_approved"), gte(agentActions.createdAt, startOfMonth)));

  const spentToday = Number(dayRow?.total || 0);
  const spentMonth = Number(monthRow?.total || 0);

  rules.daily_cap = spentToday + input.partnerPrice <= Number(settings.dailySpendCapUsd) ? `pass ($${(spentToday + input.partnerPrice).toFixed(2)} of $${Number(settings.dailySpendCapUsd).toFixed(2)})` : "fail";
  if (spentToday + input.partnerPrice > Number(settings.dailySpendCapUsd)) {
    return fail(`Daily spend cap would be exceeded ($${(spentToday + input.partnerPrice).toFixed(2)} vs $${Number(settings.dailySpendCapUsd).toFixed(2)}).`);
  }

  rules.monthly_cap = spentMonth + input.partnerPrice <= Number(settings.monthlySpendCapUsd) ? "pass" : "fail";
  if (spentMonth + input.partnerPrice > Number(settings.monthlySpendCapUsd)) {
    return fail(`Monthly spend cap would be exceeded ($${(spentMonth + input.partnerPrice).toFixed(2)} vs $${Number(settings.monthlySpendCapUsd).toFixed(2)}).`);
  }

  rules.card = `${settings.cardNickname} •••• ${settings.cardLast4}`;

  // All rules passed — record the approval and stamp the order.
  const authId = `auth_${input.orderId}_${Date.now().toString(36)}`;
  await log({
    orderId: input.orderId,
    action: "partner_buy_approved",
    allowed: true,
    amountUsd: input.partnerPrice,
    rules,
    reason: `All rules passed. Margin $${marginUsd} (${marginPercent}%).`,
    actor: input.humanOverride ? "human" : (input.actor || "agent"),
  });

  await db.update(orders).set({
    partnerPurchased: true,
    partnerPurchasedAt: new Date(),
    partnerPurchasePrice: input.partnerPrice.toFixed(2),
    partnerPurchaseAuth: authId,
    marginUsd: marginUsd.toFixed(2),
    cogsUsd: input.partnerPrice.toFixed(2),
    stripeFeeUsd: estStripeFee.toFixed(2),
    humanOverride: Boolean(input.humanOverride),
    dropshipStatus: "retailer_processing",
    updatedAt: new Date(),
  }).where(eq(orders.id, input.orderId));

  return { allowed: true, reason: "Approved.", authId, rules, marginUsd, marginPercent };
}

/** Record a denied attempt so the audit trail shows what was blocked and why. */
export async function recordDenial(input: GateInput, reason: string) {
  await log({
    orderId: input.orderId, action: "partner_buy_denied", allowed: false,
    amountUsd: input.partnerPrice, rules: {}, reason, actor: input.actor || "agent",
  });
}

/** Refund with an explicit cap on how much the agent may refund without a human. */
export async function evaluateAgentRefund(orderId: number, amountUsd: number, actor = "agent"): Promise<GateDecision> {
  const settings = await getSettings();
  const rules: Record<string, string> = {};
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return { allowed: false, reason: "Order not found.", rules };

  rules.max_partner_buy = amountUsd <= Number(settings.maxPartnerBuyUsd) ? "pass" : "fail";
  if (amountUsd > Number(settings.maxPartnerBuyUsd)) {
    return { allowed: false, reason: `Refund of $${amountUsd.toFixed(2)} exceeds the unattended cap of $${Number(settings.maxPartnerBuyUsd).toFixed(2)}. Requires a human.`, rules };
  }

  const alreadyRefunded = Number(order.refundAmount || 0);
  rules.not_double_refund = alreadyRefunded === 0 ? "pass" : "fail";
  if (alreadyRefunded > 0) return { allowed: false, reason: "Order already refunded.", rules };

  await log({ orderId, action: "refund", allowed: true, amountUsd, rules, reason: "Agent refund approved.", actor });
  return { allowed: true, reason: "Approved.", authId: `re_${orderId}_${Date.now().toString(36)}`, rules };
}

/** Rollup for the ops dashboard: spend vs caps. */
export async function spendSummary() {
  const s = await getSettings();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sum = async (from: Date) => {
    const [r] = await db.select({ total: sql<string>`coalesce(sum(${agentActions.amountUsd}),0)` })
      .from(agentActions)
      .where(and(eq(agentActions.allowed, true), eq(agentActions.action, "partner_buy_approved"), gte(agentActions.createdAt, from)));
    return Number(r?.total || 0);
  };

  return {
    settings: s,
    spentToday: await sum(startOfDay),
    spentMonth: await sum(startOfMonth),
    dailyCap: Number(s.dailySpendCapUsd),
    monthlyCap: Number(s.monthlySpendCapUsd),
    perOrderCap: Number(s.maxPartnerBuyUsd),
  };
}
