import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, sources } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { applySourceGate, scanSourcePage, sourceCanPublish, upsertSourceFromScan } from "@/lib/sourceCertification";
import { refreshCatalogPricing } from "@/lib/catalogPricing";

async function admin() { return (await getSessionUser())?.role === "admin"; }

export async function GET() {
  if (!await admin()) return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const sourceRows = await db.select().from(sources).orderBy(desc(sources.updatedAt));
  const catalog = await db.select({ id: deals.id, sourceId: deals.sourceId, title: deals.title, okToSell: deals.okToSell, killStatus: deals.killStatus }).from(deals);
  return NextResponse.json({ success: true, sources: sourceRows.map((source) => ({ ...source,
    canPublish: sourceCanPublish(source), products: catalog.filter((deal) => deal.sourceId === source.id) })) });
}

export async function POST(request: NextRequest) {
  if (!await admin()) return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  try {
    const body = await request.json();
    const scan = await scanSourcePage(String(body.url));
    const source = await upsertSourceFromScan(String(body.name || scan.domain), scan);
    await applySourceGate(source.id);
    await refreshCatalogPricing();
    return NextResponse.json({ success: true, source, scan });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Source scan failed" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const body = await request.json();
  const id = Number(body.id);
  const [source] = await db.select().from(sources).where(eq(sources.id, id));
  if (!source) return NextResponse.json({ success: false, error: "Source not found" }, { status: 404 });
  let update: Partial<typeof sources.$inferInsert> = { updatedAt: new Date() };
  if (body.action === "approve_test_buy") {
    // A completed test buy is the strongest evidence we can have: the goods
    // actually shipped. Distinguish WHY a score is low before refusing it.
    //   - Page unreadable (403/timeout) on an HTTPS host with no complaint
    //     signals -> a real test buy may certify, with an auditable reason.
    //     Large chains routinely block scrapers; that is not a fraud signal.
    //   - Page WAS readable and scored low (crypto-only, no policies, young
    //     domain, complaints) -> the floor stands. No test buy overrides that.
    const evidence = (() => { try { return JSON.parse(source.evidenceJson || "{}"); } catch { return {}; } })();
    const complaints = (() => { try { return JSON.parse(source.complaintSignals || "[]"); } catch { return []; } })();
    const unreadable = Boolean(evidence?.fetchError) && source.httpsValid && complaints.length === 0;
    if (source.score < 70 && !unreadable) {
      return NextResponse.json({ success: false, error: "Source score must be at least 70 before test-buy approval" }, { status: 409 });
    }
    if (source.score < 70 && unreadable && !String(body.overrideReason || "").trim()) {
      return NextResponse.json({ success: false, code: "OVERRIDE_REASON_REQUIRED",
        error: `Scan could not read this page (${evidence.fetchError}). A completed test buy can certify it, but an overrideReason is required for the audit trail.` }, { status: 409 });
    }
    // A completed test buy is direct fulfillment evidence, stronger than page
    // scraping. When it rescues an unreadable page, raise the evidence score to
    // the publish floor so the approval actually takes effect — the override
    // reason and test order id below record exactly why.
    const certifiedScore = source.score < 70 ? 70 : source.score;
    update = { ...update, score: certifiedScore, status: "approved", testBuyPassed: true, testOrderId: String(body.testOrderId || "manual-test"), approvalMethod: "test_buy",
      approvedBy: user.email, approvedAt: new Date(), approvalExpiresAt: new Date(Date.now() + 90 * 86_400_000), blockReason: null,
      reputationSummary: String(body.overrideReason || "").trim()
        ? `Certified by completed test buy ${String(body.testOrderId || "manual-test")}. Ops override: ${String(body.overrideReason).trim()}`
        : source.reputationSummary };
  } else if (body.action === "block") {
    update = { ...update, status: "blocked", blockReason: String(body.reason || "Blocked by operations"), approvalExpiresAt: null };
  } else if (body.action === "hold") {
    update = { ...update, status: "hold", blockReason: String(body.reason || "Held for review") };
  } else return NextResponse.json({ success: false, error: "Unknown source action" }, { status: 400 });
  const [updated] = await db.update(sources).set(update).where(eq(sources.id, id)).returning();
  await applySourceGate(id);
  await refreshCatalogPricing();
  return NextResponse.json({ success: true, source: updated, canPublish: sourceCanPublish(updated) });
}
