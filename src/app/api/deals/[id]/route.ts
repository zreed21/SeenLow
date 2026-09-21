import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { getSessionUser } from "@/lib/auth";
import { getMonetizationSettings, resolveRail, publicRailFields } from "@/lib/monetization";
import { sourceCanPublish } from "@/lib/sourceCertification";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const dealId = Number(params.id);
    if (isNaN(dealId)) {
      return NextResponse.json({ success: false, error: "Invalid deal ID" }, { status: 400 });
    }

    const result = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }

    const internal = new URL(request.url).searchParams.get("internal") === "true";
    if (internal) {
      if ((await getSessionUser())?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
      return NextResponse.json({ success: true, deal: result[0] });
    }
    const [dealSource] = result[0].sourceId ? await db.select().from(sources).where(eq(sources.id, result[0].sourceId)) : [];
    // Read-time source gate: a DB-only block must 404 immediately, without
    // waiting for applySourceGate to back-fill okToSell/isActive.
    if (!sourceCanPublish(dealSource)) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }
    const decision = resolveRail(result[0], await getMonetizationSettings(), dealSource);
    if (decision.rail === "unavailable") return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    const rail = publicRailFields(result[0], decision);
    const { retailer, retailerUrl, verificationNotes, sourceId, dealPrice, serviceFee, trackingUrl, advertiserId, ...publicDeal } = result[0];
    return NextResponse.json({ success: true, deal: { ...publicDeal, ...rail, dealPrice: rail.displayPrice, finalPrice: rail.displayPrice, serviceFee: "0.00" } });
  } catch (error) {
    console.error("Error in GET /api/deals/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deal details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  if ((await getSessionUser())?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  try {
    const params = await props.params;
    const dealId = Number(params.id);
    if (isNaN(dealId)) {
      return NextResponse.json({ success: false, error: "Invalid deal ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.retailer !== undefined) updateData.retailer = body.retailer;
    if (body.retailerUrl !== undefined) updateData.retailerUrl = body.retailerUrl;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = Number(body.stockQuantity);
    if (body.isHot !== undefined) updateData.isHot = Boolean(body.isHot);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.features !== undefined) updateData.features = typeof body.features === "string" ? body.features : JSON.stringify(body.features);
    if (body.specs !== undefined) updateData.specs = typeof body.specs === "string" ? body.specs : JSON.stringify(body.specs);
    if (body.additionalImages !== undefined) updateData.additionalImages = typeof body.additionalImages === "string" ? body.additionalImages : JSON.stringify(body.additionalImages);

    if (body.originalPrice !== undefined || body.dealPrice !== undefined) {
      const currentDeal = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (currentDeal.length > 0) {
        const orig = Number(body.originalPrice !== undefined ? body.originalPrice : currentDeal[0].originalPrice);
        const deal = Number(body.dealPrice !== undefined ? body.dealPrice : currentDeal[0].dealPrice);
        if (!Number.isFinite(orig) || orig <= 0 || !Number.isFinite(deal) || deal <= 0) {
          return NextResponse.json({ success: false, error: "Source cost and regular price must be positive amounts" }, { status: 400 });
        }
        const { serviceFee, finalPrice, discountPercent } = catalogPriceFields(deal, orig);

        updateData.originalPrice = orig.toFixed(2);
        updateData.dealPrice = deal.toFixed(2);
        updateData.serviceFee = serviceFee;
        updateData.finalPrice = finalPrice;
        updateData.discountPercent = discountPercent;
        updateData.opportunityScore = Math.min(100, Math.max(70, Math.round(Number(discountPercent))));
      }
    }

    updateData.updatedAt = new Date();

    const updated = await db
      .update(deals)
      .set(updateData)
      .where(eq(deals.id, dealId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }

    await refreshCatalogPricing();
    const [freshDeal] = await db.select().from(deals).where(eq(deals.id, dealId));
    const { retailer, retailerUrl, verificationNotes, ...publicDeal } = freshDeal;
    return NextResponse.json({ success: true, deal: publicDeal });
  } catch (error) {
    console.error("Error in PUT /api/deals/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  if ((await getSessionUser())?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  try {
    const params = await props.params;
    const dealId = Number(params.id);
    if (isNaN(dealId)) {
      return NextResponse.json({ success: false, error: "Invalid deal ID" }, { status: 400 });
    }

    await db.delete(deals).where(eq(deals.id, dealId));
    await refreshCatalogPricing();
    return NextResponse.json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/deals/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
