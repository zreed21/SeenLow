import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { catalogPriceFields } from "@/lib/pricing";
import { isNonUsStorefrontHost } from "@/lib/geo";

export type ScrapedPrice = {
  ok: boolean;
  url: string;
  finalUrl: string;
  title: string | null;
  salePrice: number | null;
  listedPrice: number | null;
  available: boolean | null;
  endsAt: Date | null;
  currency: string | null;
  imageUrl: string | null;
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

function extractProductImage(html: string, products: any[]): string | null {
  const fromMeta =
    htmlMeta(html, "og:image") ||
    htmlMeta(html, "og:image:secure_url") ||
    htmlMeta(html, "twitter:image");
  if (fromMeta && /^https?:\/\//i.test(fromMeta)) return fromMeta;
  for (const product of products) {
    const img = product?.image;
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    if (Array.isArray(img)) {
      for (const item of img) {
        if (typeof item === "string" && /^https?:\/\//i.test(item)) return item;
        if (item?.url && /^https?:\/\//i.test(item.url)) return item.url;
      }
    }
    if (img?.url && /^https?:\/\//i.test(img.url)) return img.url;
  }
  return null;
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

function parseHtmlPrices(html: string) {
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
  const unavailable = /currently unavailable|out of stock|this item cannot be shipped|we don't know when or if this item will be back/i.test(html);
  return { sale, listed, title, available: unavailable ? false : sale ? true : null };
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
    return { ok: false, url: start, finalUrl: start, title: null, salePrice: null, listedPrice: null, available: null, endsAt: null, currency: null, imageUrl: null, notes: "Only HTTPS URLs can be scraped." };
  }
  try {
    const host = new URL(start).hostname;
    if (isNonUsStorefrontHost(host)) {
      return { ok: false, url: start, finalUrl: start, title: null, salePrice: null, listedPrice: null, available: false, endsAt: null, currency: null, imageUrl: null, notes: `Non-US storefront (${host}) skipped.` };
    }
  } catch {
    return { ok: false, url: start, finalUrl: start, title: null, salePrice: null, listedPrice: null, available: null, endsAt: null, currency: null, imageUrl: null, notes: "Invalid URL." };
  }

  const asin = extractAsin(start);
  const attempts = [start];
  if (asin && /amazon\.com/i.test(start)) {
    attempts.push(`https://www.amazon.com/dp/${asin}`);
    attempts.push(`https://www.amazon.com/gp/aw/d/${asin}`);
  }

  let lastError = "No HTML returned";
  for (const attempt of attempts) {
    try {
      const page = await fetchHtml(attempt);
      if (page.status >= 400) {
        lastError = `HTTP ${page.status}`;
        continue;
      }
      const products = parseJsonLd(page.html);
      let sale: number | null = null;
      let listed: number | null = null;
      let available: boolean | null = null;
      let title: string | null = null;
      for (const product of products) {
        const prices = offerPrices(product);
        sale = sale || prices.sale;
        listed = listed || prices.listed;
        if (prices.available != null) available = prices.available;
        title = title || product.name || null;
      }
      const htmlPrices = parseHtmlPrices(page.html);
      sale = sale || htmlPrices.sale;
      listed = listed || htmlPrices.listed;
      title = title || htmlPrices.title;
      if (htmlPrices.available === false) available = false;
      if (available == null) available = htmlPrices.available;
      const endsAt = parseCountdown(page.html);
      if (sale) {
        if (listed && listed < sale) listed = sale;
        const imageUrl = extractProductImage(page.html, products);
        return {
          ok: true,
          url: start,
          finalUrl: page.url,
          title: title ? String(title).slice(0, 200) : null,
          salePrice: sale,
          listedPrice: listed,
          available,
          endsAt,
          currency: "USD",
          imageUrl,
          notes: `Live scrape ${page.status}${endsAt ? "; countdown found" : ""}${imageUrl ? "; image found" : ""}`,
        };
      }
      lastError = `HTTP ${page.status}; price not found in HTML`;
    } catch (error: any) {
      lastError = error?.message || String(error);
    }
  }

  return {
    ok: false,
    url: start,
    finalUrl: start,
    title: null,
    salePrice: null,
    listedPrice: null,
    available: null,
    endsAt: null,
    currency: null,
    imageUrl: null,
    notes: `Scrape failed: ${lastError}. Keep the last typed price or retry.`,
  };
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
  await db.update(deals).set({
    ...fields,
    originalPrice: (listed > 0 ? listed : Number(deal.originalPrice)).toFixed(2),
    lastScrapedAt: now,
    lastVerifiedAt: now,
    verificationStatus: scrape.available === false ? "out_of_stock" : "verified_active",
    verificationNotes: scrape.notes,
    stockStatus: scrape.available === false ? "sold_out" : deal.stockStatus,
    dealExpiresAt: scrape.endsAt || deal.dealExpiresAt,
    updatedAt: now,
  }).where(eq(deals.id, dealId));
  return { updated: true as const, reason: scrape.notes, salePrice: scrape.salePrice };
}

export async function scrapeDealInbox(_limit = 15, onlyId?: number) {
  // Best-effort column for scraped / Open Graph product images (idempotent).
  await db.execute(sql`ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS image_url text`);
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
        image_url = COALESCE(${scrape.imageUrl}, image_url),
        last_checked_at = now(),
        check_status = ${scrape.ok ? (scrape.available === false ? "unavailable" : "priced") : "failed"},
        check_notes = ${scrape.notes},
        updated_at = now()
      WHERE id = ${Number(row.id)}
    `);
    if (row.deal_id && scrape.ok) await applyScrapedPriceToDeal(Number(row.deal_id), scrape);
    results.push({ id: row.id, url: row.url, ok: scrape.ok, salePrice: scrape.salePrice, imageUrl: scrape.imageUrl, notes: scrape.notes });
  }
  return results;
}
