# Integration Guide — Shared Backend for App + Website

This project is built **API-first** so the current app and a future marketing/storefront
website run on **one shared backend, one database, one payment system, one auth
session**. Nothing needs to be rebuilt to add the website.

## Architecture

```
                 ┌────────────────────────────┐
   This app ───▶ │  Next.js API (/api/*)      │ ◀─── Future website
  (same origin)  │  • deals / verify          │   (different origin,
                 │  • auth (cookie session)   │    uses apiClient.ts +
   Mobile app ─▶ │  • payments (Stripe)       │    X-API-Key / CORS)
                 │  • orders + documents      │
                 │  • newsletter / policies   │
                 └──────────────┬─────────────┘
                                │
                        PostgreSQL (Drizzle)
```

## What makes it mirror-able

1. **Every feature is an HTTP endpoint.** The UI holds no business logic that isn't
   also reachable over the API (pricing, tax, live verification, order creation,
   documents, auth, newsletter, policies all live server-side).
2. **`src/lib/apiClient.ts`** is a zero-dependency client you can copy straight into
   the website (React/Vue/Svelte/plain JS). It already wraps every endpoint.
3. **CORS + optional shared key** (`src/lib/apiAccess.ts`, `next.config.ts`) let a
   separate origin call the API safely. Set `API_ALLOWED_ORIGINS` and `API_SHARED_KEY`.
4. **Cookie session auth** (`src/lib/auth.ts`) works across sub-domains — host the
   website at `www.` and the API/app at `app.` on the same parent domain and a
   sign-in carries over. Guests need no account.
5. **Payments are provider-abstracted** and configured once (see `PAYMENTS.md`).
6. **Policy copy is data, not code** (`/api/policies`) so both front-ends show the
   same legally-reviewed disclosures without duplicating text.

## Using the shared client from the website

```ts
import { createFireDealsClient } from "./apiClient"; // copied from this repo

const api = createFireDealsClient({
  baseUrl: "https://app.50dailyfiredeals.com",
  apiKey: process.env.FIRE_DEALS_API_KEY, // matches API_SHARED_KEY
});

const { deals } = await api.listDeals({ top50: true, sortBy: "discount_desc" });
const cfg = await api.paymentConfig();       // { provider, publishableKey, wallets }
const { orderId, totals } = await api.initOrder({
  dealId, shippingAddress, userEmail: email, displayedPrice,
  acceptedPriceIncrease: true, acceptedTotal: reviewedQuote.total,
});
// Set acceptedTotal only after the customer actually reviews that exact total.
const intent = await api.createPaymentIntent(orderId, totals.total);
// → mount Stripe Express Checkout with intent.clientSecret (Apple/Google Pay + card)
```

## Endpoint map (all live today)

| Area | Endpoint |
|------|----------|
| Deals | `GET /api/deals`, `GET /api/deals/:id`, `POST /api/deals/:id/verify` |
| Auth | `POST /api/auth/register\|login\|logout`, `GET /api/auth/me` |
| Payments | `GET /api/payments/config`, `POST /api/payments/create-intent`, `POST /api/payments/webhook` |
| Orders | `GET/POST /api/orders`, `GET/PUT /api/orders/:id` |
| Documents | `GET /api/documents/:orderId/invoice`, `GET /api/documents/:orderId/blind-shipping` |
| Growth | `POST /api/newsletter`, `GET/PUT /api/policies`, `GET /api/stats` |

## Deployment shape (recommended)

- `app.50dailyfiredeals.com` — this Next.js app (also serves the API).
- `www.50dailyfiredeals.com` — future website; imports `apiClient.ts`, same parent
  domain so the session cookie is shared.
- One PostgreSQL instance, one Stripe account, one set of env vars.

## Shared pricing

All front-ends use the fee-inclusive sale pricing in `src/lib/pricing.ts`; see `PRICING.md`. Do not add a 10% or processor-fee line to a cart. `PRICE_INCREASED` supplies the current `breakdown` to review. Approval is the exact `acceptedTotal`, not a blanket permission to charge any higher amount. `CHECKOUT_CHANGED` requires a fresh order/payment attempt; never reuse an old intent with new cents. Existing paid orders keep their original amounts.
