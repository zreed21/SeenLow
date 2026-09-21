# Sale pricing — 50 Daily Fire Deals

## Current policy

The source item's cost receives a **10% markup on cost**, then the sale price is grossed up to recover estimated Stripe processing fees. Both are built into **one product price**. Do not add a separate customer-facing markup or Stripe surcharge in the cart, PaymentIntent, Checkout Session, email, or invoice.

This is a 10% markup on cost, not a 10% margin on selling revenue. It does not guarantee a 10% profit after refunds, disputes, advertising, or other operating expenses.

Standard US online domestic-card baseline, confirmed at https://stripe.com/pricing:

- Percentage: **2.9%** of the collected charge.
- Fixed amount: **$0.30** per successful payment.
- These defaults are estimates, not the account's actual Stripe settlement fee. International cards, FX, other payment methods, and optional Stripe products can cost more. Reconcile actual balance-transaction fees in production.

Server-only configuration (no secret or publishable-key changes required):

- `STRIPE_PROCESSING_PERCENT=2.9` — a percentage, not a fraction.
- `STRIPE_PROCESSING_FIXED_CENTS=30` — integer cents.

Use the merchant's actual contract or an explicitly chosen processing reserve. Invalid configuration fails closed. The 10% markup remains fixed by this pricing model.

## Formula

Without shipping/tax, the product price is:

**sale = round up to cents ((source cost + rounded 10% markup + fixed fee) / (1 − percentage fee))**

Do not just add 2.9% to the marked-up cost: Stripe charges its percentage on the higher amount too.

Example with a $100.00 source cost:

- Target markup: $10.00.
- Listed sale price: **$113.60**.
- Estimated processing: $3.59.
- Amount after processing: $110.01 (the extra cent is rounding).
- A $200.00 regular price is displayed as **43.20% off**, not 50% off.

All calculations use integer cents and rational arithmetic. The $0.30 is included once per current single-item checkout, never again on payment retries. A future multi-item cart should allocate one order-level fixed fee across its lines rather than multiply it by quantity.

## Destination quotes and exact requested equation

The required formula is authoritative:

**L = (1.10S + 0.30) / 0.971**

where **S is the full partner cost**: source item price plus any verified partner shipping and mandatory partner fee. L is rounded upward to cents and then cent-checked, so estimated processing does not reduce the 10% markup because of rounding. At a zero tax rate, this implementation exactly reduces to that formula.

Destination sales tax is based on the resulting customer sale price. Because Stripe also processes the tax portion of the charge, checkout uses the algebraic extension of the same formula:

**L = (1.10S + 0.30) / (0.971 − 0.029t)**

where t is the quoted destination tax rate. The final card charge is **L + tax(L)**. This makes sure the estimated Stripe processing cost on the cost of goods **and tax** is included. Partner shipping and mandatory source fees are already in S, so they are not shown or charged a second time. The customer sees one item price plus destination tax.

The catalog has no destination, so it shows the exact zero-tax formula. An address-specific quote can be slightly higher because of processing on tax. Checkout shows that updated item price and total and requires exact approval before payment. If the source falls after a price was shown, that displayed price remains the floor under the store's existing price-lock policy.

**Important integration limitation:** this sandbox's partner shipping thresholds, required product-fee rules, and state tax rates remain demo estimates from the pre-existing application. They are not live partner shipping quotes or address-level tax determinations. Production needs actual partner shipping/fees and a configured tax service. The formula recovers processing against whichever accurate quote inputs those integrations supply. Stripe Tax service charges, international/FX fees, disputes, and payment methods with different rates are not automatically discovered by this module.

## One implementation, all entry points

- `src/lib/pricing.ts`: pure sale-price, cent rounding, discount, and estimated processing functions.
- `src/lib/quote.ts`: destination quote used by verification, order initialization, payment creation, and legacy demo orders.
- `src/lib/catalogPricing.ts`: persistent reprice and Top 50 ranking using the final selling discount.
- Seeds, CRUD, midnight runs, and hourly refreshes all use the same pricing module.
- App and future website use the same APIs. Clients never reverse-engineer the source cost or add another processor fee.
- The admin editor accepts source cost and previews the server-calculated sale price. Internal pricing is restricted to the admin view.

## Preserve order history

Reprice listings, **never completed orders**. Orders snapshot quoted item price, shipping, tax, required fees, estimated processing, and pricing version. Invoices use the snapshot, not today's catalog. Paid/refunded snapshots are not repriced. A pending checkout started under the old formula must review a new quote before payment.

Create a new payment attempt/order if an already-created intent/session no longer matches the current quote. Never reuse its idempotency key with new amounts, quietly change the paid total, or charge an additional adjustment.

Apply to an existing database without resetting users or orders:

1. Apply the Drizzle schema update (the order record now stores required product fees separately).
2. Run `npx tsx scripts/reprice-catalog.ts`.
3. The script asserts that **all existing order rows are unchanged**, recalculates listing discounts, and re-ranks eligible Top 50 deals.

Tests: `npx tsx --test src/lib/pricing.test.ts`.
