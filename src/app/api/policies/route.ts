import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { policies } from "@/db/schema";
import { getPolicies } from "@/lib/policies";

export async function GET() {
  try {
    return NextResponse.json({ success: true, policies: await getPolicies() });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load policies" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getPolicies();
    const body = await request.json();
    const fields = [
      "companyName", "supportEmail", "returnShippingCost", "restockingFee",
      "refundMethod", "governingState", "titleTransfer",
    ] as const;

    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const f of fields) if (body[f] !== undefined) update[f] = String(body[f]);
    if (body.changeOfMindDays !== undefined) update.changeOfMindDays = Math.max(0, Number(body.changeOfMindDays) || 0);
    if (body.blindShippingRequired !== undefined) update.blindShippingRequired = Boolean(body.blindShippingRequired);
    if (body.partnerFulfillmentDisclosed !== undefined) update.partnerFulfillmentDisclosed = Boolean(body.partnerFulfillmentDisclosed);

    const [updated] = await db.update(policies).set(update).returning();
    return NextResponse.json({ success: true, policies: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save policies" }, { status: 500 });
  }
}
