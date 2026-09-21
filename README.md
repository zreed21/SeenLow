# SeenLow

**Lowest we’ve seen. Checked again before you tap.**

SeenLow is a US-only deal-discovery application operated by Zach Reed doing business as SeenLow at [seenlow.com](https://seenlow.com). It monitors approved US retailer sources, publishes certified deals, rechecks pricing and availability, supports tracked affiliate redirects, and maintains a separately governed reseller checkout fallback.

## Brand

- Brand: **SeenLow**
- Operator: **Zach Reed d/b/a SeenLow** (no LLC formed yet)
- Website: `https://seenlow.com`
- Support: `support@seenlow.com`
- Colors: `#0A0A0A` and `#B91C1C`
- Bundle ID: `com.seenlow.app`

## Stack

- Next.js App Router
- TypeScript
- PostgreSQL / Neon
- Drizzle ORM
- Stripe PaymentIntents and Checkout Sessions
- Tailwind CSS

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the safe environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Add your local PostgreSQL connection to `.env.local`.

4. Apply the schema:

   ```bash
   npx drizzle-kit push
   ```

5. Start development:

   ```bash
   npm run dev
   ```

## Required validation

Before merging or deploying:

```bash
bash scripts/test-payment-source-guard.sh
npx tsx scripts/test-source-leak.ts
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```

## Production database bootstrap

The production bootstrap is non-destructive:

- Creates tables only if missing.
- Inserts the small US-only review catalog only when `deals` is empty.
- Runs the real source scanner for every source domain.
- Keeps HTTP 403, timeout, unreadable, or suspicious sources on hold.
- Never creates affiliate tracking URLs.
- Preserves existing deals, scans, orders, users, and source records.

Manual Neon bootstrap:

```bash
DATABASE_URL="postgres://USER:PASSWORD@NEON_HOST/DB?sslmode=require" \
npx tsx scripts/bootstrap-production-neon.ts
```

See [`GO_LIVE.md`](./GO_LIVE.md) for deployment details.

## Geo contract

- United States catalog only.
- USD only.
- Lower-48 street-address reseller shipping only.
- No Alaska, Hawaii, PO boxes, Canada, Mexico, or international checkout.
- Affiliate URLs must be genuine US-program HTTPS tracking links.
- No currency conversion to manufacture a deal.

## Important security notes

Never commit:

- `.env`
- `.env.local`
- Neon connection strings
- Stripe secret keys or webhook secrets
- SMTP passwords
- OpenAI keys
- Shared API keys

Commit `.env.example` only. It contains variable names and safe defaults, not credentials.
