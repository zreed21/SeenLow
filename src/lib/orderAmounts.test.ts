import assert from "node:assert/strict";
import { test } from "node:test";
import { orderAmounts } from "./orderAmounts";

test("receipt reads new saved amounts without exposing markup or processing as separate charges", () => {
  const amounts = orderAmounts({ dealPrice: "100.00", serviceFee: "13.60", quotedSellPrice: "113.60", requiredProductFee: "2.50", shippingFee: "8.99", taxAmount: "10.32", totalAmount: "135.41", paidAmountFrozen: "135.41" });
  assert.deepEqual(amounts, { itemPrice: 113.6, requiredProductFee: 2.5, shipping: 8.99, tax: 10.32, total: 135.41 });
});

test("legacy receipt with no quoted item price keeps its original totals", () => {
  assert.deepEqual(orderAmounts({ dealPrice: "89.99", serviceFee: "9.00", shippingFee: "0.00", taxAmount: "7.42", totalAmount: "106.41" }), { itemPrice: 98.99, requiredProductFee: 0, shipping: 0, tax: 7.42, total: 106.41 });
});

test("legacy extra fee is recovered from its saved total, not recalculated using new pricing", () => {
  assert.equal(orderAmounts({ dealPrice: "100.00", serviceFee: "12.50", quotedSellPrice: "110.00", requiredProductFee: "0.00", shippingFee: "0.00", taxAmount: "0.00", totalAmount: "112.50" }).requiredProductFee, 2.5);
});
