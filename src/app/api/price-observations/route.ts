import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { priceObservations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if ((await getSessionUser())?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const dealId = Number(params.get("dealId") || 0);
  const limit = Math.min(500, Math.max(1, Number(params.get("limit") || 200)));
  const rows = dealId
    ? await db.select().from(priceObservations).where(eq(priceObservations.dealId, dealId)).orderBy(desc(priceObservations.observedAt)).limit(limit)
    : await db.select().from(priceObservations).orderBy(desc(priceObservations.observedAt)).limit(limit);
  return NextResponse.json({ success: true, observations: rows });
}
