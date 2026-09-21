> **Updated pricing model:** sale prices now include a 10% markup on source cost **plus a gross-up for estimated Stripe fees**. See [PRICING.md](./PRICING.md) for the current formula, destination quote handling, configuration, and limitations. Existing paid orders are not repriced.

# Payments — 50 Daily Fire Deals

## Chosen processor: Stripe

After comparing the 2026 market (Stripe, Square, PayPal/Braintree, Adyen, Helcim,
Checkout.com), **Stripe** is the recommended processor for this business:

| Why | Detail |
|-----|--------|
| Affordable at our stage | Flat **2.9% + $0.30** online, **no monthly fee**. Cheapest tier for < ~$10k/mo, exactly where a new deal site starts. |
| Reliable | Highest-rated developer API, 99.99%+ uptime, used by millions of sites. |
| Apple Pay + Google Pay built in | Enabled automatically via `automatic_payment_methods` and the Express Checkout Element — no separate wallet contracts. |
| One integration, two front-ends | The app and the future website both call `/api/payments/*`. Same keys, same webhook, same dashboard. |
| Grows with us | Volume/interchange-plus discounts by request; swap to Adyen/Helcim only once we clear ~$1M/yr. |

**When to revisit:** at ~$15k–$40k/mo, evaluate **Helcim** (interchange-plus, auto
volume discounts). At $1M+/yr or multi-country, evaluate **Adyen**. The provider
abstraction in `src/lib/payments.ts` means that's an adapter change, not a rewrite.

## How it works in code

- `src/lib/payments.ts` — provider abstraction. Stripe adapter + a **simulation**
  adapter so the app runs with no keys (dev/preview/CI).
- `POST /api/payments/create-intent` — server recomputes the amount from the live
  deal price + destination tax (never trusts the client) and returns a
  `clientSecret`.
- `GET /api/payments/config` — tells any front-end which provider + publishable key
  to use and whether wallets are on.
- `POST /api/payments/webhook` — single Stripe webhook for both front-ends.
- `src/components/StripePaymentSection.tsx` — Express Checkout (Apple Pay / Google
  Pay) + card Payment Element. Reusable by the website as-is.

Checkout automatically shows the real Stripe UI when keys are present, and the
simulated card form otherwise.

## Go-live checklist

1. Create a Stripe account → copy keys into `.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_…
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…
   STRIPE_WEBHOOK_SECRET=whsec_…
   ```
2. Add a webhook in the Stripe dashboard → `https://<your-domain>/api/payments/webhook`
   (events: `payment_intent.succeeded`, `payment_intent.payment_failed`).
3. **Apple Pay:** in Stripe → Settings → Payment methods → Apple Pay, register both
   domains (app + website). Stripe hosts the domain-association file automatically
   for Stripe-managed domains; otherwise drop it at
   `/.well-known/apple-developer-merchantid-domain-association`.
4. Google Pay works automatically once live keys are set.
5. Test with card `4242 4242 4242 4242`, and Apple Pay in Safari on a real device.

---

## Checkout sequence (app and website are identical)

```
1. POST /api/orders/init        → PENDING order. We own order_id BEFORE any
                                  payment object exists. No charge.
2a. POST /api/payments/create-intent   (APP: Payment Sheet / Express Checkout)
2b. POST /api/payments/create-session  (WEBSITE: hosted or embedded Checkout)
3. Stripe webhook               → marks paid, freezes amount. Source of truth.
   POST /api/orders/:id/finalize is an idempotent client fallback.
```

Cart totals **our** price (`quote.ts` is the single source of truth). Shipping
address is collected before payment and is exactly what the partner order uses.

### Stale prices
`buildQuote()` re-derives the amount at intent/session creation. If the source
moved **up**, we return `409 PRICE_INCREASED` with the new total — we never
charge the old deal and hope. If it moved **down**, the customer is charged the
price they were shown. After payment the amount is **frozen**
(`paid_amount_frozen`); fulfillment is a separate state machine.

### Metadata on every Session/Intent (dispute + agent queue)
`order_id` (ours, not Stripe's), `order_number`, `customer_id`, `line_skus`,
`quoted_sell_price`, `source_last_seen_price`, `source_name` (internal only —
never customer-facing), `fulfillment_model: partner_retailer`, `ship_to_hash`
(SHA-256, no PII), `address_id`.

### Statement descriptor
`STRIPE_STATEMENT_DESCRIPTOR`, default **"50 FIRE DEALS"** (≤22 chars, uppercase,
sanitized). A recognizable descriptor is the cheapest chargeback prevention there
is when the box carries a partner's name.

### Capture mode
`STRIPE_CAPTURE_METHOD=automatic` (default) captures at checkout — simplest, and
correct when the partner buy happens minutes later; pair it with fast refunds.
Set `manual` to authorize at checkout and capture only after the partner order is
placed (`capturePaymentIntent()`); note auth windows expire (~7 days) and some
wallets behave differently.

### Idempotency
Session/Intent creation is keyed `pi_<order_id>` / `cs_<order_id>`, so a double
tap reuses the same object. `pi_`/`cs_` ids are stored on the order. A second
intent for an already-paid order returns `409 ALREADY_PAID`. The simulation
adapter is deterministic per `order_id` so it behaves the same way.

### Webhooks (verify the signature — we do)
| Event | Action |
|---|---|
| `checkout.session.completed` | create paid order (website) |
| `payment_intent.succeeded` | create paid order (app) |
| `payment_intent.payment_failed` | leave cart unpaid |
| `charge.refunded` | stop partner buy / stop shipping |
| `charge.dispute.created` | stop partner buy / stop shipping |
| `radar.early_fraud_warning.created` | pause fulfillment |

Holds set `fulfillment_hold` + `hold_reason` and surface as a red **⛔ HOLD**
badge in the admin order queue. Partner OOS after payment → **Refund** button
(`refundOrder`), never an IOU.

### One rail per SKU
Do **not** run Apple IAP in the app and Stripe on the site for the same physical
good — IAP is the wrong rail for shipped merchandise. Both front-ends use the one
Stripe account configured here.

---

## Agent guardrails (the part that prevents runaway spend)

The AI/ops agent may **never** create, capture, or modify a Stripe charge. Stripe
moves money customer → us only, via `/api/payments/*` and the webhook. The second
purchase (us → partner) is a normal consumer checkout on the partner's site using
a **separate company card**, and it can only happen through the fulfillment gate:

```
POST /api/agent/partner-buy   { orderId, partnerPrice, actor, humanOverride }
```

Rules enforced (all must pass, every decision audited):

| Rule | Purpose |
|---|---|
| `payment_paid` | never spend before money is in |
| `no_risk_hold` | blocks on dispute, Radar early-fraud warning, manual hold |
| `not_already_purchased` | idempotent — no double buy |
| `max_partner_buy` | per-order cap (default $2,000) |
| `margin_ok` | quoted − partner price − est. Stripe fee ≥ floor |
| `daily_cap` / `monthly_cap` | aggregate spend ceilings |
| `fulfillment_enabled` | global kill switch |

Defaults: $3.00 / 5% margin floor, $10k/day, $200k/month. Current prices include a gross-up for estimated processing so the target 10% markup on source cost is retained after that estimate. The margin guard remains in place for changed costs or losses. A human override must be separately authorized; it is not part of customer pricing.

Blocked calls return a `remediation` hint (`WAIT_FOR_PAYMENT`, `REFUND_OR_ESCALATE`,
`ESCALATE_TO_HUMAN`) so the agent knows what to do instead of retrying.

**Refunds** also go through a cap: `POST /api/agent/refund`. Above the cap a human
must act. Partial refunds supported for split-shipment line failures.

**Books** (Admin → Sales & Savings): gross sales, est. Stripe fees, partner COGS,
refunds, net margin. Stripe pays out in ~2 business days; partner buys hit the
card immediately — plan working capital.

## Do-not list (enforced in code)
- Secret key never leaves the server (only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ships to a client).
- Client `succeeded` is never trusted — finalize verifies with Stripe; the webhook is the source of truth.
- The agent cannot create PaymentIntents for arbitrary amounts; it can only request a partner buy through the gate.
- Statement descriptor is our brand, never the partner's.
- No Stripe Connect — we are merchant of record; the partner buy is a separate consumer transaction.
