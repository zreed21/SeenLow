/**
 * Capacitor native bridge for SeenLow.
 * All helpers no-op safely on the public website (no Capacitor runtime).
 */

export {
  isNativePlatform,
  getNativePlatform,
  PRODUCTION_ORIGIN,
} from "./platform";
export { shareDeal } from "./share";
export { openAffiliateOrExternal } from "./browser";
export {
  registerPushNotifications,
  type PushRegistrationResult,
} from "./push";
export { initDeepLinkHandlers, parseDealIdFromUrl } from "./deeplink";
export { prepareNativeChrome, hideSplash, setStatusBarDark } from "./chrome";
