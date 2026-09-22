"use client";

import { isNativePlatform } from "./platform";

/** Extract deal id from seenlow URLs or custom scheme: seenlow://deal/123 */
export function parseDealIdFromUrl(url: string): number | null {
  try {
    const custom = url.match(/(?:seenlow:\/\/deal\/|deal[=/])(\d+)/i);
    if (custom?.[1]) {
      const id = Number(custom[1]);
      return Number.isSafeInteger(id) && id > 0 ? id : null;
    }
    const u = new URL(url);
    const q = u.searchParams.get("deal");
    if (q) {
      const id = Number(q);
      return Number.isSafeInteger(id) && id > 0 ? id : null;
    }
    const path = u.pathname.match(/\/deal\/(\d+)/i);
    if (path?.[1]) {
      const id = Number(path[1]);
      return Number.isSafeInteger(id) && id > 0 ? id : null;
    }
  } catch {
    /* ignore malformed */
  }
  return null;
}

export type DeepLinkHandlers = {
  onDealOpen?: (dealId: number) => void;
  onUrl?: (url: string) => void;
};

/**
 * Listen for app URL opens (universal links / custom scheme).
 * Returns an unsubscribe function. No-op on web.
 */
export async function initDeepLinkHandlers(
  handlers: DeepLinkHandlers
): Promise<() => void> {
  if (!isNativePlatform()) {
    return () => undefined;
  }

  try {
    const { App } = await import("@capacitor/app");

    const handle = (url: string) => {
      handlers.onUrl?.(url);
      const dealId = parseDealIdFromUrl(url);
      if (dealId != null) handlers.onDealOpen?.(dealId);
    };

    const launch = await App.getLaunchUrl();
    if (launch?.url) handle(launch.url);

    const listener = await App.addListener("appUrlOpen", (event) => {
      handle(event.url);
    });

    return () => {
      void listener.remove();
    };
  } catch (err) {
    console.warn("[native] Deep link init failed", err);
    return () => undefined;
  }
}
