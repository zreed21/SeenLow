# Dual-rail monetization — affiliate redirect + reseller fallback

Nothing flipped in one release. Both rails run side by side; new traffic defaults
to redirect; Stripe remains for old orders and sources with no affiliate program.

## How a SKU picks its rail (`src/lib/monetization.ts` → `resolveRail`)

| SKU state | Customer sees |
|---|---|
| `affiliate_status=approved` + HTTPS `tracking_url` | **Buy at [Store] · their price** (tracked redirect). Stripe OFF. Optional vetted secondary: *Have us buy it · old formula price*. |
| No program / not applied | Reseller checkout exactly as before (our price, our fulfillment policy). |
| Advertiser rejected + reseller frozen | **Hidden.** Hiding beats thin-margin arbitrage. |

Affiliate cards show the retailer's own price (no +10%, no processing gross-up)
and carry the FTC disclosure **"We may earn a commission if you buy."** on the
card and at the button — not only in Terms. Reseller cards keep the merchant-of-
record pricing, disclosures, and partner-fulfillment FAQ. Two policies, two CTAs.

## Pre-tap revalidation (`/api/go/[dealId]`)

Every outbound tap re-checks source certification, kill status, and stock before
the 302. Dead deal → bounce back to the feed with `?redirect=dead`; the shopper
never lands on an $80 page we labeled $49. Every tap (sent or blocked) is logged
in `affiliate_clicks` with the price shown, for commission reconciliation.

## Stripe gating

`/api/orders/init`, `create-intent`, and `create-session` return
`409 AFFILIATE_ONLY` (with the redirect path) for approved-affiliate SKUs unless
the SKU is on the reseller allowlist. Old paid orders finish as reseller —
buyers are never stranded.

## BEST DEAL module (`/api/best-deal`)

One organic winner: `score = drop vs 30-day observed high × (source score/100)`,
must be live on last check, affiliate-approved or reseller fallback, never
sponsored. Below `bestDealMinScore` (default 0.10) it says **"No standout deal
right now"** instead of faking a $3-off winner. The card shows why it won and
when it was last checked. Sponsored slots render beside it, always labeled,
never as it.

## Sponsored (near-cash line)

`/advertise` sells exactly one product: a labeled promoted card, flat weekly
fee, one per screen. Slots are managed in Admin → Monetization.

## 30-day cutover (Admin → Monetization)

- **Days 1–7:** `/disclosure`, `/privacy`, `/advertise` are live (networks
  reject app-only publishers). File applications in order: Amazon Associates →
  CJ → Awin → impact.com + Rakuten → FlexOffers → eBay PN (tracker seeded with
  signup URLs and pitch notes). Mark each SKU's network/tracking URL as
  approvals land — the moment a SKU has an approved link, Stripe shuts off
  for it automatically.
- **Days 8–21:** dual inventory. Approved+allowlisted → redirect; no program →
  reseller or hidden.
- **Day 22+:** toggle **Freeze reseller**; "Have us buy it" survives only on the
  per-SKU allowlist.

## Cashback (deliberately locked)

Schema and switch exist, but the API refuses to enable cashback until
`firstCommissionPaidAt` is recorded. Networks pay net-30/60; paying rebates from
checking before the network pays is how deal apps die. When enabled later:
credit 30–50% of *our commission* (never of product price), hold through the
merchant return window, and honor per-program cashback bans (those SKUs stay
redirect-only, no rebate).

## Honest constraint

Redirect is easier ops and slower cash. Amazon's 3-sales-in-180-days rule and
slow big-box approvals are tracked in the network checklist. The BEST DEAL slot
plus watchlist alerts is the retention engine while the first commissions clear.
