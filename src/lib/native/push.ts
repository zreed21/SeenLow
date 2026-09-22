"use client";

import { isNativePlatform } from "./platform";

export type PushRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

/**
 * Request push permission and log the device token.
 * TODO(APNs): POST token to a SeenLow backend endpoint once APNs key +
 * topic (com.seenlow.app) are configured in App Store Connect / Apple Developer.
 */
export async function registerPushNotifications(): Promise<PushRegistrationResult> {
  if (!isNativePlatform()) {
    return { ok: false, reason: "not_native" };
  }

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") {
      return { ok: false, reason: "permission_denied" };
    }

    await PushNotifications.register();

    return await new Promise<PushRegistrationResult>((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ ok: false, reason: "timeout_waiting_for_token" });
      }, 15000);

      void PushNotifications.addListener("registration", (token) => {
        clearTimeout(timeout);
        console.info("[native] APNs / FCM device token (wire to backend):", token.value);
        // TODO: await fetch(`${PRODUCTION_ORIGIN}/api/notifications/device`, { method: "POST", body: JSON.stringify({ token: token.value, platform: getNativePlatform() }) })
        resolve({ ok: true, token: token.value });
      });

      void PushNotifications.addListener("registrationError", (err) => {
        clearTimeout(timeout);
        console.warn("[native] Push registration error", err);
        resolve({ ok: false, reason: err.error ?? "registration_error" });
      });
    });
  } catch (err) {
    console.warn("[native] Push setup failed", err);
    return { ok: false, reason: String(err) };
  }
}
