"use client";

import { isNativePlatform, PRODUCTION_ORIGIN } from "./platform";

/**
 * Open an affiliate / reseller URL.
 * Prefer going through `/api/go/[dealId]` so tracking + dead-deal checks still run.
 * On native, uses the Capacitor Browser plugin (SFSafariViewController) so the
 * shell is more than a bare WKWebView for outbound commerce.
 * On web, falls back to window.open / location.
 */
export async function openAffiliateOrExternal(options: {
  dealId: number;
  /** Relative tracking path e.g. `/api/go/123` — preferred. */
  redirectPath?: string | null;
  /** Absolute fallback URL if no tracking path. */
  absoluteUrl?: string | null;
}): Promise<void> {
  const path =
    options.redirectPath?.trim() ||
    `/api/go/${options.dealId}`;
  const url = path.startsWith("http")
    ? path
    : `${PRODUCTION_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

  if (isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, presentationStyle: "popover" });
      return;
    } catch (err) {
      console.warn("[native] Browser.open failed; falling back", err);
    }
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
