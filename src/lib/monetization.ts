import { db } from "@/db";
import { deals, sources, monetizationSettings, priceObservations, affiliateClicks } from "@/db/schema";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { sourceCanPublish } from "./sourceCertification";

export type MonetizationSettings = typeof monetizationSettings.$inferSelect;

export async function getMonetizationSettings(): Promise<MonetizationSettings> {
  const rows = await db.select().from(monetizationSettings).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(monetizationSettings).values({}).returning();
  return created;
}

export type Rail = "affiliate" | "reseller" | "unavailable";

export interface RailDecision {
  rail: Rail;
  /** True when the vetted "Have us buy it" secondary CTA may be shown next to redirect. */
  resellerSecondary: boolean;
  reason: string;
}

/**
 * One decision point for which checkout rail a SKU gets.
 *
 * - Approved affiliate link + allowlisted/approved source → redirect is the default.
 *   Stripe is then OFF for that SKU (except the vetted secondary allowlist).
 * - No program / rejected → reseller only if still permitted, otherwise hidden.
 *   Hiding is cleaner than thin-margin arbitrage.
 */
export function resolveRail(
  deal: typeof deals.$inferSelect,
  settings: MonetizationSettings,
  source?: typeof sources.$inferSelect | null,
): RailDecision {
  // Source certification is evaluated LIVE on every read, for BOTH rails.
  // A blocked/expired/uncertified source must disappear from the catalog the
  // moment the row changes — never dependent on applySourceGate having run to
  // back-fill the denormalized okToSell/isActive flags. Fail closed: no source
  // record at all is treated as "not certified".
  const sourceOk = sourceCanPublish(source ?? undefined);
  if (!sourceOk) {
    return { rail: "unavailable", resellerSecondary: false,
      reason: source
        ? `Source "${source.domain}" is not certified to publish (status=${source.status}, score=${source.score}).`
        : "SKU has no certified source record." };
  }
  const affiliateReady = deal.affiliateStatus === "approved" && Boolean(deal.trackingUrl);
  if (affiliateReady && settings.defaultRail === "affiliate") {
    return {
      rail: "affiliate",
      resellerSecondary: deal.resellerAllowed && !settings.resellerFrozen,
      reason: "Approved affiliate link; new traffic defaults to redirect.",
    };
  }
  if (deal.affiliateStatus === "rejected" && settings.resellerFrozen) {
    return { rail: "unavailable", resellerSecondary: false, reason: "Advertiser rejected and reseller is frozen — hidden rather than thin-margin arbitrage." };
  }
  if (deal.resellerAllowed && !settings.resellerFrozen) {
    return { rail: "reseller", resellerSecondary: false, reason: "No approved affiliate program yet; reseller rail remains." };
  }
  if (deal.resellerAllowed && settings.resellerFrozen && affiliateReady) {
    return { rail: "affiliate", resellerSecondary: true, reason: "Reseller frozen; SKU is on the short allowlist." };
  }
  if (deal.resellerAllowed && settings.resellerFrozen) {
    return { rail: "reseller", resellerSecondary: false, reason: "Allowlisted reseller SKU during freeze." };
  }
  return { rail: "unavailable", resellerSecondary: false, reason: "No approved affiliate link and reseller not allowed." };
}

/** Fields the public feed exposes per rail. Affiliate cards show the retailer's own price. */
export function publicRailFields(deal: typeof deals.$inferSelect, decision: RailDecision) {
  if (decision.rail === "affiliate") {
    return {
      ctaType: "affiliate" as const,
      ctaLabel: `Buy at ${deal.retailer}`,
      retailerName: deal.retailer,
      displayPrice: deal.dealPrice, // THEIR price — no +10%, no processing gross-up
      resellerSecondary: decision.resellerSecondary,
      resellerPrice: decision.resellerSecondary ? deal.finalPrice : null,
      commissionDisclosure: "We may earn a commission if you buy.",
      redirectPath: `/api/go/${deal.id}`,
    };
  }
  return {
    ctaType: "reseller" as const,
    ctaLabel: "Order Now",
    retailerName: null,
    displayPrice: deal.finalPrice,
    resellerSecondary: false,
    resellerPrice: null,
    commissionDisclosure: null,
    redirectPath: null,
  };
}

/**
 * Pre-tap revalidation: never send someone into an $80 page labeled $49.
 * Returns the tracking URL only when the deal is still alive at the shown price.
 */
export async function validateRedirect(dealId: number, userId?: string) {
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  const settings = await getMonetizationSettings();
  const block = async (reason: string) => {
    await db.insert(affiliateClicks).values({ dealId, userId, network: deal?.affiliateNetwork,
      trackingUrl: deal?.trackingUrl || "", priceAtClick: deal?.dealPrice, revalidated: false, blockedReason: reason });
    return { ok: false as const, reason };
  };
  if (!deal) return { ok: false as const, reason: "Deal not found" };
  const [source] = deal.sourceId ? await db.select().from(sources).where(eq(sources.id, deal.sourceId)) : [];
  if (!sourceCanPublish(source)) return block("Source certification lapsed");
  if (resolveRail(deal, settings, source).rail !== "affiliate") return block("SKU is not on the affiliate rail");
  const dead = !deal.isActive || !deal.okToSell || deal.stockQuantity <= 0 ||
    ["sold_out", "expired"].includes(deal.stockStatus) || !["active", "review"].includes(deal.killStatus);
  if (dead) return block("Deal is no longer live at the last-checked price");
  await db.insert(affiliateClicks).values({ dealId, userId, network: deal.affiliateNetwork,
    trackingUrl: deal.trackingUrl!, priceAtClick: deal.dealPrice, revalidated: true });
  await db.insert(priceObservations).values({ dealId, checkpoint: "before_sale", sourcePrice: deal.dealPrice,
    fullPartnerCost: deal.dealPrice, salePrice: deal.dealPrice, totalQuoted: deal.dealPrice, available: true,
    sourceDomain: deal.retailerUrl ? new URL(deal.retailerUrl).hostname.replace(/^www\./, "") : null,
    evidence: JSON.stringify({ rail: "affiliate_redirect", trigger: "pre_tap_revalidation" }) });
  return { ok: true as const, trackingUrl: deal.trackingUrl!, retailer: deal.retailer, price: deal.dealPrice };
}

/**
 * BEST DEAL: one organic winner. Score = drop vs 30-day observed high × source trust.
 * Must be live on last check, affiliate-approved (or reseller fallback), and never sponsored.
 * A fake $3-off winner trains people to ignore the badge — below threshold returns nothing.
 */
export async function computeBestDeal() {
  const settings = await getMonetizationSettings();
  const candidates = await db.select().from(deals).where(and(
    eq(deals.isActive, true), eq(deals.okToSell, true), inArray(deals.killStatus, ["active", "review"])));
  const sourceRows = await db.select().from(sources);
  const MIN_HISTORY_POINTS = 2;
  const since = new Date(Date.now() - 30 * 86_400_000);
  let winner: { deal: typeof deals.$inferSelect; score: number; high: number; trust: number; rail: Rail } | null = null;
  for (const deal of candidates) {
    const source = sourceRows.find((s) => s.id === deal.sourceId);
    if (!source || !sourceCanPublish(source)) continue;
    const decision = resolveRail(deal, settings, source);
    if (decision.rail === "unavailable") continue;
    const history = await db.select().from(priceObservations)
      .where(and(eq(priceObservations.dealId, deal.id), gte(priceObservations.observedAt, since)))
      .orderBy(desc(priceObservations.observedAt)).limit(200);
    const priceNow = decision.rail === "affiliate" ? Number(deal.dealPrice) : Number(deal.finalPrice);
    // Rolling observed source-price history only. MSRP / originalPrice is never
    // an input: a permanently inflated list price would fake a winner forever.
    const highs = history.map((h) => decision.rail === "affiliate" ? Number(h.sourcePrice) : Number(h.salePrice)).filter((v) => v > 0);
    if (highs.length < MIN_HISTORY_POINTS) continue; // not enough tracked history to claim "lowest in 30 days"
    const high30 = Math.max(...highs);
    if (high30 <= 0 || priceNow <= 0) continue;
    const drop = Math.max(0, (high30 - priceNow) / high30);
    const trust = Math.min(1, source.score / 100);
    const score = drop * trust;
    if (!winner || score > winner.score) winner = { deal, score, high: high30, trust, rail: decision.rail };
  }
  if (!winner || winner.score < Number(settings.bestDealMinScore)) {
    return { hasWinner: false as const, message: "No standout deal right now." };
  }
  const decision = resolveRail(winner.deal, settings, sourceRows.find((s) => s.id === winner.deal.sourceId));
  return {
    hasWinner: true as const,
    dealId: winner.deal.id,
    title: winner.deal.title,
    imageUrl: winner.deal.imageUrl,
    score: Number(winner.score.toFixed(4)),
    priceNow: decision.rail === "affiliate" ? winner.deal.dealPrice : winner.deal.finalPrice,
    thirtyDayHigh: winner.high.toFixed(2),
    rail: decision.rail,
    ...publicRailFields(winner.deal, decision),
    whyItWon: `Lowest we've tracked in 30 days at an approved store — ${(winner.score * 100 / winner.trust).toFixed(0)}% below its 30-day high (source trust ${(winner.trust * 100).toFixed(0)}/100).`,
    lastChecked: winner.deal.lastVerifiedAt,
  };
}
