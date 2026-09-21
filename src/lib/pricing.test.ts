import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateSalePrice, catalogPriceFields, estimateProcessingFeeCents, getPricingPolicy, toCents, type PricingPolicy } from "./pricing";

const policy: PricingPolicy = { markupBps: 1000, processingBps: 290, processingFixedCents: 30 };

test("$100 source cost includes 10% markup and grossed-up Stripe fees", () => {
  const p = calculateSalePrice({ sourceCost: 100 }, policy);
  assert.equal(p.salePrice, 113.60);
  assert.equal(p.markupAmount, 10);
  assert.equal(p.estimatedProcessingFee, 3.59);
  assert.equal(p.netMarkup, 10.01);
  assert.equal(p.includedAdjustment, 13.60);
});

test("gross-up includes the fee on the fee, unlike adding 2.9% + 30 cents once", () => {
  const naive = Math.round((100 * 1.1 * 1.029 + .3) * 100);
  assert.ok(naive - estimateProcessingFeeCents(naive, policy) < 11_000);
  const p = calculateSalePrice({ sourceCost: 100 }, policy);
  assert.ok(p.salePriceCents - p.estimatedProcessingFeeCents >= 11_000);
});

test("preserves 10% source markup after processing the full checkout, including shipping and tax", () => {
  for (const sourceCost of [0.01, 1, 9.99, 34.99, 89.99, 100, 649, 8450]) {
    for (const taxRate of [0, .055, .06625, .0825, .089, .095]) {
      for (const shipping of [0, 8.99, 49.99]) {
        const p = calculateSalePrice({ sourceCost, taxRate, shipping, requiredProductFee: 2.5 }, policy);
        assert.equal(p.amountCents, toCents(p.salePrice) + toCents(p.shippingFee) + toCents(p.requiredProductFee) + toCents(p.taxAmount));
        assert.ok(p.salePriceCents - toCents(sourceCost) - p.estimatedProcessingFeeCents >= p.markupCents);
        assert.ok(p.netMarkup >= 0);
      }
    }
  }
});

test("displayed-price floor stays locked on source price decreases", () => {
  const prior = calculateSalePrice({ sourceCost: 100, taxRate: .0825 }, policy);
  const next = calculateSalePrice({ sourceCost: 80, taxRate: .0825, minimumItemPrice: prior.salePrice }, policy);
  assert.equal(next.salePrice, prior.salePrice);
  assert.equal(next.total, prior.total);
});

test("source price increases raise the quote rather than eroding markup", () => {
  const prior = calculateSalePrice({ sourceCost: 100 }, policy);
  const next = calculateSalePrice({ sourceCost: 120, minimumItemPrice: prior.salePrice }, policy);
  assert.ok(next.salePrice > prior.salePrice);
  assert.ok(next.netMarkup >= 12);
});

test("repeated calculation and retry use the same source cost, never compound markup", () => {
  const first = calculateSalePrice({ sourceCost: "89.99", taxRate: .0825 }, policy);
  const repeated = calculateSalePrice({ sourceCost: "89.99", taxRate: .0825, minimumItemPrice: first.salePrice }, policy);
  assert.equal(first.salePrice, repeated.salePrice);
  assert.equal(first.amountCents, repeated.amountCents);
});

test("the fixed processing fee is included exactly once per existing single-item checkout", () => {
  const p = calculateSalePrice({ sourceCost: 100, taxRate: .0825, shipping: 8.99 }, policy);
  assert.equal(p.estimatedProcessingFeeCents, Math.round(p.amountCents * .029) + 30);
});

test("supports custom processor contracts and zero processor fees", () => {
  const custom = { ...policy, processingBps: 240, processingFixedCents: 20 };
  assert.ok(calculateSalePrice({ sourceCost: 100 }, custom).salePrice < 113.60);
  assert.equal(calculateSalePrice({ sourceCost: 100 }, { ...policy, processingBps: 0, processingFixedCents: 0 }).salePrice, 110);
});

test("catalog discount is against final sale price and never exposes a negative percent-off", () => {
  const expected = calculateSalePrice({ sourceCost: 100 });
  const fields = catalogPriceFields(100, 200);
  assert.equal(fields.finalPrice, expected.salePrice.toFixed(2));
  assert.equal(fields.discountPercent, ((1 - expected.salePrice / 200) * 100).toFixed(2));
  assert.equal(toCents(fields.dealPrice) + toCents(fields.serviceFee), toCents(fields.finalPrice));
  assert.equal(catalogPriceFields(100, 100).discountPercent, "0.00");
});

test("invalid costs, tax rates, and displayed prices fail closed", () => {
  for (const sourceCost of [0, -10, NaN, Infinity, "", "abc"]) {
    assert.throws(() => calculateSalePrice({ sourceCost }, policy));
  }
  assert.throws(() => calculateSalePrice({ sourceCost: 100, taxRate: -1 }, policy));
  assert.throws(() => calculateSalePrice({ sourceCost: 100, minimumItemPrice: -1 }, policy));
  assert.throws(() => catalogPriceFields(100, 0));
});

test("server fee configuration is validated", () => {
  const beforeRate = process.env.STRIPE_PROCESSING_PERCENT;
  const beforeFixed = process.env.STRIPE_PROCESSING_FIXED_CENTS;
  try {
    process.env.STRIPE_PROCESSING_PERCENT = "2.5";
    process.env.STRIPE_PROCESSING_FIXED_CENTS = "20";
    assert.deepEqual(getPricingPolicy(), { markupBps: 1000, processingBps: 250, processingFixedCents: 20 });
    process.env.STRIPE_PROCESSING_PERCENT = "NaN";
    assert.throws(() => getPricingPolicy());
    process.env.STRIPE_PROCESSING_PERCENT = "100";
    assert.throws(() => getPricingPolicy());
  } finally {
    if (beforeRate === undefined) delete process.env.STRIPE_PROCESSING_PERCENT;
    else process.env.STRIPE_PROCESSING_PERCENT = beforeRate;
    if (beforeFixed === undefined) delete process.env.STRIPE_PROCESSING_FIXED_CENTS;
    else process.env.STRIPE_PROCESSING_FIXED_CENTS = beforeFixed;
  }
});
