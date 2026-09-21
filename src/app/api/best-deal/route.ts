import { NextRequest } from "next/server";
import { db } from "@/db";
import { sponsoredSlots } from "@/db/schema";
import { and, eq, lte, gte } from "drizzle-orm";
import { computeBestDeal } from "@/lib/monetization";
import { withCors, preflight } from "@/lib/apiAccess";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * The home-screen module: one organic BEST DEAL plus, separately, at most one
 * labeled Sponsored neighbor. Sponsored can sit NEXT to the winner, never AS it.
 */
export async function GET(request: NextRequest) {
  try {
    const best = await computeBestDeal();
    const now = new Date();
    const slots = await db.select().from(sponsoredSlots).where(eq(sponsoredSlots.active, true));
    const sponsored = slots.find((slot) =>
      (!slot.startsAt || slot.startsAt <= now) && (!slot.endsAt || slot.endsAt >= now)) || null;
    return withCors(request, {
      success: true,
      bestDeal: best,
      sponsored: sponsored ? {
        id: sponsored.id, brandName: sponsored.brandName, headline: sponsored.headline,
        imageUrl: sponsored.imageUrl, destinationUrl: sponsored.destinationUrl, label: "Sponsored",
      } : null,
    });
  } catch (error) {
    console.error("best-deal failed", error);
    return withCors(request, { success: false, error: "Unable to compute the best deal" }, { status: 500 });
  }
}
