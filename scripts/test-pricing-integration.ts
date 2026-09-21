import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db, pool } from "../src/db/index";
import { deals, orders, orderHistory, notifications, sources } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";
import { calculateSalePrice, catalogPriceFields, toCents } from "../src/lib/pricing";
import { refreshCatalogPricing } from "../src/lib/catalogPricing";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const owner = `pricing-regression-${randomUUID()}`;
const fixtures: number[] = [];
const address = { fullName: "Pricing Test", street: "1 Example Lane", apt: "", city: "San Francisco", state: "CA", zipCode: "94107", country: "United States", phone: "4155550100" };
async function req(path: string, body?: unknown, method = body === undefined ? "GET" : "POST") {
  const response = await fetch(`${base}${path}`, {
    method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() as any };
}
async function makeDeal(cost: number, title = "Pricing regression item") {
  const [source] = await db.select().from(sources).where(eq(sources.status, "allowlisted")).limit(1);
  assert.ok(source, "An allowlisted source fixture is required");
  const priced = catalogPriceFields(cost, 250);
  const [deal] = await db.insert(deals).values({ sourceId: source.id, title: `${title} ${owner}`, slug: `pricing-${randomUUID()}`,
    description: "Temporary isolated pricing regression fixture", category: "Electronics", brand: "Test", originalPrice: "250.00",
    ...priced, retailer: source.name, retailerUrl: `https://${source.domain}/pricing-test`, imageUrl: "/images/logo.png",
    stockQuantity: 8, stockStatus: "in_stock", isTop50: false, okToSell: true, isActive: true, isHot: false,
    dealRank: 999, opportunityScore: 80, verificationStatus: "verified_active" }).returning();
  fixtures.push(deal.id);
  await refreshCatalogPricing();
  const [fresh] = await db.select().from(deals).where(eq(deals.id, deal.id));
  return fresh;
}

async function init(dealId: number, displayedPrice: number, extra: Record<string, unknown> = {}) {
  return req("/api/orders/init", { dealId, userId: owner, userEmail: "pricing-test@example.invalid", shippingAddress: address, displayedPrice, ...extra });
}

async function run() {
  const cfg = await req("/api/payments/config");
  assert.equal(cfg.data.provider, "simulation", "Run payment regression only in simulation mode; no real payments permitted");
  const existingOrders = await db.select().from(orders).orderBy(orders.id);
  try {
    const deal = await makeDeal(100);
    const expected = catalogPriceFields(100, 250);
    assert.equal(deal.finalPrice, expected.finalPrice);
    assert.equal(deal.discountPercent, expected.discountPercent);
    console.log("PASS: create uses the fee-inclusive catalog formula and selling-price discount");

    const preview = await req(`/api/deals/${deal.id}/verify`, { context: "catalog", displayedPrice: Number(deal.finalPrice) });
    assert.equal(preview.data.checkoutItemPrice, Number(deal.finalPrice));
    assert.equal(preview.data.priceStatus, "unchanged");
    const quote = (await req(`/api/deals/${deal.id}/verify`, { state: "CA", displayedPrice: Number(deal.finalPrice) })).data;
    const expectedQuote = calculateSalePrice({ sourceCost: 100, taxRate: .0825 });
    assert.equal(quote.total, expectedQuote.total);
    assert.equal(quote.checkoutItemPrice, expectedQuote.salePrice);
    assert.equal(quote.priceStatus, "increased");
    assert.ok(toCents(quote.checkoutItemPrice) - 10_000 - expectedQuote.estimatedProcessingFeeCents >= 1_000);

    const declined = await init(deal.id, Number(deal.finalPrice));
    assert.equal(declined.status, 409);
    assert.equal(declined.data.code, "PRICE_INCREASED");
    const blanket = await init(deal.id, Number(deal.finalPrice), { acceptedPriceIncrease: true });
    assert.equal(blanket.status, 409, "A boolean must not approve an arbitrary price");
    const wrongAmount = await init(deal.id, Number(deal.finalPrice), { acceptedPriceIncrease: true, acceptedTotal: quote.total - .01 });
    assert.equal(wrongAmount.status, 409);
    console.log("PASS: destination quote covers processing on tax; increases require exact approval");

    const accepted = await init(deal.id, Number(deal.finalPrice), { acceptedPriceIncrease: true, acceptedTotal: quote.total });
    assert.equal(accepted.status, 200, JSON.stringify(accepted.data));
    const orderId = accepted.data.orderId;
    const first = await req("/api/payments/create-intent", { orderId, acceptedTotal: quote.total });
    const retry = await req("/api/payments/create-intent", { orderId, acceptedTotal: quote.total });
    assert.equal(first.status, 200, JSON.stringify(first.data));
    assert.equal(first.data.breakdown.total, quote.total);
    assert.equal(retry.data.paymentIntentId, first.data.paymentIntentId);
    assert.equal(retry.data.breakdown.total, quote.total);
    const [saved] = await db.select().from(orders).where(eq(orders.id, orderId));
    assert.equal(saved.quotedSellPrice, expectedQuote.salePrice.toFixed(2));
    assert.equal(saved.requiredProductFee, "0.00");
    assert.equal(saved.serviceFee, expectedQuote.includedAdjustment.toFixed(2));
    assert.equal(saved.stripeFeeUsd, expectedQuote.estimatedProcessingFee.toFixed(2));
    console.log("PASS: order snapshots, verification and PaymentIntent totals agree; retry does not compound fees");

    const webOrder = await init(deal.id, quote.checkoutItemPrice);
    assert.equal(webOrder.status, 200);
    const session = await req("/api/payments/create-session", { orderId: webOrder.data.orderId, acceptedTotal: quote.total });
    assert.equal(session.status, 200, JSON.stringify(session.data));
    assert.equal(session.data.total, first.data.breakdown.total);
    console.log("PASS: website Session and app Intent use the same total");

    const paid = await req(`/api/orders/${orderId}/finalize`, { method: "simulation" });
    assert.equal(paid.status, 200, JSON.stringify(paid.data));
    assert.equal(paid.data.order.paidAmountFrozen, expectedQuote.total.toFixed(2));
    const [frozen] = await db.select().from(orders).where(eq(orders.id, orderId));
    await db.update(deals).set({ dealPrice: "120.00" }).where(eq(deals.id, deal.id));
    await refreshCatalogPricing();
    const [changed] = await db.select().from(deals).where(eq(deals.id, deal.id));
    assert.equal(changed.finalPrice, catalogPriceFields(120, 250).finalPrice);
    const staleSession = await req("/api/payments/create-session", { orderId: webOrder.data.orderId });
    assert.equal(staleSession.status, 409);
    assert.equal(staleSession.data.code, "CHECKOUT_CHANGED");
    assert.equal(staleSession.data.restartRequired, true);
    const [afterChange] = await db.select().from(orders).where(eq(orders.id, orderId));
    assert.deepEqual(afterChange, frozen);
    const paidAttempt = await req("/api/payments/create-intent", { orderId });
    assert.equal(paidAttempt.status, 409);
    const html = await fetch(`${base}/api/documents/${orderId}/invoice`).then((r) => r.text());
    assert.ok(html.includes(`$${expectedQuote.salePrice.toFixed(2)}`));
    assert.ok(html.includes(`$${expectedQuote.total.toFixed(2)}`));
    assert.ok(!/stripe fee|10%|processing surcharge/i.test(html));
    console.log("PASS: paid amount and invoice stay frozen after repricing; stale payment objects are rejected");

    await db.update(deals).set({ dealPrice: "80.00" }).where(eq(deals.id, deal.id));
    await refreshCatalogPricing();
    const lowerQuote = (await req(`/api/deals/${deal.id}/verify`, { state: "CA", displayedPrice: expectedQuote.salePrice })).data;
    assert.equal(lowerQuote.checkoutItemPrice, expectedQuote.salePrice);
    assert.equal(lowerQuote.total, expectedQuote.total);
    console.log("PASS: source-price decrease preserves the displayed purchase price");

    const extraDeal = await makeDeal(31.75, "Portable power station");
    const extraQuote = (await req(`/api/deals/${extraDeal.id}/verify`, { state: "CA", displayedPrice: 0 })).data;
    assert.equal(extraQuote.shippingFee, 0, "Partner shipping is included in full partner cost S, not added again");
    assert.equal(extraQuote.requiredProductFee, 0, "Mandatory partner fees are included in S, not added again");
    const p = calculateSalePrice({ sourceCost: 31.75 + 8.99 + 2.5, taxRate: .0825 });
    assert.equal(extraQuote.total, p.total);
    const extraOrder = await init(extraDeal.id, p.salePrice);
    assert.equal(extraOrder.status, 200);
    const [feeOrder] = await db.select().from(orders).where(eq(orders.id, extraOrder.data.orderId));
    assert.equal(feeOrder.sourceLastSeenPrice, "43.24");
    assert.equal(toCents(feeOrder.totalAmount), toCents(feeOrder.quotedSellPrice!) + toCents(feeOrder.shippingFee) + toCents(feeOrder.requiredProductFee) + toCents(feeOrder.taxAmount));
    const receipt = await fetch(`${base}/api/documents/${feeOrder.id}/invoice`).then((r) => r.text());
    assert.ok(!receipt.includes("Required product fee"), "Partner costs are included in the one customer product price");
    assert.ok(receipt.includes(`$${p.salePrice.toFixed(2)}`));
    console.log("PASS: full partner cost includes shipping/fees once; tax and invoice reconcile to checkout");

  } finally {
    if (fixtures.length) {
      const testOrders = await db.select({ id: orders.id }).from(orders).where(inArray(orders.dealId, fixtures));
      if (testOrders.length) await db.delete(orderHistory).where(inArray(orderHistory.orderId, testOrders.map((row) => row.id)));
      await db.delete(orders).where(inArray(orders.dealId, fixtures));
      await db.delete(notifications).where(eq(notifications.userId, owner));
      await db.delete(deals).where(inArray(deals.id, fixtures));
      await refreshCatalogPricing();
    }
  }
  const remaining = await db.select().from(orders).orderBy(orders.id);
  assert.deepEqual(remaining, existingOrders, "Existing customers' orders must stay untouched by repricing tests");
  const list = await req("/api/deals?top50=true");
  assert.equal(list.data.count, 50);
  console.log("PASS: 50 eligible deals retained, fixtures removed, all original orders preserved");
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
