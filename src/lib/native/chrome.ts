"use client";

import { isNativePlatform } from "./platform";

export async function setStatusBarDark(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#020617" });
  } catch (err) {
    console.warn("[native] StatusBar failed", err);
  }
}

export async function hideSplash(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* optional */
  }
}

/** Status bar + splash housekeeping after the WebView is ready. */
export async function prepareNativeChrome(): Promise<void> {
  if (!isNativePlatform()) return;
  await setStatusBarDark();
  await hideSplash();
}
