# Archived Option A — payment-write guard findings only

**Status:** archived. Do not ship this tree or merge its broader application changes.

Option B is the production tree because it reproduced the DB-only source leak on a red test, fixed reads on both rails, and locked the regression in `scripts/test-source-leak.ts`.

The only findings retained from Option A were the payment-write cousin of that bug:

1. Every **new charge** path must perform the same live source-row check (`sourceSellableForDeal` / `sourceCanPublish`), never trust cached `deal.okToSell` or `deal.isActive` flags:
   - `POST /api/orders/init`
   - legacy/simulation `POST /api/orders`
   - `POST /api/payments/create-intent`
   - `POST /api/payments/create-session`
   - simulation-only `POST /api/orders/:id/finalize` when no PaymentIntent exists
2. A DB-only source block must return `409 SOURCE_NOT_CERTIFIED` on all those paths even if the deal flags remain stale and true.
3. **Do not block reconciliation after provider success.** If an existing PaymentIntent is `succeeded`, `processing`, or `requires_capture`, finalize must reconcile it even if the source was blocked after authorization. Otherwise the customer is charged at Stripe while the internal order is orphaned.
4. The webhook remains the source of truth. Client finalize is only an idempotent fallback.

Port verification lives in:

- `scripts/test-payment-source-guard.sh` — eight-path curl/DB matrix plus the provider-confirmed reconciliation exception.
- `scripts/test-source-leak.ts` — permanent DB-only block read-path regression.

No other Option A behavior was merged.
