import { db } from "@/db";
import { priceObservations } from "@/db/schema";
import type { ReadyQuote } from "./quote";

export type PriceCheckpoint = "midnight" | "viewed" | "before_sale" | "after_sale";

export async function recordPriceObservation(checkpoint: PriceCheckpoint, quote: ReadyQuote, options: {
  orderId?: number; available?: boolean; evidence?: Record<string, unknown>;
} = {}) {
  await db.insert(priceObservations).values({
    dealId: quote.deal.id,
    orderId: options.orderId,
    checkpoint,
    sourcePrice: quote.deal.dealPrice,
    fullPartnerCost: quote.fullPartnerCost.toFixed(2),
    salePrice: quote.itemPrice.toFixed(2),
    totalQuoted: quote.total.toFixed(2),
    available: options.available ?? true,
    sourceDomain: quote.deal.retailerUrl ? new URL(quote.deal.retailerUrl).hostname.replace(/^www\./, "") : null,
    evidence: JSON.stringify({ pricingVersion: quote.pricingVersion, partnerShipping: quote.partnerShipping,
      partnerRequiredFee: quote.partnerRequiredFee, ...(options.evidence || {}) }),
  });
}
