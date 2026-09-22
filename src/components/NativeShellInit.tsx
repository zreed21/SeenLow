"use client";

import { useEffect } from "react";
import {
  isNativePlatform,
  prepareNativeChrome,
  initDeepLinkHandlers,
  registerPushNotifications,
} from "@/lib/native";

/**
 * Mount once in the root client tree. Safe no-op on the public website.
 * On Capacitor iOS: chrome, deep-link stubs, optional push registration.
 */
export function NativeShellInit() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      await prepareNativeChrome();
      if (cancelled) return;

      unsubscribe = await initDeepLinkHandlers({
        onDealOpen: (dealId) => {
          // Prefer query-param navigation so the existing feed modal wiring can pick it up.
          try {
            const url = new URL(window.location.href);
            url.searchParams.set("deal", String(dealId));
            window.history.replaceState({}, "", url.toString());
            window.dispatchEvent(
              new CustomEvent("seenlow:open-deal", { detail: { dealId } })
            );
          } catch (err) {
            console.warn("[native] deal deep-link navigate failed", err);
          }
        },
      });

      // Soft opt-in: request permission; token logged until APNs backend exists.
      void registerPushNotifications();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return null;
}
