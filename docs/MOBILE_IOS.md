# SeenLow — Capacitor iOS shell

## What this scaffolds

| Piece | Location / notes |
|---|---|
| Capacitor config | `capacitor.config.ts` — `appId` `com.seenlow.app`, `appName` SeenLow |
| v1 content strategy | `server.url` = `https://seenlow.com` (native WebView loads production) |
| Plugins | App, Browser, Status Bar, Splash Screen, Push Notifications, Share, Preferences, Haptics |
| Native bridge | `src/lib/native/*` — detects Capacitor; **no-ops on web** |
| UI hooks | Share on DealCard / DealDetailModal; affiliate CTAs use Browser on native while still hitting `/api/go/[dealId]` |
| Init | `NativeShellInit` in root layout — chrome, deep-link stub, push permission stub |
| npm scripts | `cap:sync`, `cap:open:ios`, `cap:add:ios`, `mobile:prepare` |

This is **not** a bare WKWebView submission: share sheet, SFSafariViewController (Browser plugin) for outbound affiliate, splash/status bar, and push registration hooks are intentional native surfaces Apple reviewers look for. More (Face ID, offline empty state, Keychain) can land before first submit.

## Production URL vs bundled assets

**Current (v1):** `server.url: "https://seenlow.com"` so the shell always shows the live site and APIs.

**Later (bundled webDir):**

1. Comment out / remove `server.url` in `capacitor.config.ts`.
2. Point `webDir` at a static export (or a thin local shell page that talks to `https://seenlow.com` APIs).
3. Run `npm run mobile:prepare` / `npx cap sync ios`.
4. Keep affiliate tracking via absolute `https://seenlow.com/api/go/...` URLs.

## What requires a Mac

The `ios/` Xcode project **is committed** on this branch (generated via Capacitor CLI). You still need a **Mac + Xcode** to sign, archive, and upload to TestFlight — Linux cannot run the iOS toolchain.

```bash
# On a Mac (Node 22+ required for Capacitor 8 CLI)
cd SeenLow
git checkout feat/capacitor-ios-shell   # or main after merge
npm ci
npx cap sync ios
npx cap open ios         # opens Xcode
```

If you ever re-generate from scratch: `npx cap add ios` then `npx cap sync ios`.

### Open in Xcode

1. `npx cap open ios` **or** open `ios/App/App.xcworkspace` (after `pod install` if CocoaPods prompts).
2. Signing & Capabilities → Team = Zach Reed (individual).
3. Bundle Identifier = `com.seenlow.app`.
4. Add **Push Notifications** capability.
5. Optional: Associated Domains → `applinks:seenlow.com`.
6. Product → Archive → Distribute to TestFlight.

## App Store Connect checklist (pointer)

Full store narrative lives in [STORE_LAUNCH.md](../STORE_LAUNCH.md). Short list:

- [ ] App ID `com.seenlow.app` registered; Push enabled
- [ ] App record created (SeenLow, US English)
- [ ] Agreements / Tax / Banking complete
- [ ] Icons (1024 App Store + asset catalog), splash aligned with `#020617`
- [ ] Screenshots for required device sizes
- [ ] Privacy nutrition labels (affiliate, account, payments via Stripe — no IAP)
- [ ] Age rating; US distribution
- [ ] Review notes: physical goods, Stripe external, affiliate outbound, `/account-deletion`
- [ ] TestFlight build with certified deals live on seenlow.com
- [ ] APNs key + backend endpoint to store device tokens (bridge logs token today)

## Reminders

- **Do not use IAP** for physical goods / fulfillment (Guideline 3.1.3(e)).
- **US-only** first.
- Do not commit `.env`, provisioning profiles, or APNs `.p8` keys.
- Keep the Next.js website working; Capacitor is additive.

## Push stub (current)

`registerPushNotifications()` requests permission and logs the device token. Wire a backend route (e.g. POST device token + platform) before relying on price-drop / midnight-drop pushes in production.
