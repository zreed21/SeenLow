import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildQuote, publicQuote } from "@/lib/quote";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { recordPriceObservation } from "@/lib/priceObservations";

/** Uses the current stored source snapshot; live partner connectors are a separate integration. */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const dealId = Number(id);
    if (!Number.isSafeInteger(dealId) || dealId <= 0) {
      return NextResponse.json({ success: false, error: "Invalid product id" }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const context = body.context === "catalog" ? "catalog" : "checkout";
    const checkpoint = body.checkpoint === "viewed" ? "viewed" : body.checkpoint === "before_sale" ? "before_sale" : null;
    const quote = await buildQuote(dealId, String(body.state || "CA"), Number(body.displayedPrice ?? 0), context);
    if (!quote.ok) {
      if (quote.code === "not_found") return NextResponse.json({ success: false, error: quote.error }, { status: 404 });
      await db.update(deals).set({ isTop50: false, verificationStatus: "out_of_stock", lastVerifiedAt: new Date() }).where(eq(deals.id, dealId));
      await refreshCatalogPricing();
      return NextResponse.json({ success: true, available: false, stockQuantity: 0, message: quote.error });
    }
    const verifiedAt = new Date();
    await db.update(deals).set({
      ...catalogPriceFields(quote.deal.dealPrice, quote.deal.originalPrice),
      lastVerifiedAt: verifiedAt,
      verificationStatus: "verified_active",
      verificationNotes: "Price calculated from the latest stored source snapshot.",
      updatedAt: verifiedAt,
    }).where(eq(deals.id, dealId));
    if (checkpoint) await recordPriceObservation(checkpoint, quote, { evidence: { trigger: "explicit_product_check" } });
    return NextResponse.json({
      success: true,
      available: true,
      stockQuantity: quote.deal.stockQuantity,
      priceStatus: quote.priceStatus,
      displayedPrice: quote.displayedPrice,
      livePrice: quote.livePrice,
      checkoutItemPrice: quote.itemPrice,
      ...publicQuote(quote),
      verifiedAt: verifiedAt.toISOString(),
      message: quote.priceIncreased ? "The quote changed. Review and approve the new price before paying." : "Current quote ready.",
    });
  } catch (error) {
    console.error("Product verification failed", error);
    return NextResponse.json({ success: false, error: "Unable to calculate a valid product quote" }, { status: error instanceof RangeError ? 400 : 500 });
  }
}
