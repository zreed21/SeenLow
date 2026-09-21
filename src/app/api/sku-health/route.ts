import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, skuOutcomes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { evaluateSkuHealth, recordSkuOutcome, type OutcomeType } from "@/lib/skuHealth";

const TYPES = new Set<OutcomeType>(["paid","delivered","partner_cancel","change_of_mind","defect","wrong_item","damaged","not_as_described","safety_complaint"]);
async function admin() { return (await getSessionUser())?.role === "admin"; }

export async function GET(request: NextRequest) {
  if (!await admin()) return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("dealId") || 0);
  if (id) return NextResponse.json({ success: true, health: await evaluateSkuHealth(id), outcomes: await db.select().from(skuOutcomes).where(eq(skuOutcomes.dealId, id)).orderBy(desc(skuOutcomes.createdAt)) });
  const rows = await db.select().from(deals).orderBy(desc(deals.updatedAt));
  return NextResponse.json({ success: true, skus: rows.map((d) => ({ id: d.id, title: d.title, okToSell: d.okToSell, killStatus: d.killStatus,
    killReason: d.killReason, paid: d.paidOrders, delivered: d.deliveredOrders, partnerCancels: d.partnerCancelCount,
    changeOfMind: d.changeOfMindReturns, uglyReturns: d.defectReturns+d.wrongItemReturns+d.damagedReturns+d.notAsDescribedReturns,
    relistBlockedUntil: d.relistBlockedUntil })) });
}

export async function POST(request: NextRequest) {
  if (!await admin()) return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const body = await request.json();
  if (!TYPES.has(body.type)) return NextResponse.json({ success: false, error: "Invalid outcome type" }, { status: 400 });
  try {
    const health = await recordSkuOutcome({ dealId: Number(body.dealId), orderId: body.orderId ? Number(body.orderId) : undefined,
      type: body.type, amount: Math.max(0, Number(body.amount || 0)), postageLoss: Math.max(0, Number(body.postageLoss || 0)), notes: body.notes });
    return NextResponse.json({ success: true, health });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 400 }); }
}
