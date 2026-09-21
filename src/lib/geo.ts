/**
 * GEO CONTRACT — United States only. Do not violate.
 *
 * Catalog, prices, and shipping assumptions are US-only. Source URLs must be
 * US storefronts (amazon.com, target.com, walmart.com — never .co.uk / .ca /
 * .de). All-in price = item + US shipping to a lower-48 address. Currency is
 * USD only — never FX-convert a foreign price to invent a deal. Affiliate
 * trackers must be the US program link. No country pickers, no "ships
 * worldwide," no other locales. Canada/Mexico/worldwide are explicitly out of
 * scope (different tax, networks, and return laws; customs = chargebacks).
 */

export const GEO_CONTRACT =
  "US only: US storefronts, USD prices, lower-48 shipping assumptions. Hide any source whose registrable domain is not a US storefront; never FX-convert a foreign price into a deal.";

/** One line for the crawler prompt. */
export const CRAWLER_GEO_PROMPT =
  "GEO: index US storefronts only (.com US chains on the allowlist); skip any non-US country storefront (.co.uk/.ca/.de/…); assume USD and lower-48 US shipping; if ship-to-US is unavailable or quote-only, do not list the SKU.";

/** Displayed wherever the customer sees prices or shipping. */
export const GEO_CUSTOMER_LINE =
  "US only · Prices in USD · Ships to lower-48 US addresses (excludes AK/HI/PO boxes)";

/** The only currency this codebase may charge, format, or store. */
export const CURRENCY = "USD" as const;

/** US storefront allowlist (registrable domains). Unknown US-generic domains go
 *  through hold + scan + test buy; non-US country storefronts never publish. */
export const US_STORE_ALLOWLIST = new Set([
  "amazon.com", "bestbuy.com", "target.com", "walmart.com", "bhphotovideo.com", "costco.com", "rei.com",
  "williams-sonoma.com", "nordstrom.com", "homedepot.com", "nike.com", "samsung.com", "dell.com", "lenovo.com",
  "adorama.com", "sephora.com", "crutchfield.com", "newegg.com", "onepeloton.com", "nordictrack.com",
  "acehardware.com", "bloomingdales.com", "dickssportinggoods.com", "weber.com", "ooni.com", "solostove.com",
]);

/** Multi-part public suffixes, so amazon.co.uk is not misread as "co.uk". */
const MULTI_PART_SUFFIXES = [
  "co.uk", "org.uk", "me.uk", "com.au", "net.au", "co.jp", "co.in", "com.mx", "com.br",
  "com.tr", "co.za", "com.sg", "com.hk", "com.tw", "co.kr", "com.co", "com.ar", "com.pe",
];

/** Country-code TLDs and country storefront markers. Anything matching = non-US. */
const NON_US_TLD = new Set([
  "uk", "ca", "de", "fr", "es", "it", "nl", "be", "se", "no", "dk", "fi", "pl", "pt", "ie",
  "at", "ch", "au", "nz", "jp", "cn", "kr", "in", "mx", "br", "ar", "cl", "co", "sg", "hk",
  "tw", "ae", "sa", "za", "ng", "eg", "tr", "ru", "ua", "gr", "cz", "hu", "ro", "th", "vn",
  "ph", "my", "id",
]);

export function registrableDomain(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  for (const suffix of MULTI_PART_SUFFIXES) {
    if (host === suffix || host.endsWith(`.${suffix}`)) {
      const rest = host.slice(0, -suffix.length - 1).split(".");
      return `${rest[rest.length - 1] || ""}.${suffix}`.replace(/^\./, "");
    }
  }
  const parts = host.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : host;
}

export function isNonUsStorefrontHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  for (const suffix of MULTI_PART_SUFFIXES) {
    if (host === suffix || host.endsWith(`.${suffix}`)) return true;
  }
  const tld = host.split(".").pop() || "";
  return NON_US_TLD.has(tld);
}

export function isUsStorefrontUrl(rawUrl: string): { ok: boolean; domain: string; reason: string } {
  let host: string;
  try {
    host = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`).hostname.toLowerCase();
  } catch {
    return { ok: false, domain: "", reason: "Source URL is not a valid URL." };
  }
  const domain = registrableDomain(host);
  if (isNonUsStorefrontHost(host)) {
    return { ok: false, domain, reason: `Non-US storefront (${domain}). US-only catalog: amazon.com / target.com / walmart.com style domains, never .co.uk / .ca / .de.` };
  }
  return { ok: true, domain, reason: "US storefront host." };
}

export function isUsStorefrontDomain(domain: string | null | undefined): boolean {
  if (!domain) return false;
  if (isNonUsStorefrontHost(domain)) return false;
  return true;
}

/** Locale markers that prove a tracker belongs to a non-US program. */
const NON_US_TRACKER_MARKERS = [
  "amazon.co.uk", "amazon.ca", "amazon.de", "amazon.fr", "amazon.es", "amazon.it", "amazon.co.jp",
  "amazon.com.au", "amazon.com.mx", "amazon.in", "amazon.ae", "amazon.sg",
  "walmart.ca", "walmart.com.mx", "bestbuy.ca", ".co.uk", ".com.au", ".com.mx",
  "/en-gb/", "/fr-ca/", "/en-ca/", "/de-de/", "/fr-fr/", "/es-mx/", "/es-es/", "/it-it/",
  "locale=uk", "locale=ca", "locale=de", "country=gb", "country=ca", "country=de",
];

export function isUsAffiliateTracker(rawUrl: string): { ok: boolean; reason: string } {
  const url = String(rawUrl || "");
  if (!/^https:\/\//i.test(url)) return { ok: false, reason: "Tracking URLs must be HTTPS" };
  const lower = url.toLowerCase();
  const hit = NON_US_TRACKER_MARKERS.find((marker) => lower.includes(marker));
  if (hit) return { ok: false, reason: `Tracking URL looks like a non-US program link (${hit}). Affiliate links must be the US program tracker.` };
  return { ok: true, reason: "US program tracker." };
}

/** Lower-48 + DC. AK/HI excluded: sources price and ship lower-48 only. */
export const LOWER48 = new Set([
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
  "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA",
  "WA", "WV", "WI", "WY",
]);

const PO_BOX = /\b(p\.?\s*o\.?\s*box|post\s*office\s*box|apo|fpo|dpo)\b/i;

export interface ShipToInput {
  country?: unknown;
  state?: unknown;
  street?: unknown;
  apt?: unknown;
  zipCode?: unknown;
}

export function validateUsShipTo(address: ShipToInput): { ok: boolean; code: string; error: string } {
  const country = String(address?.country ?? "").trim().toLowerCase();
  if (country && !["united states", "usa", "us", "u.s.", "u.s.a."].includes(country)) {
    return { ok: false, code: "NON_US_ADDRESS", error: "We currently ship to US addresses only." };
  }
  const state = String(address?.state ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(state) || !LOWER48.has(state)) {
    if (state === "AK" || state === "HI") {
      return { ok: false, code: "NON_US_ADDRESS", error: "We currently ship to lower-48 US addresses only (excludes AK/HI)." };
    }
    return { ok: false, code: "NON_US_ADDRESS", error: "A valid lower-48 US state is required." };
  }
  const streetLine = `${String(address?.street ?? "")} ${String(address?.apt ?? "")}`;
  if (PO_BOX.test(streetLine)) {
    return { ok: false, code: "NON_US_ADDRESS", error: "PO boxes and military addresses are not supported; use a lower-48 street address." };
  }
  return { ok: true, code: "OK", error: "" };
}
