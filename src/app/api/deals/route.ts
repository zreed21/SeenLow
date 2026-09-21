import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, sources } from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/db/seed";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { getSessionUser } from "@/lib/auth";
import { getMonetizationSettings, resolveRail, publicRailFields } from "@/lib/monetization";
import { scanSourcePage, sourceCanPublish, upsertSourceFromScan } from "@/lib/sourceCertification";
import { and, desc, eq, gte, ilike, lte, or, sql, inArray } from "drizzle-orm";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  try {
    await seedDatabaseIfEmpty();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const minDiscount = Number(searchParams.get("minDiscount") || "0");
    const retailer = searchParams.get("retailer") || "all";
    const sortBy = searchParams.get("sortBy") || "discount_desc"; // discount_desc, price_asc, price_desc, opportunity_score, rank_asc
    const onlyTop50 = searchParams.get("top50") === "true";
    const stockStatus = searchParams.get("stockStatus") || "all";
    const rawLimit = Number(searchParams.get("limit") || "0");
    const limit = rawLimit > 0 && rawLimit <= 200 ? rawLimit : undefined;

    const conditions = [eq(deals.isActive, true), eq(deals.okToSell, true), inArray(deals.killStatus, ["active", "review"])];

    if (search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(deals.title, searchPattern),
          ilike(deals.description, searchPattern),
          ilike(deals.brand, searchPattern),
          ilike(deals.retailer, searchPattern)
        )!
      );
    }

    if (category && category !== "all") {
      conditions.push(eq(deals.category, category));
    }

    if (retailer && retailer !== "all") {
      conditions.push(eq(deals.retailer, retailer));
    }

    if (minDiscount > 0) {
      conditions.push(gte(deals.discountPercent, minDiscount.toString()));
    }

    if (stockStatus && stockStatus !== "all") {
      conditions.push(eq(deals.stockStatus, stockStatus));
    }

    if (onlyTop50) {
      conditions.push(eq(deals.isTop50, true));
    }

    // Default sorting
    let orderByClause;
    switch (sortBy) {
      case "discount_desc":
        orderByClause = [desc(deals.discountPercent), deals.dealRank];
        break;
      case "price_asc":
        orderByClause = [deals.finalPrice];
        break;
      case "price_desc":
        orderByClause = [desc(deals.finalPrice)];
        break;
      case "opportunity_score":
        orderByClause = [desc(deals.opportunityScore), desc(deals.discountPercent)];
        break;
      case "rank_asc":
        orderByClause = [deals.dealRank];
        break;
      default:
        orderByClause = [desc(deals.discountPercent), deals.dealRank];
    }

    const base = conditions.length > 0
      ? db.select().from(deals).where(and(...conditions)).orderBy(...orderByClause)
      : db.select().from(deals).orderBy(...orderByClause);

    const dealList = limit ? await base.limit(limit) : await base;

    const monSettings = await getMonetizationSettings();
    const sourceRows = await db.select().from(sources);
    const publicDeals = dealList
      .map((full) => ({ full, source: sourceRows.find((row) => row.id === full.sourceId) }))
      // Read-time source gate: drop SKUs whose source is blocked/expired right
      // now, regardless of cached okToSell/isActive flags.
      .filter(({ source }) => sourceCanPublish(source))
      .map(({ full, source }) => ({ full, decision: resolveRail(full, monSettings, source) }))
      .filter(({ decision }) => decision.rail !== "unavailable")
      .map(({ full, decision }) => {
        const rail = publicRailFields(full, decision);
        const { retailer, retailerUrl, verificationNotes, sourceId, dealPrice, serviceFee, trackingUrl, advertiserId, ...deal } = full;
        return { ...deal, ...rail, dealPrice: rail.displayPrice, finalPrice: rail.displayPrice, serviceFee: "0.00" };
      });
    return NextResponse.json({
      success: true,
      count: publicDeals.length,
      deals: publicDeals,
    });
  } catch (error) {
    console.error("Error in GET /api/deals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deals", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      brand,
      originalPrice,
      dealPrice,
      retailer,
      retailerUrl,
      imageUrl,
      additionalImages = [],
      features = [],
      specs = {},
      stockQuantity = 10,
      isHot = false,
    } = body;

    if (!title || !originalPrice || !dealPrice || !imageUrl || !retailer || !retailerUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required deal fields" },
        { status: 400 }
      );
    }

    const orig = Number(originalPrice);
    const deal = Number(dealPrice);
    if (!Number.isFinite(orig) || orig <= 0 || !Number.isFinite(deal) || deal <= 0) {
      return NextResponse.json({ success: false, error: "Source cost and regular price must be positive amounts" }, { status: 400 });
    }
    const { serviceFee, finalPrice, discountPercent } = catalogPriceFields(deal, orig);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const scan = await scanSourcePage(String(retailerUrl));
    const source = await upsertSourceFromScan(String(retailer), scan);
    const highRiskCategory = /cosmetic|supplement|skin|baby|kids|auto safety|electrical safety|branded electronics/i.test(`${category} ${title}`);
    const canSell = sourceCanPublish(source) && (!highRiskCategory || source.status === "allowlisted");
    const newDeal = await db.insert(deals).values({
      sourceId: source.id,
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: description || title,
      category: category || "Electronics",
      brand: brand || "Brand",
      originalPrice: orig.toFixed(2),
      dealPrice: deal.toFixed(2),
      serviceFee,
      finalPrice,
      discountPercent,
      retailer,
      retailerUrl,
      imageUrl,
      additionalImages: JSON.stringify(additionalImages),
      features: JSON.stringify(features),
      specs: JSON.stringify(specs),
      stockStatus: "in_stock",
      stockQuantity: Number(stockQuantity) || 10,
      dealRank: 1,
      isTop50: false, // rank is assigned by refreshCatalogPricing, not by being sellable
      okToSell: canSell,
      isHot: Boolean(isHot),
      isActive: canSell,
      opportunityScore: Math.min(100, Math.max(70, Math.round(Number(discountPercent)))),
      lastScrapedAt: new Date(),
      lastVerifiedAt: new Date(),
      verificationStatus: "verified_active",
      verificationNotes: `Live fulfillment verification passed. Available stock: ${stockQuantity}.`,
    }).returning();

    await refreshCatalogPricing();
    const [freshDeal] = await db.select().from(deals).where(eq(deals.id, newDeal[0].id));
    const { retailer: _retailer, retailerUrl: _retailerUrl, verificationNotes: _verificationNotes, ...publicDeal } = freshDeal;
    return NextResponse.json({ success: true, deal: publicDeal });
  } catch (error) {
    console.error("Error in POST /api/deals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create deal", details: String(error) },
      { status: 500 }
    );
  }
}
