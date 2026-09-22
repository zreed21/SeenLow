# SeenLow — iOS and Android store path

Production is a Next.js site at **https://seenlow.com**. Bundle / App ID: **`com.seenlow.app`**. App name: **SeenLow**.

Do **not** wrap the site in a bare WKWebView and submit; Apple rejects that under Guideline 4.2. This repo now includes a **Capacitor iOS shell** (`capacitor.config.ts`, native bridge under `src/lib/native/`, plugins for share / browser / push / status bar / splash) so the native app loads production with real native capability hooks. See **[docs/MOBILE_IOS.md](./docs/MOBILE_IOS.md)** for Mac/Xcode steps.

Physical goods / partner-fulfillment checkout uses **external payment (Stripe), not Apple IAP**. That is required for shipped items (Guideline 3.1.3(e)). Affiliate tap-through is also external. Do **not** add StoreKit for headphones and TVs. **US-only** catalog and distribution first.

## Operator identity (enrollment)

SeenLow is operated by **Zach Reed doing business as SeenLow**. A limited liability company has **not** been formed yet.

Until an LLC exists, enroll store developer accounts as an **individual** (Zach Reed / personal Apple ID and Play Console personal developer account). Do **not** invent an LLC name on Apple or Google forms.

**Apple Developer Program (individual, paid) — done.** Continue with App ID, signing, and TestFlight below.

When an LLC is formed later, update Disclosure / Privacy / Terms and migrate (or re-enroll) to an organization account if desired. D-U-N-S and org docs only apply after a real legal entity exists.

> Note: If PR #1 (`fix/web-parity-store-readiness`) is still open, merge or rebase this Capacitor work as needed so website parity and store docs stay aligned.

## iOS (App Store) — Capacitor path

**No Mac?** Use Codemagic CI ([docs/CODEMAGIC_IOS.md](./docs/CODEMAGIC_IOS.md)) — connect GitHub, add App Store Connect API key named exactly `Codemagic SeenLow`, set `APP_STORE_APPLE_ID`, run workflow `ios-testflight`. Local Mac/Xcode steps below remain optional.

1. **Apple Developer (paid individual)** — already enrolled.
2. App Store Connect: complete **Agreements, Tax, and Banking** before first upload.
3. Register explicit App ID **`com.seenlow.app`** (Identifiers → App IDs). Enable capabilities you will use:
   - Push Notifications
   - Associated Domains (optional, for `https://seenlow.com` universal links)
4. Create the app record in App Store Connect: name **SeenLow**, primary language US English, SKU internal, bundle `com.seenlow.app`.
5. On a **Mac** with Xcode (see `docs/MOBILE_IOS.md`):
   ```bash
   git clone https://github.com/zreed21/SeenLow.git && cd SeenLow
   git checkout feat/capacitor-ios-shell   # or main after merge
   npm ci
   npx cap add ios          # if ios/ not already in the repo
   npx cap sync ios
   npx cap open ios
   ```
6. In Xcode: select team (Zach Reed), signing for `com.seenlow.app`, add **Push Notifications** capability, set display name SeenLow, attach icons/splash assets.
7. Builds must use Apple’s current required Xcode/SDK (check App Store Connect → Xcode Cloud / SDK requirements; as of Apr 28, 2026 guidance in older notes referenced Xcode 26 / iOS 26 SDK — verify at build time).
8. Listing: 30-char name, subtitle, screenshots per device size, **privacy nutrition label**, age rating questionnaire (this app is not social).
9. Review notes: demo admin account if needed; catalog is **US physical goods**; Stripe for reseller checkout; outbound affiliate for tap-through; point reviewers at live `/account-deletion` and support@seenlow.com. Remind: **no IAP for physical goods**.
10. Native shell already scaffolds: production URL load, share sheet, in-app browser for affiliate `/api/go/[dealId]`, push permission stub, status bar / splash, deep-link stub. Still add before submit when ready: Face ID on sign-in, offline empty state, Keychain session, APNs backend wiring.
11. **TestFlight** first. Submit only when the website shows certified deals (`certifiedSellableCount > 0`), not a zero-item feed.

## Android (Google Play)

1. Play Console: start with a **personal / individual** developer account for Zach Reed. Organization accounts need a real legal entity and D-U-N-S; wait until LLC formation. Personal accounts created after Nov 13, 2023 need **12 opted-in testers for 14 continuous days** before production access.
2. One-time registration fee **$25**.
3. Upload **AAB**, target current required API (Android 16 / API 36 as of Aug 31, 2026 for new apps and updates).
4. Data safety form, content rating (IARC), store listing, US distribution first. Host a public account-deletion URL (this site’s `/account-deletion`) for Play’s web resource requirement.
5. Internal test → closed test → production access questionnaire with specific tester evidence.
6. Same product rule: physical goods, external checkout, no Play Billing for shipped SKUs. Capacitor Android can follow the same `appId` later (`npx cap add android`).

## Cost / calendar (realistic)

| Item | Time / money |
|---|---|
| Apple individual enrollment | $99/year (done) |
| Play personal + closed test | $25 once + 14+ days testers |
| Capacitor shell + store assets | Mac/Xcode + icons/splash/screenshots + push certs |
| Review | often < 24h on iOS if complete; Play closed test is the long pole |
