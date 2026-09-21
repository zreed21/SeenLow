# SeenLow

**SeenLow** is a US deal-discovery app operated by **SeenLow LLC** at **https://seenlow.com**.

**Tagline:** Lowest we’ve seen. Checked again before you tap.

SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.

---

## Brand

- **Brand:** SeenLow
- **Legal:** SeenLow LLC
- **Domain:** `seenlow.com`
- **Support:** `support@seenlow.com`
- **Partner / sales:** `partners@seenlow.com`
- **General:** `hello@seenlow.com`
- **Colors:** Black `#0A0A0A` · Red `#B91C1C`
- **Bundle ID:** `com.seenlow.app`

---

## Geo Contract

SeenLow is currently **US-only**:

- US storefronts only (`.com` US chains, not `.co.uk`, `.ca`, `.de`, etc.)
- USD only
- Lower-48 US street addresses only
- No Alaska / Hawaii / PO boxes / Canada / Mexico / worldwide shipping
- Affiliate links must be **US program trackers**

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your real env file
Copy the example file:
```bash
cp .env.example .env
```

Then fill in your actual values in `.env`.

### 3. Start locally
```bash
npm run dev
```

---

## Verification Commands

Run these before deploying:

```bash
bash scripts/test-payment-source-guard.sh
npx tsx scripts/test-source-leak.ts
npx next typegen
npm exec tsc -- --noEmit
npm run build
```

---

## Production Bootstrap (Neon / Vercel)

SeenLow has a safe production bootstrap path:

- creates missing tables only if absent
- loads a **small US-only catalog** only when `deals = 0`
- does **not** run the old destructive demo reseed
- preserves existing scans, orders, and catalog rows

### Manual bootstrap
```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST/DB?sslmode=require" npx tsx scripts/bootstrap-production-neon.ts
```

### Status endpoint
- `GET /api/health`
- `GET /api/system/db-status` (admin only)
- `POST /api/system/db-status` (admin only)

---

## Source Certification

Affiliate CTAs require:

- live HTTPS scan evidence
- certified source
- score threshold met
- US storefront
- US affiliate tracker

For bot-protected chains (403 / timeout), a real **test buy** may certify the source with:

- `testOrderId`
- `overrideReason`
- admin-authenticated approval path

No fake SQL flags should be used in production.

---

## Public Compliance Pages

These should be live on the same host used for publisher applications:

- `/disclosure`
- `/privacy`
- `/advertise`

---

## GitHub Push (Quick)

If you are pushing manually:

```bash
git init
git branch -M main
git add .
git commit -m "Initial SeenLow app setup"
git remote add origin https://github.com/YOURNAME/seenlow.git
git push -u origin main
```

If using GitHub Desktop:
1. Add this folder as a local repository
2. Commit changes to `main`
3. Publish repository to GitHub

---

## Important

- `.env` is ignored by `.gitignore`
- `.env.example` is safe to commit
- `node_modules/` and `.next/` are ignored
- **Do not commit real secrets**
