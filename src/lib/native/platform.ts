"use client";

export const PRODUCTION_ORIGIN = "https://seenlow.com";

/** True when running inside a Capacitor native shell (iOS/Android). */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Dynamic import path avoided so web bundles do not hard-fail without Capacitor.
    // Capacitor injects window.Capacitor on native.
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor;
    return Boolean(cap?.isNativePlatform?.());
  } catch {
    return false;
  }
}

export function getNativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  try {
    const cap = (
      window as unknown as {
        Capacitor?: { getPlatform?: () => string; isNativePlatform?: () => boolean };
      }
    ).Capacitor;
    if (!cap?.isNativePlatform?.()) return "web";
    const p = cap.getPlatform?.() ?? "web";
    if (p === "ios" || p === "android") return p;
    return "web";
  } catch {
    return "web";
  }
}
