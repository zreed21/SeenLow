import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateSalePrice, toCents } from "./pricing";
import { LOWER48 } from "./geo";

/** Existing demo tax estimates, NOT jurisdiction-accurate live tax calculations. */
export const STATE_TAX_RATES: Record<string, number> = {
  AL: .09, AK: .018, AZ: .084, AR: .094, CA: .0825, CO: .077, CT: .0635, DE: 0,
  FL: .07, GA: .073, HI: .045, ID: .061, IL: .0875, IN: .07, IA: .069, KS: .087,
  KY: .06, LA: .095, ME: .055, MD: .06, MA: .0625, MI: .06, MN: .078, MS: .07,
  MO: .082, MT: 0, NE: .069, NV: .083, NH: 0, NJ: .06625, NM: .078, NY: .085,
  NC: .07, ND: .07, OH: .0725, OK: .089, OR: 0, PA: .06, RI: .07, SC: .074,
  SD: .065, TN: .095, TX: .0825, UT: .0725, VT: .06, VA: .0575, WA: .089,
  WV: .06, WI: .055, WY: .054, DC: .06,
};

/** Demo lower-48 US shipping estimates, not verified partner shipping quotes. */
const SHIP_THRESHOLDS: Record<string, number> = {
  Amazon: 35, "Best Buy": 35, Target: 35, Walmart: 35, "B&H Photo": 49,
  Costco: 75, REI: 60, "Williams Sonoma": 49, "Home Depot": 45,
};

type QuoteDeal = Pick<typeof deals.$inferSelect, "dealPrice" | "retailer" | "category" | "title">;

/** Pure quote builder: applying the formula twice never adds the markup twice. */
export function quoteForDeal(deal: QuoteDeal, state: string, displayedPrice: number, context: "catalog" | "checkout" = "checkout") {
  const sourceCost = Number(deal.dealPrice);
  // Eligibility for partner shipping is based on what WE pay, not our marked-up sale price.
  const partnerShipping = context === "catalog" ? 0 : sourceCost >= (SHIP_THRESHOLDS[deal.retailer] ?? 50) ? 0 : 8.99;
  const text = `${deal.category} ${deal.title}`.toLowerCase();
  const partnerRequiredFee = context === "catalog" ? 0 : text.includes("battery") || text.includes("power station")
    ? 2.5 : text.includes("tv") && text.includes("75") ? 9.99 : 0;
  const fullPartnerCost = sourceCost + partnerShipping + partnerRequiredFee;
  const taxRate = context === "catalog" ? 0 : STATE_TAX_RATES[state.trim().toUpperCase()] ?? 0.07;
  // L=(1.10S+.30)/.971 at taxRate=0. At checkout, the same gross-up
  // also recovers processing on destination tax. Partner shipping/fees are in S.
  const input = { sourceCost: fullPartnerCost, taxRate };
  const current = calculateSalePrice(input);
  const displayedCents = toCents(displayedPrice, "Displayed price");
  const shown = displayedCents > 0 ? displayedCents / 100 : current.salePrice;
  const amounts = calculateSalePrice({ ...input, minimumItemPrice: shown });
  const priceIncreased = current.salePriceCents > toCents(shown);
  return {
    itemPrice: amounts.salePrice,
    // Partner shipping and mandatory source fees are part of full partner cost S
    // and therefore included in the single product sale price.
    shippingFee: 0,
    requiredProductFee: 0,
    partnerShipping,
    partnerRequiredFee,
    fullPartnerCost,
    taxRate: amounts.taxRate,
    taxAmount: amounts.taxAmount,
    total: amounts.total,
    amountCents: amounts.amountCents,
    estimatedStripeFee: amounts.estimatedProcessingFee,
    includedAdjustment: amounts.includedAdjustment,
    pricingVersion: amounts.version,
    priceIncreased,
    priceStatus: priceIncreased ? "increased" : current.salePriceCents < toCents(shown) ? "decreased" : "unchanged",
    livePrice: current.salePrice,
    displayedPrice: shown,
  };
}

export type ReadyQuote = ReturnType<typeof quoteForDeal> & { ok: true; deal: typeof deals.$inferSelect };
export type Quote = ReadyQuote | { ok: false; code: "not_found" | "unavailable"; error: string };

export async function buildQuote(dealId: number, state: string, displayedPrice: number, context: "catalog" | "checkout" = "checkout"): Promise<Quote> {
  // GEO CONTRACT: catalog prices and shipping assumptions are lower-48 US only.
  const geoState = String(state || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(geoState) || !LOWER48.has(geoState)) {
    if (geoState === "AK" || geoState === "HI") {
      return { ok: false, code: "unavailable", error: "We currently ship to lower-48 US addresses only (excludes AK/HI)." };
    }
    return { ok: false, code: "unavailable", error: "A valid lower-48 US state is required." };
  }
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  if (!deal) return { ok: false, code: "not_found", error: "Product not found" };
  if (!deal.isActive || deal.stockQuantity <= 0 || ["sold_out", "expired"].includes(deal.stockStatus)) {
    return { ok: false, code: "unavailable", error: "This product is no longer available." };
  }
  return { ok: true, deal, ...quoteForDeal(deal, state, displayedPrice, context) };
}

/** Only applied to an unpaid order. All prices on paid orders remain frozen. */
export function orderQuoteFields(quote: ReadyQuote) {
  return {
    dealPrice: quote.deal.dealPrice,
    pricingVersion: quote.pricingVersion,
    serviceFee: quote.includedAdjustment.toFixed(2),
    quotedSellPrice: quote.itemPrice.toFixed(2),
    requiredProductFee: quote.requiredProductFee.toFixed(2),
    shippingFee: quote.shippingFee.toFixed(2),
    taxAmount: quote.taxAmount.toFixed(2),
    totalAmount: quote.total.toFixed(2),
    customerSavings: (Number(quote.deal.originalPrice) - quote.itemPrice).toFixed(2),
    sourceLastSeenPrice: quote.fullPartnerCost.toFixed(2),
    sourceName: quote.deal.retailer,
    stripeFeeUsd: quote.estimatedStripeFee.toFixed(2),
  };
}

export function publicQuote(quote: ReadyQuote) {
  return {
    itemPrice: quote.itemPrice,
    shippingFee: quote.shippingFee,
    requiredProductFee: quote.requiredProductFee,
    taxRate: quote.taxRate,
    taxAmount: quote.taxAmount,
    total: quote.total,
  };
}
