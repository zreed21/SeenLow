import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { catalogPriceFields, PRICING_VERSION } from "./pricing";

/** Reprice listings, never orders. Also keeps exactly the best 50 eligible items. */
export async function refreshCatalogPricing() {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(506013)`);
    const catalog = (await tx.select().from(deals)).sort((a, b) => a.id - b.id);
    const repriced = catalog.map((deal) => ({ ...deal, ...catalogPriceFields(deal.dealPrice, deal.originalPrice) }));
    const eligible = repriced
      .filter((deal) => deal.isActive && deal.okToSell && deal.stockQuantity > 0 &&
        !["sold_out", "expired"].includes(deal.stockStatus) && Number(deal.discountPercent) > 0)
      .sort((a, b) => Number(b.discountPercent) - Number(a.discountPercent) || a.id - b.id);
    const ranks = new Map(eligible.map((deal, index) => [deal.id, index + 1]));
    let updated = 0;
    for (const [index, deal] of repriced.entries()) {
      const current = catalog[index];
      const rank = ranks.get(deal.id);
      const isTop50 = rank !== undefined && rank <= 50;
      const dealRank = rank ?? eligible.length + index + 1;
      if (deal.finalPrice === current.finalPrice && deal.serviceFee === current.serviceFee &&
          deal.discountPercent === current.discountPercent && current.dealRank === dealRank && current.isTop50 === isTop50) continue;
      await tx.update(deals).set({
        ...catalogPriceFields(deal.dealPrice, deal.originalPrice),
        dealRank,
        isTop50,
        updatedAt: new Date(),
      }).where(eq(deals.id, deal.id));
      updated++;
    }
    return { pricingVersion: PRICING_VERSION, total: catalog.length, updated,
      activeCatalogCount: eligible.length, top50Count: Math.min(50, eligible.length) };
  });
}
