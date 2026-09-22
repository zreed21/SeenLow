import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { catalogPriceFields } from "@/lib/pricing";
import { isNonUsStorefrontHost } from "@/lib/geo";

export type AvailabilityConfidence = "high" | "low" | "unknown";

export type ScrapedPrice = {
  ok: boolean;
  url: string;
  finalUrl: string;
  title: string | null;
  salePrice: number | null;
  listedPrice: number | null;
  /** true/false only when confidence warrants; null = stock uncertain */
  available: boolean | null;
  availabilityConfidence: AvailabilityConfidence;
  endsAt: Date | null;
  currency: string | null;
  notes: string;
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function money(raw: unknown): number | null {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
  return Math.round(n * 100) / 100;
}

function firstMoney(values: unknown[]): number | null {
  for (const v of values) {
    const n = money(v);
    if (n) return n;
  }
  return null;
}

function extractAsin(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
    return m ? m[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

function parseJsonLd(html: string) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const products: any[] = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].replace(/[\u0000-\u001f]/g, " "));
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (!item) continue;
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) products.push(item);
        if (Array.isArray(item["@graph"])) {
          for (const g of item["@graph"]) {
            if (g?.["@type"] === "Product" || String(g?.["@type"] || "").includes("Product")) products.push(g);
          }
        }
      }
    } catch {
      /* ignore broken retailer JSON-LD */
    }
  }
  return products;
}

function offerPrices(product: any): { sale: number | null; listed: number | null; available: boolean | null } {
  const offers = product?.offers;
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  let sale: number | null = null;
  let listed: number | null = money(product?.offers?.highPrice) || money(product?.offers?.price);
  let available: boolean | null = null;
  for (const offer of list) {
    sale = sale || money(offer?.lowPrice) || money(offer?.price);
    listed = listed || money(offer?.highPrice) || money(offer?.priceSpecification?.price);
    const avail = String(offer?.availability || "");
    if (/InStock|LimitedAvailability|PreOrder/i.test(avail)) available = true;
    if (/OutOfStock|Discontinued|SoldOut/i.test(avail)) available = false;
  }
  return { sale, listed, available };
}

function htmlMeta(html: string, key: string) {
  const prop = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"));
  const rev = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, "i"));
  return prop?.[1] || rev?.[1] || null;
}

function parseCountdown(html: string): Date | null {
  const ms = html.match(/"msToEnd"\s*:\s*(\d+)/i) || html.match(/"remainingDealTime"\s*:\s*(\d+)/i);
  if (ms) {
    const n = Number(ms[1]);
    if (n > 1000 && n < 14 * 86400000) return new Date(Date.now() + n);
  }
  const hours = html.match(/Ends in\s+(\d+)\s+hour/i);
  const mins = html.match(/Ends in(?:\s+\d+\s+hours?)?\s+(\d+)\s+min/i);
  if (hours || mins) {
    return new Date(Date.now() + (Number(hours?.[1] || 0) * 3600 + Number(mins?.[1] || 0) * 60) * 1000);
  }
  return null;
}

function looksLikeBotBlock(html: string): boolean {
  return /robot check|automated access|enter the characters you see|api-services-support@amazon\.com|sorry,? we just need to make sure you.?re not a robot|validateCaptcha|opfcaptcha/i.test(html);
}

/** Soft 404 / dead product shells — ambiguous; never force sold_out from these alone. */
function looksLikeSoft404(html: string): boolean {
  return /page not found|dogs of amazon|looking for something\?|we couldn.?t find that page|sorry! we couldn.?t find/i.test(html);
}

function hasAddToCart(html: string): boolean {
  return /id=["']add-to-cart-button["']|name=["']submit\.add-to-cart["']|add.to.cart|data-action=["']add-to-cart["']/i.test(html);
}

function hasPriceToPay(html: string): boolean {
  return /priceToPay|data-asin-price=|"priceAmount"\s*:\s*[0-9]|a-price-whole/i.test(html);
}

function scrapeFail(
  start: string,
  notes: string,
  extra?: Partial<ScrapedPrice>,
): ScrapedPrice {
  return {
    ok: false,
    url: start,
    finalUrl: start,
    title: null,
    salePrice: null,
    listedPrice: null,
    available: null,
    availabilityConfidence: "unknown",
    endsAt: null,
    currency: null,
    notes,
    ...extra,
  };
}

type HtmlPriceParse = {
  sale: number | null;
  listed: number | null;
  title: string | null;
  strongBuyboxOos: boolean;
  weakOosMention: boolean;
  genericUnavailable: boolean;
  addToCart: boolean;
  priceToPaySignal: boolean;
  soft404: boolean;
};

function parseHtmlPrices(html: string): HtmlPriceParse {
  const sale = firstMoney([
    html.match(/"priceAmount"\s*:\s*([0-9.]+)/)?.[1],
    html.match(/"dealPrice"\s*:\s*"?\$?([0-9.]+)/)?.[1],
    html.match(/a-price-whole[^>]*>([0-9,]+)/)?.[1],
    html.match(/class="[^"]*priceToPay[^"]*"[^>]*>[\s\S]{0,120}?\$([0-9.]+)/)?.[1],
    html.match(/data-asin-price="([0-9.]+)"/)?.[1],
    html.match(/itemprop="price"\s+content="([0-9.]+)"/)?.[1],
    htmlMeta(html, "product:price:amount"),
  ]);
  const listed = firstMoney([
    html.match(/"listPrice"\s*:\s*"?\$?([0-9.]+)/)?.[1],
    html.match(/basisPrice[^>]*>[\s\S]{0,80}?\$([0-9.]+)/)?.[1],
    html.match(/a-text-price[\s\S]{0,80}?\$([0-9.]+)/)?.[1],
    html.match(/wasPrice[^>]*>[\s\S]{0,80}?\$([0-9.]+)/)?.[1],
  ]);
  const title =
    htmlMeta(html, "og:title") ||
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ||
    null;

  const availabilityBlock =
    html.match(/id=["']availability["'][\s\S]{0,500}/i)?.[0] ||
    html.match(/id=["']outOfStock["'][\s\S]{0,400}/i)?.[0] ||
    "";

  const strongInBuybox =
    /currently unavailable|we don.?t know when or if this item will be back|this item is currently unavailable|temporarily out of stock/i.test(
      availabilityBlock,
    ) ||
    /currently unavailable\.?\s*(?:<\/|$)|we don.?t know when or if this item will be back in stock/i.test(html);

  // Generic "unavailable" anywhere (recommendations, nav) is weak without buybox context.
  const genericUnavailable = /\bunavailable\b/i.test(html) && !strongInBuybox;
  const weakOosMention = /out of stock/i.test(html) && !strongInBuybox;

  return {
    sale,
    listed,
    title,
    strongBuyboxOos: strongInBuybox,
    weakOosMention,
    genericUnavailable,
    addToCart: hasAddToCart(html),
    priceToPaySignal: hasPriceToPay(html) || !!sale,
    soft404: looksLikeSoft404(html),
  };
}

/**
 * Only return available=false with high confidence when buybox OOS is explicit
 * AND there is no add-to-cart / priceToPay. Ambiguous → available=null.
 */
function resolveAvailability(opts: {
  jsonLdAvailable: boolean | null;
  html: HtmlPriceParse;
  sale: number | null;
}): { available: boolean | null; confidence: AvailabilityConfidence; note: string } {
  const { jsonLdAvailable, html, sale } = opts;
  const hasBuySignal = html.addToCart || html.priceToPaySignal || !!sale;

  if (html.soft404) {
    return {
      available: null,
      confidence: "unknown",
      note: "Soft 404 / page-not-found shell — stock uncertain (not marking unavailable)",
    };
  }

  // High-confidence OOS: explicit buybox copy AND no purchase/price signals.
  if (html.strongBuyboxOos && !hasBuySignal) {
    return {
      available: false,
      confidence: "high",
      note: "High-confidence OOS: buybox unavailable and no add-to-cart / priceToPay",
    };
  }

  // Buybox OOS text but ATC or price still present → ambiguous (false OOS risk).
  if (html.strongBuyboxOos && hasBuySignal) {
    return {
      available: null,
      confidence: "low",
      note: "Buybox OOS text with add-to-cart/price present — stock uncertain",
    };
  }

  // JSON-LD OutOfStock without ATC/price → high confidence OOS.
  if (jsonLdAvailable === false && !hasBuySignal) {
    return {
      available: false,
      confidence: "high",
      note: "High-confidence OOS: JSON-LD OutOfStock and no add-to-cart / priceToPay",
    };
  }

  if (jsonLdAvailable === false && hasBuySignal) {
    return {
      available: null,
      confidence: "low",
      note: "JSON-LD OutOfStock conflicts with price/ATC — stock uncertain",
    };
  }

  // Weak / generic mentions alone must never force unavailable.
  if (html.weakOosMention || html.genericUnavailable) {
    if (hasBuySignal || jsonLdAvailable === true) {
      return {
        available: jsonLdAvailable === true || hasBuySignal ? true : null,
        confidence: hasBuySignal || jsonLdAvailable === true ? "low" : "unknown",
        note: "Weak/generic unavailable text ignored; treating stock from buy signals",
      };
    }
    return {
      available: null,
      confidence: "unknown",
      note: "Generic/weak unavailable text without buybox OOS — stock uncertain",
    };
  }

  if (jsonLdAvailable === true || (hasBuySignal && sale)) {
    return {
      available: true,
      confidence: html.addToCart || jsonLdAvailable === true ? "high" : "low",
      note: "In-stock signals (price and/or ATC / JSON-LD InStock)",
    };
  }

  if (sale) {
    return {
      available: true,
      confidence: "low",
      note: "Price found; stock assumed available at low confidence",
    };
  }

  return {
    available: null,
    confidence: "unknown",
    note: "No clear stock signal — stock uncertain",
  };
}

async function fetchHtml(url: string, timeout = 9_000): Promise<{ url: string; html: string; status: number }> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeout),
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });
  const html = await response.text();
  return { url: response.url || url, html: html.slice(0, 1_500_000), status: response.status };
}

export async function scrapeProductPrice(rawUrl: string): Promise<ScrapedPrice> {
  const start = rawUrl.trim();
  if (!/^https:\/\//i.test(start)) {
    return scrapeFail(start, "Only HTTPS URLs can be scraped.");
  }
  try {
    const host = new URL(start).hostname;
    if (isNonUsStorefrontHost(host)) {
      // Non-US is a geo skip, not a sold-out signal for US catalog.
      return scrapeFail(start, `Non-US storefront (${host}) skipped.`, {
        available: null,
        availabilityConfidence: "unknown",
      });
    }
  } catch {
    return scrapeFail(start, "Invalid URL.");
  }

  const asin = extractAsin(start);
  const attempts = [start];
  if (asin && /amazon\.com/i.test(start)) {
    attempts.push(`https://www.amazon.com/dp/${asin}`);
    attempts.push(`https://www.amazon.com/gp/aw/d/${asin}`);
  }

  let lastError = "No HTML returned";
  let ambiguousOk: ScrapedPrice | null = null;

  for (const attempt of attempts) {
    try {
      const page = await fetchHtml(attempt);
      if (page.status >= 400) {
        lastError = `HTTP ${page.status}`;
        continue;
      }
      if (looksLikeBotBlock(page.html)) {
        lastError = "Bot-block / captcha page (low confidence — not marking sold out)";
        // Never mark unavailable on captcha shells.
        continue;
      }

      const products = parseJsonLd(page.html);
      let sale: number | null = null;
      let listed: number | null = null;
      let jsonLdAvailable: boolean | null = null;
      let title: string | null = null;
      for (const product of products) {
        const prices = offerPrices(product);
        sale = sale || prices.sale;
        listed = listed || prices.listed;
        if (prices.available != null) jsonLdAvailable = prices.available;
        title = title || product.name || null;
      }

      const htmlPrices = parseHtmlPrices(page.html);
      sale = sale || htmlPrices.sale;
      listed = listed || htmlPrices.listed;
      title = title || htmlPrices.title;

      const resolved = resolveAvailability({
        jsonLdAvailable,
        html: htmlPrices,
        sale,
      });
      const endsAt = parseCountdown(page.html);

      if (sale) {
        if (listed && listed < sale) listed = sale;
        const stockNote =
          resolved.available === null
            ? `; ${resolved.note}`
            : resolved.available === false
              ? `; ${resolved.note}`
              : "";
        return {
          ok: true,
          url: start,
          finalUrl: page.url,
          title: title ? String(title).slice(0, 200) : null,
          salePrice: sale,
          listedPrice: listed,
          available: resolved.available,
          availabilityConfidence: resolved.confidence,
          endsAt,
          currency: "USD",
          notes: `Live scrape ${page.status}${endsAt ? "; countdown found" : ""}${stockNote}`,
        };
      }

      // High-confidence OOS with no price: report ok so approve can 409 (unless force).
      if (resolved.available === false && resolved.confidence === "high") {
        return {
          ok: true,
          url: start,
          finalUrl: page.url,
          title: title ? String(title).slice(0, 200) : null,
          salePrice: null,
          listedPrice: listed,
          available: false,
          availabilityConfidence: "high",
          endsAt,
          currency: null,
          notes: resolved.note,
        };
      }

      // Ambiguous page with title but no price — keep as candidate ok=true stock-uncertain.
      if (title && resolved.available === null) {
        ambiguousOk = {
          ok: true,
          url: start,
          finalUrl: page.url,
          title: String(title).slice(0, 200),
          salePrice: null,
          listedPrice: listed,
          available: null,
          availabilityConfidence: resolved.confidence,
          endsAt,
          currency: null,
          notes: `${resolved.note}. Price not found in HTML.`,
        };
      }

      lastError = `HTTP ${page.status}; price not found in HTML (${resolved.note})`;
    } catch (error: any) {
      lastError = error?.message || String(error);
    }
  }

  if (ambiguousOk) return ambiguousOk;

  return scrapeFail(start, `Scrape failed: ${lastError}. Keep the last typed price or retry.`);
}

/** True only when scrape asserts OOS at high confidence (safe for sold_out / approve block). */
export function isHighConfidenceUnavailable(scrape: ScrapedPrice): boolean {
  return scrape.available === false && scrape.availabilityConfidence === "high";
}

export async function applyScrapedPriceToDeal(dealId: number, scrape: ScrapedPrice) {
  if (!scrape.ok || !scrape.salePrice) return { updated: false as const, reason: scrape.notes };
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  if (!deal) return { updated: false as const, reason: "Deal not found" };
  const listed = scrape.listedPrice && scrape.listedPrice >= scrape.salePrice
    ? scrape.listedPrice
    : Number(deal.originalPrice);
  const fields = catalogPriceFields(scrape.salePrice, listed > 0 ? listed : scrape.salePrice);
  const now = new Date();
  // Ambiguous / bot-block / low-confidence scrapes must not flip a live card to sold_out.
  const confidentOos = isHighConfidenceUnavailable(scrape);
  const nextStock = confidentOos
    ? "sold_out"
    : scrape.available === true
      ? (deal.stockStatus === "sold_out" ? "in_stock" : deal.stockStatus)
      : deal.stockStatus;
  await db.update(deals).set({
    ...fields,
    originalPrice: (listed > 0 ? listed : Number(deal.originalPrice)).toFixed(2),
    lastScrapedAt: now,
    lastVerifiedAt: now,
    verificationStatus: confidentOos ? "out_of_stock" : "verified_active",
    verificationNotes: scrape.notes,
    stockStatus: nextStock,
    dealExpiresAt: scrape.endsAt || deal.dealExpiresAt,
    updatedAt: now,
  }).where(eq(deals.id, dealId));
  return { updated: true as const, reason: scrape.notes, salePrice: scrape.salePrice };
}

export async function scrapeDealInbox(_limit = 15, onlyId?: number) {
  const rows = onlyId
    ? await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${onlyId} LIMIT 1`)
    : await db.execute(sql`SELECT * FROM deal_inbox ORDER BY id DESC LIMIT 15`);
  const links = ((rows as { rows?: any[] }).rows || rows) as any[];
  const results = [];
  for (const row of links) {
    const scrape = await scrapeProductPrice(String(row.url));
    await db.execute(sql`
      UPDATE deal_inbox SET
        title = COALESCE(${scrape.title}, title),
        sale_price = COALESCE(${scrape.salePrice}, sale_price),
        listed_price = COALESCE(${scrape.listedPrice}, listed_price),
        ends_at = COALESCE(${scrape.endsAt}, ends_at),
        last_checked_at = now(),
        check_status = ${scrape.ok ? (isHighConfidenceUnavailable(scrape) ? "unavailable" : "priced") : "failed"},
        check_notes = ${scrape.notes},
        updated_at = now()
      WHERE id = ${Number(row.id)}
    `);
    if (row.deal_id && scrape.ok) await applyScrapedPriceToDeal(Number(row.deal_id), scrape);
    results.push({
      id: row.id,
      url: row.url,
      ok: scrape.ok,
      salePrice: scrape.salePrice,
      available: scrape.available,
      availabilityConfidence: scrape.availabilityConfidence,
      notes: scrape.notes,
    });
  }
  return results;
}
