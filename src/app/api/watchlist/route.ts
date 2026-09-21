import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { watchlists, deals } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user-1";

    const saved = await db
      .select({
        watchlistId: watchlists.id,
        targetDiscount: watchlists.targetDiscount,
        createdAt: watchlists.createdAt,
        deal: deals,
      })
      .from(watchlists)
      .innerJoin(deals, eq(watchlists.dealId, deals.id))
      .where(eq(watchlists.userId, userId));

    const publicItems = saved.map((item) => {
      const { retailer, retailerUrl, verificationNotes, sourceId, dealPrice, serviceFee, ...publicDeal } = item.deal;
      return { ...item, deal: { ...publicDeal, dealPrice: publicDeal.finalPrice, serviceFee: "0.00" } };
    });
    return NextResponse.json({
      success: true,
      items: publicItems,
    });
  } catch (error) {
    console.error("Error in GET /api/watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, userId = "demo-user-1", targetDiscount } = body;

    if (!dealId) {
      return NextResponse.json({ success: false, error: "Deal ID required" }, { status: 400 });
    }

    // Check if already in watchlist
    const existing = await db
      .select()
      .from(watchlists)
      .where(and(eq(watchlists.userId, userId), eq(watchlists.dealId, Number(dealId))));

    if (existing.length > 0) {
      // Remove it (toggle behavior)
      await db.delete(watchlists).where(eq(watchlists.id, existing[0].id));
      return NextResponse.json({ success: true, isWatchlisted: false, message: "Removed from watchlist" });
    }

    const inserted = await db
      .insert(watchlists)
      .values({
        userId,
        dealId: Number(dealId),
        targetDiscount: targetDiscount ? String(targetDiscount) : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      isWatchlisted: true,
      item: inserted[0],
      message: "Added to watchlist",
    });
  } catch (error) {
    console.error("Error in POST /api/watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update watchlist" },
      { status: 500 }
    );
  }
}
