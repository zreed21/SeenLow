/**
 * Internal sale-price policy, shared by catalog, checkout, and fulfillment.
 * No payment-method surcharge is displayed: margin and estimated processing
 * costs are part of the single product price.
 *
 * Catalog: ceil_cent((source + rounded_10_percent_markup + fixed_fee) / (1 - rate)).
 * Checkout additionally recovers processing on shipping, product fees and tax
 * in the item price. Shipping/tax/product fees themselves remain pass-throughs.
 * The 10% is a markup on SOURCE COST, not a 10% margin on sale revenue.
 */
export const PRICING_VERSION = "source-markup-plus-processing-v2";
const BPS = BigInt(10_000);
const TAX_SCALE = BigInt(1_000_000);
const MAX_CENTS = 9_999_999_999;

export interface PricingPolicy {
  markupBps: number;
  processingBps: number;
  processingFixedCents: number;
}

export function getPricingPolicy(): PricingPolicy {
  const percent = Number(process.env.STRIPE_PROCESSING_PERCENT ?? "2.9");
  const fixed = Number(process.env.STRIPE_PROCESSING_FIXED_CENTS ?? "30");
  const bps = Math.round(percent * 100);
  if (!Number.isFinite(percent) || percent < 0 || percent >= 50 ||
      Math.abs(percent * 100 - bps) > 1e-8 || !Number.isSafeInteger(fixed) || fixed < 0 || fixed > 100_000) {
    throw new Error("Invalid Stripe processing pricing configuration");
  }
  return { markupBps: 1_000, processingBps: bps, processingFixedCents: fixed };
}

export function toCents(value: number | string, label = "Amount"): number {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") {
    throw new RangeError(`${label} must be a valid nonnegative amount`);
  }
  const n = Number(value);
  const cents = Math.round((n + Number.EPSILON) * 100);
  if (!Number.isFinite(n) || n < 0 || !Number.isSafeInteger(cents) || cents > MAX_CENTS) {
    throw new RangeError(`${label} must be a valid nonnegative amount`);
  }
  return cents;
}

const roundRatio = (numerator: bigint, denominator: bigint) =>
  Number((numerator + denominator / BigInt(2)) / denominator);
const ceilRatio = (numerator: bigint, denominator: bigint) =>
  Number((numerator + denominator - BigInt(1)) / denominator);
const usd = (cents: number) => cents / 100;

function validatePolicy(policy: PricingPolicy) {
  if (!Number.isSafeInteger(policy.markupBps) || policy.markupBps < 0 ||
      !Number.isSafeInteger(policy.processingBps) || policy.processingBps < 0 || policy.processingBps >= 10_000 ||
      !Number.isSafeInteger(policy.processingFixedCents) || policy.processingFixedCents < 0) {
    throw new RangeError("Invalid pricing policy");
  }
}

export function estimateProcessingFeeCents(amountCents: number, policy = getPricingPolicy()): number {
  validatePolicy(policy);
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) throw new RangeError("Invalid charge amount");
  if (amountCents === 0) return 0;
  return roundRatio(BigInt(amountCents) * BigInt(policy.processingBps), BPS) + policy.processingFixedCents;
}

export interface SalePriceInput {
  sourceCost: number | string;
  shipping?: number | string;
  requiredProductFee?: number | string;
  taxRate?: number;
  /** Preserve the price shown at checkout if the source subsequently drops. */
  minimumItemPrice?: number | string;
}

export function calculateSalePrice(input: SalePriceInput, policy = getPricingPolicy()) {
  validatePolicy(policy);
  const sourceCents = toCents(input.sourceCost, "Source cost");
  if (sourceCents <= 0) throw new RangeError("Source cost must be greater than zero");
  const shippingCents = toCents(input.shipping ?? 0, "Shipping");
  const requiredFeeCents = toCents(input.requiredProductFee ?? 0, "Product fee");
  const minPriceCents = toCents(input.minimumItemPrice ?? 0, "Displayed price");
  const taxRate = input.taxRate ?? 0;
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) throw new RangeError("Invalid tax rate");
  const taxPpm = BigInt(Math.round(taxRate * Number(TAX_SCALE)));
  const markupCents = roundRatio(BigInt(sourceCents) * BigInt(policy.markupBps), BPS);
  const extras = shippingCents + requiredFeeCents;
  const rate = BigInt(policy.processingBps);
  const multiplier = TAX_SCALE + taxPpm;
  const denominator = BPS * TAX_SCALE - rate * multiplier;
  if (denominator <= BigInt(0)) throw new RangeError("Processing rate is too high to recover");

  // P - estimatedFee((P + extras) * (1 + taxRate)) = source + markup.
  const numerator = BigInt(sourceCents + markupCents + policy.processingFixedCents) * BPS * TAX_SCALE
    + rate * BigInt(extras) * multiplier;
  const requiredSaleCents = ceilRatio(numerator, denominator);
  let saleCents = Math.max(requiredSaleCents, minPriceCents);
  let taxCents = 0;
  let totalCents = 0;
  let processingCents = 0;
  // Adjust for cent rounding of the tax and Stripe deduction, never under-recover.
  for (let attempt = 0; attempt < 4; attempt++) {
    taxCents = roundRatio(BigInt(saleCents + extras) * taxPpm, TAX_SCALE);
    totalCents = saleCents + extras + taxCents;
    processingCents = estimateProcessingFeeCents(totalCents, policy);
    if (saleCents - sourceCents - processingCents >= markupCents) break;
    saleCents++;
  }
  if (totalCents > MAX_CENTS || saleCents - sourceCents - processingCents < markupCents) {
    throw new RangeError("Sale exceeds the supported amount");
  }
  return {
    version: PRICING_VERSION,
    sourceCost: usd(sourceCents),
    markupAmount: usd(markupCents),
    salePrice: usd(saleCents),
    includedAdjustment: usd(saleCents - sourceCents),
    processingAllowance: usd(saleCents - sourceCents - markupCents),
    estimatedProcessingFee: usd(processingCents),
    netMarkup: usd(saleCents - sourceCents - processingCents),
    shippingFee: usd(shippingCents),
    requiredProductFee: usd(requiredFeeCents),
    taxRate,
    taxAmount: usd(taxCents),
    total: usd(totalCents),
    amountCents: totalCents,
    salePriceCents: saleCents,
    markupCents,
    estimatedProcessingFeeCents: processingCents,
  };
}

/** Fields persisted on listings. serviceFee is a legacy INTERNAL adjustment column. */
export function catalogPriceFields(sourceCost: number | string, regularPrice: number | string) {
  const price = calculateSalePrice({ sourceCost });
  const retailCents = toCents(regularPrice, "Regular price");
  if (retailCents <= 0) throw new RangeError("Regular price must be greater than zero");
  return {
    dealPrice: price.sourceCost.toFixed(2),
    serviceFee: price.includedAdjustment.toFixed(2),
    finalPrice: price.salePrice.toFixed(2),
    discountPercent: Math.max(0, (1 - price.salePriceCents / retailCents) * 100).toFixed(2),
  };
}
