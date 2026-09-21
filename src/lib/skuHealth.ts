import { db } from "@/db";
import { deals, skuOutcomes, sources } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { refreshCatalogPricing } from "./catalogPricing";
import { applySourceGate } from "./sourceCertification";

export type OutcomeType = "paid" | "delivered" | "partner_cancel" | "change_of_mind" | "defect" | "wrong_item" | "damaged" | "not_as_described" | "safety_complaint";
const UGLY = new Set<OutcomeType>(["defect", "wrong_item", "damaged", "not_as_described", "safety_complaint"]);

export async function recordSkuOutcome(input: { dealId: number; orderId?: number; sourceId?: number | null; type: OutcomeType; amount?: number; postageLoss?: number; notes?: string }) {
  const [deal] = await db.select().from(deals).where(eq(deals.id, input.dealId));
  if (!deal) throw new Error("SKU not found");
  await db.transaction(async (tx) => {
    await tx.insert(skuOutcomes).values({ dealId: input.dealId, orderId: input.orderId, sourceId: input.sourceId ?? deal.sourceId,
      outcomeType: input.type, amount: (input.amount || 0).toFixed(2), postageLoss: (input.postageLoss || 0).toFixed(2), notes: input.notes });
    const patch: Record<string, any> = { updatedAt: new Date() };
    if (input.type === "paid") patch.paidOrders = deal.paidOrders + 1;
    if (input.type === "delivered") { patch.deliveredOrders = deal.deliveredOrders + 1; patch.outcomeRevenue = (Number(deal.outcomeRevenue) + (input.amount || 0)).toFixed(2); }
    if (input.type === "partner_cancel") { patch.partnerCancelCount = deal.partnerCancelCount + 1; patch.outcomeLosses = (Number(deal.outcomeLosses) + (input.amount || 0) + (input.postageLoss || 0)).toFixed(2); }
    if (input.type === "change_of_mind") { patch.changeOfMindReturns = deal.changeOfMindReturns + 1; patch.outcomeLosses = (Number(deal.outcomeLosses) + (input.amount || 0) + (input.postageLoss || 0)).toFixed(2); }
    if (input.type === "defect") patch.defectReturns = deal.defectReturns + 1;
    if (input.type === "wrong_item") patch.wrongItemReturns = deal.wrongItemReturns + 1;
    if (input.type === "damaged") patch.damagedReturns = deal.damagedReturns + 1;
    if (input.type === "not_as_described") patch.notAsDescribedReturns = deal.notAsDescribedReturns + 1;
    if (UGLY.has(input.type)) patch.outcomeLosses = (Number(deal.outcomeLosses) + (input.amount || 0) + (input.postageLoss || 0)).toFixed(2);
    await tx.update(deals).set(patch).where(eq(deals.id, deal.id));
    if (deal.sourceId) {
      const [source] = await tx.select().from(sources).where(eq(sources.id, deal.sourceId));
      if (source) {
        const sourcePatch: Record<string, any> = { updatedAt: new Date() };
        if (input.type === "paid") sourcePatch.paidOrders = source.paidOrders + 1;
        if (input.type === "delivered") sourcePatch.deliveredOrders = source.deliveredOrders + 1;
        if (input.type === "partner_cancel") sourcePatch.cancelAfterPayCount = source.cancelAfterPayCount + 1;
        if (["change_of_mind", ...UGLY].includes(input.type)) sourcePatch.returnCount = source.returnCount + 1;
        await tx.update(sources).set(sourcePatch).where(eq(sources.id, source.id));
      }
    }
  });
  if (deal.sourceId) {
    const [source] = await db.select().from(sources).where(eq(sources.id, deal.sourceId));
    if (source) {
      const cancelRate = source.paidOrders ? source.cancelAfterPayCount / source.paidOrders : 0;
      if (source.cancelAfterPayCount >= 3 && source.paidOrders <= 15 || source.paidOrders >= 10 && cancelRate > .15) {
        await db.update(sources).set({ status: "blocked", blockReason: `Partner cancel-after-pay rate ${(cancelRate*100).toFixed(1)}%`, updatedAt: new Date() }).where(eq(sources.id, source.id));
        await applySourceGate(source.id);
      } else if (source.paidOrders >= 10 && cancelRate >= .08) {
        await db.update(sources).set({ status: "hold", blockReason: `Partner cancel-after-pay review at ${(cancelRate*100).toFixed(1)}%`, updatedAt: new Date() }).where(eq(sources.id, source.id));
        await applySourceGate(source.id);
      } else if (source.status === "approved" && source.testBuyPassed && source.deliveredOrders >= 20 && cancelRate < .10 && source.returnCount / source.deliveredOrders < .08) {
        await db.update(sources).set({ status: "allowlisted", approvalMethod: "performance", blockReason: null,
          approvalExpiresAt: new Date(Date.now() + 90 * 86_400_000), updatedAt: new Date() }).where(eq(sources.id, source.id));
        await applySourceGate(source.id);
      }
    }
  }
  return evaluateSkuHealth(deal.id);
}

export async function evaluateSkuHealth(dealId: number) {
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId));
  if (!deal) throw new Error("SKU not found");
  const ugly = deal.defectReturns + deal.wrongItemReturns + deal.damagedReturns + deal.notAsDescribedReturns;
  const delivered = deal.deliveredOrders;
  const uglyRate = delivered ? ugly / delivered : 0;
  const cancelRate = deal.paidOrders ? deal.partnerCancelCount / deal.paidOrders : 0;
  const fragile = /glass|ceramic|mirror|screen|tv/i.test(`${deal.category} ${deal.title}`);
  const safetyCategory = /supplement|ingestible|cosmetic|skin|baby|kids|car safety|electrical safety/i.test(`${deal.category} ${deal.title}`);
  const recent = await db.select().from(skuOutcomes).where(eq(skuOutcomes.dealId, dealId)).orderBy(desc(skuOutcomes.createdAt)).limit(20);
  const terminal = recent.filter((row) => ["delivered", "partner_cancel", "change_of_mind", "defect", "wrong_item", "damaged", "not_as_described", "safety_complaint"].includes(row.outcomeType));
  const trailingNet = terminal.reduce((sum, row) => row.outcomeType === "delivered"
    ? sum + Number(row.amount)
    : sum - Math.abs(Number(row.amount)) - Number(row.postageLoss), 0);
  const reasons: string[] = [];
  let status: "active" | "review" | "hidden" | "killed" = "active";
  if (safetyCategory && recent.some((row) => row.outcomeType === "safety_complaint")) { status = "killed"; reasons.push("First safety complaint in restricted-risk category"); }
  if (delivered < 10 && ugly >= 2) { status = "killed"; reasons.push("Two ugly returns before 10 delivered orders"); }
  if (delivered >= 10 && uglyRate >= .10) { status = "killed"; reasons.push(`Ugly return rate ${(uglyRate*100).toFixed(1)}% >= 10%`); }
  else if (delivered >= 10 && uglyRate >= .08 && status === "active") { status = "hidden"; reasons.push(`Ugly return rate ${(uglyRate*100).toFixed(1)}% >= 8%`); }
  else if (uglyRate >= .05 && status === "active") { status = "review"; reasons.push(`Ugly return rate ${(uglyRate*100).toFixed(1)}% > 5% review threshold`); }
  if (fragile && deal.damagedReturns >= 2) { status = "killed"; reasons.push("Two damage tickets on fragile SKU"); }
  if (deal.partnerCancelCount >= 3 && deal.paidOrders <= 15 || deal.paidOrders >= 10 && cancelRate > .15) { status = "killed"; reasons.push(`Partner cancel rate ${(cancelRate*100).toFixed(1)}%`); }
  else if (deal.paidOrders >= 10 && cancelRate >= .08 && status === "active") { status = "review"; reasons.push(`Partner cancel rate ${(cancelRate*100).toFixed(1)}% requires review`); }
  if (terminal.length >= 20 && trailingNet <= 0) { status = "hidden"; reasons.push(`Trailing 20 outcome net is $${trailingNet.toFixed(2)}`); }
  const sellable = status === "active" || status === "review";
  const killedAt = ["killed", "hidden"].includes(status) ? new Date() : null;
  await db.update(deals).set({ killStatus: status, killReason: reasons.join("; ") || null, killedAt,
    relistBlockedUntil: status === "killed" ? new Date(Date.now() + 30 * 86_400_000) : null,
    okToSell: sellable && deal.okToSell, isActive: sellable && deal.isActive, isTop50: sellable && deal.isTop50, updatedAt: new Date() }).where(eq(deals.id, dealId));
  if (!sellable) await refreshCatalogPricing();
  return { status, reasons, uglyReturns: ugly, uglyReturnRate: uglyRate, partnerCancelRate: cancelRate,
    changeOfMindReturns: deal.changeOfMindReturns, delivered, paid: deal.paidOrders, trailing20Net: trailingNet, okToSell: sellable && deal.okToSell };
}
