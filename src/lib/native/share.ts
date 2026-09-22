"use client";

import { isNativePlatform, PRODUCTION_ORIGIN } from "./platform";

export type ShareDealInput = {
  dealId: number;
  title: string;
  /** Absolute or path URL; defaults to production deal deep link. */
  url?: string;
  text?: string;
};

/**
 * Share a deal via the native share sheet, or Web Share API / clipboard fallback on web.
 */
export async function shareDeal(input: ShareDealInput): Promise<boolean> {
  const url =
    input.url ??
    `${PRODUCTION_ORIGIN}/?deal=${encodeURIComponent(String(input.dealId))}`;
  const title = input.title || "SeenLow deal";
  const text =
    input.text ??
    `Check this deal on SeenLow: ${title}`;

  if (isNativePlatform()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, url, dialogTitle: "Share deal" });
      try {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        /* haptics optional */
      }
      return true;
    } catch (err) {
      console.warn("[native] Share failed", err);
      return false;
    }
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      // User cancel is fine
      if ((err as Error)?.name === "AbortError") return false;
      console.warn("[web] navigator.share failed", err);
    }
  }

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
