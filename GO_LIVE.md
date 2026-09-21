# SeenLow — Operational & Go-Live Brief

```
Brand: SeenLow
Spoken: "seen low"
Legal: SeenLow LLC (or SeenLow Commerce LLC)
Domain: https://seenlow.com (all endpoints lowercase seenlow.com)
Emails:
  - support@seenlow.com
  - hello@seenlow.com
  - partners@seenlow.com
Bundle ID: com.seenlow.app
Colors: Black #0A0A0A · Crimson Red #B91C1C
Catalog: United States Only (lower-48 street addresses, USD only, US storefronts)
```

## Brand Copy & Taglines

- **Tagline:** Lowest we’ve seen. Checked again before you tap.
- **Short:** Seen low. Tap through.
- **BEST DEAL:** SeenLow pick — lowest we’ve tracked in 30 days
- **One-liner:** SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.
- **Affiliate First Line:** SeenLow is a US deal-discovery app operated by SeenLow LLC at seenlow.com.

---

## 1. Run Verification Suites on SeenLow Build

```bash
bash scripts/test-payment-source-guard.sh
npx tsx scripts/test-source-leak.ts
```

Both pass against the live tree without reseeding.

---

## 2. Source Certification & Scan Workflow

- Admin scans partner domains via `POST /api/sources` using live HTTPS URLs.
- If a chain blocks scrapers (HTTP 403 / timeout) but has valid HTTPS and clean reputation, ops may certify it via authenticated `PUT /api/sources` with `action: "approve_test_buy"`, the real `testOrderId`, and an explicit `overrideReason`.
- Unscanned domains reject affiliate activation with `409 NO_LIVE_SCAN_EVIDENCE`.
- In **Admin → Monetization → Per-SKU rail → Tracking URL**, paste genuine US program links into `trackingUrl` (field `tracking_url`).

---

## 3. Publisher Review Pages (for Amazon, CJ, Awin, Impact, Rakuten)

Submit the live SeenLow URL with these active compliance endpoints:

- `https://seenlow.com/disclosure` (FTC affiliate disclosure)
- `https://seenlow.com/privacy` (Privacy Policy · SeenLow LLC)
- `https://seenlow.com/advertise` (Sponsored placements · SeenLow LLC)

**Note:** Reseeding wipes live scan evidence — do not submit applications on a freshly reseeded database.

---

## 4. DNS & Domain Setup (For Hosting & Google Workspace)

1. **Web:** Point apex `seenlow.com` and `www.seenlow.com` to the deployed host.
2. **Email (Google Workspace / Microsoft 365):**
   - MX records to mail provider.
   - **SPF:** `v=spf1 include:_spf.google.com ~all` (or equivalent).
   - **DKIM:** Generate 2048-bit selector `google._domainkey.seenlow.com`.
   - **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@seenlow.com`.
