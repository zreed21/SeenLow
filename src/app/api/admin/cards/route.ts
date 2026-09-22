import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { parseEndsAt } from "@/lib/dealInboxTime";

async function requireAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return null;
  return user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  const rows = await db.select().from(deals).where(
    or(
      ilike(deals.retailer, "%amazon%"),
      ilike(deals.retailerUrl, "%amazon%"),
      ilike(deals.trackingUrl, "%amazon%"),
      eq(deals.affiliateNetwork, "amazon"),
    ),
  ).orderBy(desc(deals.updatedAt));
  return NextResponse.json({
    success: true,
    cards: rows.map((d) => ({
      id: d.id,
      title: d.title,
      retailer: d.retailer,
      retailerUrl: d.retailerUrl,
      trackingUrl: d.trackingUrl,
      originalPrice: d.originalPrice,
      dealPrice: d.dealPrice,
      finalPrice: d.finalPrice,
      isActive: d.isActive,
      okToSell: d.okToSell,
      affiliateStatus: d.affiliateStatus,
      ctaType: d.ctaType,
      dealExpiresAt: d.dealExpiresAt,
      imageUrl: d.imageUrl,
    })),
  });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  const [current] = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  if (!current) return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) update.title = String(body.title);
  if (body.retailerUrl !== undefined) {
    let url = String(body.retailerUrl);
    try {
      const u = new URL(url);
      if (/amazon\.com$/i.test(u.hostname.replace(/^www\./, ""))) {
        u.searchParams.set("tag", "seenlow-20");
        url = u.toString();
      }
    } catch { /* keep */ }
    update.retailerUrl = url;
    update.trackingUrl = url;
  }
  if (body.imageUrl !== undefined) update.imageUrl = String(body.imageUrl);
  if (body.dealExpiresAt !== undefined) update.dealExpiresAt = parseEndsAt(body.dealExpiresAt);
  if (body.originalPrice !== undefined || body.dealPrice !== undefined) {
    const orig = Number(body.originalPrice ?? current.originalPrice);
    const sale = Number(body.dealPrice ?? current.dealPrice);
    if (!Number.isFinite(orig) || orig <= 0 || !Number.isFinite(sale) || sale <= 0) {
      return NextResponse.json({ success: false, error: "Prices must be positive" }, { status: 400 });
    }
    const fields = catalogPriceFields(sale, orig);
    update.originalPrice = orig.toFixed(2);
    update.dealPrice = sale.toFixed(2);
    update.serviceFee = fields.serviceFee;
    update.finalPrice = fields.finalPrice;
    update.discountPercent = fields.discountPercent;
  }
  if (body.isActive !== undefined) {
    const on = Boolean(body.isActive);
    update.isActive = on;
    update.okToSell = on;
    if (on) {
      // Republish must clear sold_out / stale verification so refreshCatalogPricing
      // can put the card back into Top-50 (homepage top50=true).
      update.stockStatus = "in_stock";
      if (!current.stockQuantity || current.stockQuantity <= 0) update.stockQuantity = 10;
      update.verificationStatus = "verified_active";
      update.verificationNotes = "Republished by admin";
      update.ctaType = "affiliate";
      update.affiliateStatus = "approved";
      update.affiliateNetwork = "amazon";
      update.resellerAllowed = false;
      update.trackingUrl = current.trackingUrl || current.retailerUrl;
    }
  }
  const [saved] = await db.update(deals).set(update).where(eq(deals.id, id)).returning();
  await refreshCatalogPricing();
  return NextResponse.json({ success: true, card: saved });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  await db.update(deals).set({
    isActive: false,
    okToSell: false,
    isTop50: false,
    updatedAt: new Date(),
  }).where(and(eq(deals.id, id)));
  await refreshCatalogPricing();
  return NextResponse.json({ success: true });
}
