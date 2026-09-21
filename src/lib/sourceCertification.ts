import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { db } from "@/db";
import { deals, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isNonUsStorefrontHost, registrableDomain } from "./geo";

const KNOWN_CHAINS = new Set([
  "amazon.com", "bestbuy.com", "target.com", "walmart.com", "bhphotovideo.com", "costco.com", "rei.com",
  "williams-sonoma.com", "nordstrom.com", "homedepot.com", "nike.com", "samsung.com", "dell.com", "lenovo.com",
  "adorama.com", "sephora.com", "crutchfield.com", "newegg.com", "onepeloton.com", "nordictrack.com",
  "acehardware.com", "bloomingdales.com", "dickssportinggoods.com", "weber.com", "ooni.com", "solostove.com",
]);
const PRIVATE_IPV4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export function normalizeDomain(input: string) {
  const url = new URL(input.startsWith("http") ? input : `https://${input}`);
  return url.hostname.toLowerCase().replace(/^www\./, "");
}

function rootDomain(host: string) {
  // Shared extractor so multi-part suffixes (amazon.co.uk) are keyed correctly.
  return registrableDomain(host);
}

async function safeUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Only HTTPS source pages may be certified");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || isIP(host) && (PRIVATE_IPV4.test(host) || host === "::1")) throw new Error("Private source address blocked");
  const addresses = await lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => PRIVATE_IPV4.test(a.address) || a.address === "::1" || a.address.startsWith("fc") || a.address.startsWith("fd") || a.address.startsWith("fe80"))) {
    throw new Error("Private source address blocked");
  }
  return url;
}

async function fetchText(url: string, timeout = 8_000) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeout), headers: { "User-Agent": "50DailyFireDeals-SourceCertification/1.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html") && !type.includes("application/json")) throw new Error("Unexpected page type");
  return (await response.text()).slice(0, 1_000_000);
}

async function aiRiskReview(input: Record<string, unknown>) {
  if (!process.env.OPENAI_API_KEY) return { provider: "not_configured", riskLevel: "unknown", concerns: [] as string[], recommendedHold: false };
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_SOURCE_RISK_MODEL || "gpt-4o-mini", temperature: 0,
        messages: [{ role: "system", content: "Review source-risk evidence for an ecommerce retailer. Do not approve it. Identify fraud, fake-store, counterfeit, policy, identity, or fulfillment concerns. Be conservative and use only supplied evidence." },
          { role: "user", content: JSON.stringify(input) }],
        response_format: { type: "json_schema", json_schema: { name: "source_risk", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["riskLevel","concerns","recommendedHold","summary"], properties: {
            riskLevel: { type: "string", enum: ["low","medium","high","unknown"] }, concerns: { type: "array", items: { type: "string" } },
            recommendedHold: { type: "boolean" }, summary: { type: "string" } } } } } }),
    });
    if (!response.ok) throw new Error(`AI HTTP ${response.status}`);
    const payload = await response.json();
    const result = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
    if (!["low","medium","high","unknown"].includes(result.riskLevel) || !Array.isArray(result.concerns)) throw new Error("Invalid AI response");
    return { provider: "openai", model: payload.model, riskLevel: result.riskLevel, concerns: result.concerns.slice(0, 20),
      recommendedHold: Boolean(result.recommendedHold), summary: String(result.summary || "").slice(0, 1000) };
  } catch (error: any) {
    return { provider: "error", riskLevel: "unknown", concerns: [`AI review unavailable: ${error.message}`], recommendedHold: true };
  }
}

async function domainAgeDays(domain: string) {
  try {
    const data = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal: AbortSignal.timeout(8_000) }).then((r) => r.json());
    const event = (data.events || []).find((e: any) => ["registration", "created"].includes(e.eventAction));
    return event?.eventDate ? Math.max(0, Math.floor((Date.now() - new Date(event.eventDate).getTime()) / 86_400_000)) : null;
  } catch { return null; }
}

export type SourceScan = Awaited<ReturnType<typeof scanSourcePage>>;

/** Automated source-risk model. It stores raw signals; it never treats polished copy or reviews alone as proof. */
export async function scanSourcePage(rawUrl: string) {
  const url = await safeUrl(rawUrl);
  const domain = normalizeDomain(url.toString());
  const root = rootDomain(domain);
  // GEO CONTRACT: non-US country storefronts can never certify. Hide them;
  // never FX-convert a foreign price into a deal.
  if (isNonUsStorefrontHost(url.hostname)) {
    return { domain: root, sourceUrl: url.toString(), knownChain: false, domainAgeDays: null,
      httpsValid: true, hasContact: false, hasPolicies: false,
      hasNormalCardCheckout: false, hasRealImprint: false, complaintSignals: ["non_us_storefront"],
      score: 0, status: "hold",
      summary: `Hold: non-US storefront (${root}). US-only catalog — amazon.com / target.com / walmart.com style domains, never .co.uk / .ca / .de.`,
      evidence: { scannedUrl: url.toString(), finalDomain: domain, fetchError: null,
        aiReview: { provider: "not_run", riskLevel: "unknown", concerns: [], recommendedHold: true },
        scannedAt: new Date().toISOString(), model: "source-risk-rules-v1", geo: "non-US storefront rejected" } };
  }
  const knownChain = KNOWN_CHAINS.has(root);
  let page = "";
  let fetchError: string | null = null;
  try { page = await fetchText(url.toString()); } catch (error: any) { fetchError = error.message; }
  const lower = page.toLowerCase();
  const age = await domainAgeDays(root);
  const hasContact = /(mailto:|tel:|contact us|customer service)/i.test(page);
  const hasPolicies = /(return policy|returns.{0,60}refund|shipping policy|privacy policy|terms of service)/i.test(page);
  const hasNormalCardCheckout = /(stripe|paypal|shop pay|visa|mastercard|american express|add to cart|checkout)/i.test(page) && !/(crypto only|wire transfer only|email us to pay)/i.test(page);
  const hasRealImprint = /(company|corporation|inc\.|llc|registered office|business address|about us)/i.test(page);
  const suspicious = [
    [/crypto only|wire transfer only|western union|gift card payment/i, "nonstandard_payment"],
    [/lorem ipsum/i, "placeholder_policy"],
    [/guaranteed authentic.{0,30}replica|mirror quality|1:1 copy/i, "counterfeit_language"],
    [/contact( us)? for (a )?quote|request a quote for shipping|does not ship to (the )?u\.?s\.?|not available for (us|u\.?s\.?) delivery|ships? worldwide except/i, "no_us_shipping"],
  ].filter(([pattern]) => (pattern as RegExp).test(lower)).map(([, code]) => code as string);
  let score = 0;
  if (knownChain) score += 40;
  if (page) score += 10;
  if (age !== null && age >= 1095) score += 15;
  else if (age !== null && age < 180) score -= 25;
  if (hasNormalCardCheckout) score += 10;
  if (hasContact) score += 5;
  if (hasPolicies) score += 10;
  if (hasRealImprint) score += 10;
  if (suspicious.includes("nonstandard_payment")) score -= 40;
  if (suspicious.includes("counterfeit_language")) score -= 30;
  if (suspicious.includes("no_us_shipping")) score -= 30;
  if (!suspicious.length && !fetchError) score += 10;
  if (fetchError) score -= 30;
  const aiReview = await aiRiskReview({ domain: root, knownChain, domainAgeDays: age, hasContact, hasPolicies,
    hasNormalCardCheckout, hasRealImprint, suspiciousSignals: suspicious, fetchError });
  // AI can only remove trust or hold. It can never add points or approve.
  if (aiReview.riskLevel === "medium") score -= 10;
  if (aiReview.riskLevel === "high") score -= 30;
  if (aiReview.recommendedHold) suspicious.push("ai_recommended_hold");
  score = Math.max(0, Math.min(100, score));
  const status = suspicious.length || fetchError ? "hold" : knownChain && score >= 70 ? "allowlisted" : "hold";
  const summary = fetchError ? `Hold: source page could not be verified (${fetchError}).` :
    `${knownChain ? "Known-chain signal; " : "Unknown domain; "}${age === null ? "domain age unavailable; " : `domain age ${age} days; `}` +
    `${hasNormalCardCheckout ? "normal checkout detected; " : "checkout not confirmed; "}${hasPolicies ? "policy text found." : "policy text not confirmed."}`;
  return { domain: root, sourceUrl: url.toString(), knownChain, domainAgeDays: age, httpsValid: true, hasContact, hasPolicies,
    hasNormalCardCheckout, hasRealImprint, complaintSignals: suspicious, score, status, summary,
    evidence: { scannedUrl: url.toString(), finalDomain: domain, fetchError, aiReview, scannedAt: new Date().toISOString(), model: "source-risk-rules-v1" } };
}

export async function upsertSourceFromScan(name: string, scan: SourceScan) {
  const existing = await db.select().from(sources).where(eq(sources.domain, scan.domain)).limit(1);
  const retainedStatus = existing[0] && scan.score >= 70 && !scan.complaintSignals.length
    ? existing[0].status === "approved" && existing[0].testBuyPassed ? "approved" : existing[0].status === "allowlisted" ? "allowlisted" : scan.status
    : scan.status;
  const values = {
    name, domain: scan.domain, lastScannedAt: new Date(), score: scan.score, status: retainedStatus,
    knownChain: scan.knownChain, domainAgeDays: scan.domainAgeDays, httpsValid: scan.httpsValid, hasContact: scan.hasContact,
    hasPolicies: scan.hasPolicies, hasNormalCardCheckout: scan.hasNormalCardCheckout, hasRealImprint: scan.hasRealImprint,
    reputationSummary: scan.summary, complaintSignals: JSON.stringify(scan.complaintSignals), evidenceJson: JSON.stringify(scan.evidence), updatedAt: new Date() };
  return existing[0]
    ? (await db.update(sources).set(values).where(eq(sources.id, existing[0].id)).returning())[0]
    : (await db.insert(sources).values(values).returning())[0];
}

export function sourceCanPublish(source: typeof sources.$inferSelect | undefined) {
  if (!source) return false;
  // GEO CONTRACT: a non-US registrable domain can never publish, no matter what
  // its status or score rows say. This is what hides already-ingested .co.uk pages.
  if (isNonUsStorefrontHost(source.domain)) return false;
  const unexpired = !source.approvalExpiresAt || source.approvalExpiresAt > new Date();
  return unexpired && (source.status === "approved" && source.testBuyPassed || source.status === "allowlisted") && source.score >= 70;
}

/**
 * Shared read/write-time source guard. Every route that can expose a SKU or
 * start a NEW charge calls this helper directly against the current source row.
 * It never trusts denormalized deal.okToSell/isActive flags and never invokes
 * applySourceGate. A DB-only source block therefore takes effect immediately.
 */
export async function sourceSellableForDeal(deal: Pick<typeof deals.$inferSelect, "sourceId">) {
  if (!deal.sourceId) return { sellable: false as const, source: undefined, reason: "SKU has no source record." };
  const [source] = await db.select().from(sources).where(eq(sources.id, deal.sourceId)).limit(1);
  if (!source) return { sellable: false as const, source: undefined, reason: "SKU source record is missing." };
  if (!sourceCanPublish(source)) {
    return { sellable: false as const, source, reason: `Source is not certified to publish (status=${source.status}, score=${source.score}).` };
  }
  return { sellable: true as const, source, reason: "Source certified." };
}

export async function applySourceGate(sourceId: number) {
  const [source] = await db.select().from(sources).where(eq(sources.id, sourceId));
  const sourceApproved = sourceCanPublish(source);
  const products = await db.select().from(deals).where(eq(deals.sourceId, sourceId));
  for (const product of products) {
    const healthAllows = ["active", "review"].includes(product.killStatus) &&
      (!product.relistBlockedUntil || product.relistBlockedUntil <= new Date());
    const canSell = sourceApproved && healthAllows;
    await db.update(deals).set(canSell
      ? { okToSell: true, isActive: true, verificationStatus: "verified_active", updatedAt: new Date() }
      : { okToSell: false, isActive: false, isTop50: false, verificationStatus: "pending_check", updatedAt: new Date() }
    ).where(eq(deals.id, product.id));
  }
  return sourceApproved;
}

/** Seed/demo bootstrap only. Unknown domains are held, never silently published. */
export async function ensureCatalogSource(name: string, url: string) {
  let domain: string;
  try { domain = rootDomain(normalizeDomain(url)); } catch { domain = `invalid-${Buffer.from(url).toString("hex").slice(0, 12)}.invalid`; }
  let [source] = await db.select().from(sources).where(eq(sources.domain, domain)).limit(1);
  if (source) return source;
  // GEO CONTRACT: non-US storefronts are held at bootstrap and can never be allowlisted.
  if (isNonUsStorefrontHost(domain)) {
    [source] = await db.insert(sources).values({ name, domain, score: 0,
      status: "hold", approvalMethod: null, approvedBy: null, approvedAt: null, approvalExpiresAt: null,
      knownChain: false, httpsValid: false, hasContact: false, hasPolicies: false,
      hasNormalCardCheckout: false, hasRealImprint: false,
      reputationSummary: "Non-US storefront. US-only catalog; held and never FX-converted.",
      evidenceJson: JSON.stringify({ bootstrap: true, geo: "non-US storefront rejected", sourceUrl: url, createdAt: new Date().toISOString() }) }).returning();
    return source;
  }
  const allowlisted = KNOWN_CHAINS.has(domain);
  [source] = await db.insert(sources).values({ name, domain, score: allowlisted ? 90 : 0,
    status: allowlisted ? "allowlisted" : "hold", approvalMethod: allowlisted ? "allowlist" : null,
    approvedBy: allowlisted ? "catalog-seed" : null, approvedAt: allowlisted ? new Date() : null,
    approvalExpiresAt: allowlisted ? new Date(Date.now() + 90 * 86_400_000) : null,
    knownChain: allowlisted, httpsValid: allowlisted, hasContact: allowlisted, hasPolicies: allowlisted,
    hasNormalCardCheckout: allowlisted, hasRealImprint: allowlisted,
    reputationSummary: allowlisted ? "Known-chain bootstrap certification; rescan expires in 90 days." : "Unverified domain; held until scan and test buy.",
    evidenceJson: JSON.stringify({ bootstrap: true, sourceUrl: url, createdAt: new Date().toISOString() }) }).returning();
  return source;
}
