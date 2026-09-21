import { NextRequest } from "next/server";
import { db } from "@/db";
import { fulfillmentSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettings, spendSummary } from "@/lib/agentGate";
import { withCors, preflight } from "@/lib/apiAccess";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function GET(request: NextRequest) {
  return withCors(request, { success: true, ...(await spendSummary()) });
}

/** Update caps and rules. Intended for the human ops dashboard. */
export async function PUT(request: NextRequest) {
  try {
    await getSettings();
    const body = await request.json().catch(() => ({}));
    const numeric = ["maxPartnerBuyUsd", "dailySpendCapUsd", "monthlySpendCapUsd", "minMarginUsd", "minMarginPercent"];
    const text = ["cardNickname", "cardLast4"];

    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const f of numeric) if (body[f] !== undefined && body[f] !== "") update[f] = String(Number(body[f]));
    for (const f of text) if (body[f] !== undefined) update[f] = String(body[f]).slice(0, 60);
    if (body.enabled !== undefined) update.enabled = Boolean(body.enabled);
    if (body.allowLossPurchases !== undefined) update.allowLossPurchases = Boolean(body.allowLossPurchases);

    const rows = await db.select().from(fulfillmentSettings).limit(1);
    const [updated] = await db.update(fulfillmentSettings).set(update)
      .where(eq(fulfillmentSettings.id, rows[0].id)).returning();

    return withCors(request, { success: true, settings: updated });
  } catch (error) {
    console.error("settings update failed", error);
    return withCors(request, { success: false, error: "Unable to save settings." }, { status: 500 });
  }
}
