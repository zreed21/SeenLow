# SeenLow — iOS and Android store path

There is **no native app in this repo**. Production is a Next.js site at seenlow.com. Bundle ID reserved in brand docs: `com.seenlow.app`. Do not wrap the site in a bare WebView and submit; Apple rejects that under Guideline 4.2.

Physical goods / partner-fulfillment checkout uses **external payment (Stripe), not Apple IAP**. That is required for shipped items (Guideline 3.1.3(e)). Affiliate tap-through is also external. Do not add StoreKit for headphones and TVs.

## iOS (App Store)

1. Enroll **Apple Developer Program** as **SeenLow LLC** (organization), $99/year. D-U-N-S + docs take days to weeks.
2. App Store Connect: Agreements, Tax, and Banking before first upload.
3. Register explicit App ID `com.seenlow.app` (cannot change after first build).
4. Builds must use current required Xcode/SDK (as of Apr 28, 2026: Xcode 26 / iOS 26 SDK; newer SDKs accepted as Apple ships them).
5. Create the app record: name SeenLow, primary US English, SKU internal.
6. Listing: 30-char name, subtitle, screenshots per device size, privacy nutrition label, age rating questionnaire (answer social-media questions; this app is not social).
7. Review notes: demo admin account, explanation that catalog is US physical goods, Stripe for reseller, outbound affiliate for tap-through.
8. Native shell must add more than Safari: push (price drop / midnight drop), Face ID on sign-in, offline empty state, Keychain session. Then load seenlow.com or the same APIs.
9. TestFlight first. Submit only when the website shows certified deals, not a zero-item feed.

## Android (Google Play)

1. Play Console: organization account for SeenLow LLC if possible (D-U-N-S). Personal accounts created after Nov 13, 2023 need **12 opted-in testers for 14 continuous days** before production access.
2. One-time registration fee **$25**.
3. Upload **AAB**, target current required API (Android 16 / API 36 as of Aug 31, 2026 for new apps and updates).
4. Data safety form, content rating (IARC), store listing, US distribution first.
5. Internal test → closed test → production access questionnaire with specific tester evidence.
6. Same product rule: physical goods, external checkout, no Play Billing for shipped SKUs.

## Recommended build approach later

- Capgo / Capacitor or Expo wrapping the existing Next APIs, plus the native extras above.
- One codebase, `com.seenlow.app` on both stores if Android applicationId matches or use `com.seenlow.app` / `com.seenlow.android` consistently.
- Do not ship until `certifiedSellableCount > 0` and disclosure/privacy/advertise pages stay live.

## Cost / calendar (realistic)

| Item | Time / money |
|---|---|
| Apple org enrollment | $99/year + D-U-N-S wait |
| Play org or personal + closed test | $25 once + 14+ days testers |
| Native shell + store assets | days to weeks after website catalog works |
| Review | often < 24h on iOS if complete; Play closed test is the long pole |
