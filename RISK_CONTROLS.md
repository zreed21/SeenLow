# Source certification and SKU kill controls

## Source gate — required before a SKU can publish

No source record means no listing. Public deal APIs always require `ok_to_sell=true`, `is_active=true`, and a non-killed health status.

`src/lib/sourceCertification.ts` safely scans an exact HTTPS product URL and stores:

- domain, first/last seen, DNS/HTTPS result, RDAP domain age;
- contact, policy, normal card-checkout, business-imprint signals;
- suspicious payment/counterfeit/placeholder signals;
- score, raw evidence JSON, block/hold reason, approver and expiry;
- test-buy reference, paid/delivered/cancel/return history.

Private/local-network URLs are rejected to prevent SSRF. A known-chain source can be allowlisted for 90 days. An unknown source must score at least 70 **and pass a recorded test buy**. A score never approves a source by itself. High-risk categories are allowlist-only.

### Optional AI review

Set `OPENAI_API_KEY` and optionally `OPENAI_SOURCE_RISK_MODEL`. A strict structured-output review assesses only the stored evidence for fraud/fake-site/counterfeit/identity/fulfillment concerns. AI can only reduce a score or recommend hold. It cannot add points, approve, allowlist, or bypass a test buy. If the AI call fails, it recommends hold rather than silently approving.

### Source operational rules

- Non-allowlisted sources are rescored hourly; expired allowlists are rescanned.
- First five paid orders from a new non-chain source require human partner-buy approval.
- 8–15% partner cancel-after-pay rate: hold/review.
- Above 15%, or 3 cancels in first 15 paid orders: block the source and every linked SKU.
- After 20 delivered orders with cancel <10%, returns <8%, and a passed test buy: promote to a 90-day performance allowlist.

## Four price observations

`price_observations` is append-only and records source snapshot, full partner cost, customer sale price, availability, order, evidence and timestamp at:

1. `midnight` — scheduled catalog rebuild;
2. `viewed` — customer opens details;
3. `before_sale` — checkout verification and Session/Intent creation;
4. `after_sale` — immediately after payment succeeds.

Admin → Price Audit displays all four. Price/payment logic is in `PRICING.md`.

## SKU outcomes — three rates, not one

- `partner_cancel`: source cancels/OOS after payment; not a return.
- `change_of_mind`: customer chose to return; tracked separately.
- ugly product failures: `defect`, `wrong_item`, `damaged`, `not_as_described` (plus safety complaint).

### Kill rules

- No mature-rate auto-kill before 10 delivered.
- Exception: two ugly returns in the first 10 → hard kill.
- Ugly rate ≥5% → review; ≥8% → auto-hide; ≥10% → hard kill.
- Fragile SKU: two damage tickets → hard kill.
- Safety-risk category: first safety complaint → hard kill.
- Partner cancel: review at 8–15%; kill over 15% or 3 in first 15 paid.
- Last 20 terminal outcomes net ≤0 → hide even when the return rate is low.
- Change-of-mind never increments the ugly return counter.

A hidden/killed SKU gets `ok_to_sell=false`, leaves Top 50 and email inventory, retains a graveyard reason, and hard kills receive a 30-day relist block. Source approval cannot override a SKU kill.

Admin → SKU Health records outcomes and shows kill reasons. Temporary regression suites:

- `npx tsx scripts/test-risk-controls.ts`
- `npx tsx scripts/test-source-gate.ts`
