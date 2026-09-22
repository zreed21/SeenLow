import type { CapacitorConfig } from "@capacitor/cli";

/**
 * SeenLow Capacitor shell (v1).
 *
 * Loads the production site so the native app shares the live Next.js APIs,
 * catalog, and checkout without duplicating the web stack.
 *
 * To switch to bundled web assets later (offline shell / App Store binary
 * that does not depend on seenlow.com at launch):
 *   1. Remove or comment out `server.url` below.
 *   2. Set `webDir` to your static export (e.g. `out` after `next export`
 *      or a dedicated mobile build that copies public assets).
 *   3. Run `npm run mobile:prepare && npx cap sync ios`.
 *   4. Point API calls at https://seenlow.com (or NEXT_PUBLIC_APP_URL).
 */
const config: CapacitorConfig = {
  appId: "com.seenlow.app",
  appName: "SeenLow",
  webDir: "public",
  server: {
    // v1 native shell: load production. Affiliate redirects and Stripe stay on HTTPS.
    url: "https://seenlow.com",
    cleartext: false,
    allowNavigation: [
      "seenlow.com",
      "*.seenlow.com",
      "checkout.stripe.com",
      "*.stripe.com",
    ],
  },
  ios: {
    scheme: "SeenLow",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    // Allows SFSafariViewController / Browser plugin flows for outbound affiliate.
    allowsLinkPreview: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#020617",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#020617",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
