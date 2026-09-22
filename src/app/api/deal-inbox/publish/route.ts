import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { scanSourcePage, sourceCanPublish, upsertSourceFromScan } from "@/lib/sourceCertification";

const TAG = "seenlow-20";

function firstRow(result: unknown): Record<string, unknown> | null {
  if (!result) return null;
  if (Array.isArray(result)) return (result[0] as Record<string, unknown>) || null;
  const rows = (result as { rows?: unknown[] }).rows;
  if (Array.isArray(rows)) return (rows[0] as Record<string, unknown>) || null;
  return null;
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const found = await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`);
  const row = firstRow(found);
  if (!row) return NextResponse.json({ success: false, error: "Inbox row not found" }, { status: 404 });

  const sale = Number(row.sale_price);
  const listed = Number(row.listed_price || row.sale_price);
  if (!Number.isFinite(sale) || sale <= 0) {
    return NextResponse.json({ success: false, error: "Add a sale price before publishing" }, { status: 400 });
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
  const source = await upsertSourceFromScan(String(row.domain || "amazon.com") === "amazon.com" ? "Amazon" : String(row.domain || "Retailer"), scan);
  const canSell = sourceCanPublish(source);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const amazon = /amazon\.com/i.test(url);

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
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
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
    dealExpiresAt: row.ends_at ? new Date(String(row.ends_at)) : null,
    lastScrapedAt: new Date(),
    lastVerifiedAt: new Date(),
    verificationStatus: "verified_active",
    verificationNotes: "Published from deal inbox",
    opportunityScore: Math.min(100, Math.max(70, Math.round(Number(fields.discountPercent)))),
  }).returning();

  await db.execute(sql`UPDATE deal_inbox SET deal_id = ${deal.id}, updated_at = now() WHERE id = ${id}`);
  await refreshCatalogPricing();

  return NextResponse.json({
    success: true,
    dealId: deal.id,
    canSell,
    sourceStatus: source.status,
    message: canSell
      ? "Published. Hard-refresh the homepage."
      : `Saved but hidden until source ${source.domain} is certified (${source.status}).`,
  });
}
