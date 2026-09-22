import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { scanSourcePage, sourceCanPublish, upsertSourceFromScan } from "@/lib/sourceCertification";
import { ensureDealInboxTable, firstInboxRow } from "@/lib/dealInboxSchema";

const TAG = "seenlow-20";

export type PublishResult =
  | {
      ok: true;
      dealId: number;
      canSell: boolean;
      sourceStatus: string;
      message: string;
    }
  | { ok: false; error: string; status: number };

/**
 * Publish (or republish) an inbox row to the deals catalog and start monitoring.
 */
export async function publishDealFromInbox(id: number): Promise<PublishResult> {
  await ensureDealInboxTable();
  const row = firstInboxRow(await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`));
  if (!row) return { ok: false, error: "Inbox row not found", status: 404 };

  const sale = Number(row.sale_price);
  const listed = Number(row.listed_price || row.sale_price);
  if (!Number.isFinite(sale) || sale <= 0) {
    return { ok: false, error: "Add a sale price before publishing", status: 400 };
  }
  const orig = Number.isFinite(listed) && listed >= sale ? listed : sale;
  const title = String(row.title || row.asin || "Amazon deal");
  let url = String(row.url);
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, "") === "amazon.com" || u.hostname.endsWith(".amazon.com")) {
      u.searchParams.set("tag", TAG);
      url = u.toString();
    }
  } catch {
    /* keep url */
  }

  const fields = catalogPriceFields(sale, orig);
  const scan = await scanSourcePage(url);
  const source = await upsertSourceFromScan(
    String(row.domain || "amazon.com") === "amazon.com" ? "Amazon" : String(row.domain || "Retailer"),
    scan,
  );
  const canSell = sourceCanPublish(source);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const amazon = /amazon\.com/i.test(url);
  const imageUrl = String(
    row.image_url || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
  );
  const dealExpiresAt = row.ends_at ? new Date(String(row.ends_at)) : null;
  const now = new Date();

  let dealId = row.deal_id ? Number(row.deal_id) : 0;

  if (dealId) {
    const [existing] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (existing) {
      await db.update(deals).set({
        sourceId: source.id,
        title,
        description: title,
        originalPrice: orig.toFixed(2),
        dealPrice: sale.toFixed(2),
        serviceFee: fields.serviceFee,
        finalPrice: fields.finalPrice,
        discountPercent: fields.discountPercent,
        retailer: amazon ? "Amazon" : String(row.domain || "Retailer"),
        retailerUrl: url,
        imageUrl,
        stockStatus: "in_stock",
        isActive: canSell,
        okToSell: canSell,
        isTop50: canSell,
        isHot: true,
        ctaType: amazon ? "affiliate" : "reseller",
        affiliateNetwork: amazon ? "amazon" : null,
        trackingUrl: amazon ? url : null,
        affiliateStatus: amazon ? "approved" : "none",
        resellerAllowed: amazon ? false : true,
        dealExpiresAt,
        lastScrapedAt: now,
        lastVerifiedAt: now,
        verificationStatus: "verified_active",
        verificationNotes: "Approved & republished from deal review — monitoring started",
        opportunityScore: Math.min(100, Math.max(70, Math.round(Number(fields.discountPercent)))),
        updatedAt: now,
      }).where(eq(deals.id, dealId));
    } else {
      dealId = 0;
    }
  }

  if (!dealId) {
    const [deal] = await db.insert(deals).values({
      sourceId: source.id,
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: title,
      category: "General",
      brand: String(row.asin || "Amazon"),
      originalPrice: orig.toFixed(2),
      dealPrice: sale.toFixed(2),
      serviceFee: fields.serviceFee,
      finalPrice: fields.finalPrice,
      discountPercent: fields.discountPercent,
      retailer: amazon ? "Amazon" : String(row.domain || "Retailer"),
      retailerUrl: url,
      imageUrl,
      stockStatus: "in_stock",
      stockQuantity: 10,
      dealRank: 1,
      isTop50: true,
      isHot: true,
      isActive: canSell,
      okToSell: canSell,
      ctaType: amazon ? "affiliate" : "reseller",
      affiliateNetwork: amazon ? "amazon" : null,
      trackingUrl: amazon ? url : null,
      affiliateStatus: amazon ? "approved" : "none",
      resellerAllowed: amazon ? false : true,
      dealExpiresAt,
      lastScrapedAt: now,
      lastVerifiedAt: now,
      verificationStatus: "verified_active",
      verificationNotes: "Published from deal inbox — monitoring started",
      opportunityScore: Math.min(100, Math.max(70, Math.round(Number(fields.discountPercent)))),
    }).returning();
    dealId = deal.id;
  }

  await db.execute(sql`
    UPDATE deal_inbox SET
      deal_id = ${dealId},
      review_status = 'monitoring',
      monitor_started_at = now(),
      last_monitored_at = now(),
      check_status = 'priced',
      check_notes = 'Approved & published — price/stock monitoring started (every 30 min via /api/deal-monitor/run).',
      updated_at = now()
    WHERE id = ${id}
  `);
  await refreshCatalogPricing();

  return {
    ok: true,
    dealId,
    canSell,
    sourceStatus: source.status,
    message: canSell
      ? "Published. Hard-refresh the homepage. Monitoring every 30 min via /api/deal-monitor/run."
      : `Saved but hidden until source ${source.domain} is certified (${source.status}).`,
  };
}
