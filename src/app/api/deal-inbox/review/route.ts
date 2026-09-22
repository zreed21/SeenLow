import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { ensureDealInboxTable, firstInboxRow } from "@/lib/dealInboxSchema";
import { scrapeProductPrice } from "@/lib/priceScrape";
import { runDealMonitor } from "@/lib/dealMonitor";
import { publishDealFromInbox } from "@/lib/dealInboxPublish";

async function requireAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return null;
  return user;
}

/**
 * Owner actions for /admin/deal-review:
 * - approve: scrape first; only publish+monitor if in stock
 * - reject | hold: stage off live
 * - remove: unpublish deal, keep inbox for review
 * - requeue: move stopped/rejected back to awaiting_verification
 * - check: run a one-off price scrape (and monitor stop rules if already monitoring)
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureDealInboxTable();
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  const action = String(body.action || "");
  if (!id || !action) {
    return NextResponse.json({ success: false, error: "id and action required" }, { status: 400 });
  }

  const row = firstInboxRow(await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`));
  if (!row) return NextResponse.json({ success: false, error: "Inbox row not found" }, { status: 404 });

  if (action === "reject" || action === "hold") {
    const status = action === "reject" ? "rejected" : "held";
    const note = body.note ? String(body.note) : (action === "reject" ? "Rejected by owner." : "Held for later review.");
    if (row.deal_id) {
      await db.update(deals).set({
        isActive: false,
        okToSell: false,
        isTop50: false,
        verificationNotes: note,
        updatedAt: new Date(),
      }).where(eq(deals.id, Number(row.deal_id)));
      await refreshCatalogPricing();
    }
    await db.execute(sql`
      UPDATE deal_inbox SET
        review_status = ${status},
        check_notes = ${note},
        updated_at = now()
      WHERE id = ${id}
    `);
    return NextResponse.json({ success: true, reviewStatus: status, message: note });
  }

  if (action === "requeue") {
    await db.execute(sql`
      UPDATE deal_inbox SET
        review_status = 'awaiting_verification',
        check_notes = 'Requeued for owner verification.',
        updated_at = now()
      WHERE id = ${id}
    `);
    return NextResponse.json({ success: true, reviewStatus: "awaiting_verification" });
  }

  if (action === "remove") {
    if (row.deal_id) {
      await db.update(deals).set({
        isActive: false,
        okToSell: false,
        isTop50: false,
        verificationNotes: "Removed from site by owner (deal-review).",
        updatedAt: new Date(),
      }).where(eq(deals.id, Number(row.deal_id)));
      await refreshCatalogPricing();
    }
    await db.execute(sql`
      UPDATE deal_inbox SET
        review_status = 'stopped_needs_review',
        check_notes = 'Removed from site — needs owner review before republish.',
        updated_at = now()
      WHERE id = ${id}
    `);
    return NextResponse.json({ success: true, message: "Removed from site; flagged for review." });
  }

  if (action === "check") {
    const scrape = await scrapeProductPrice(String(row.url));
    await db.execute(sql`
      UPDATE deal_inbox SET
        title = COALESCE(${scrape.title}, title),
        sale_price = COALESCE(${scrape.salePrice}, sale_price),
        listed_price = COALESCE(${scrape.listedPrice}, listed_price),
        ends_at = COALESCE(${scrape.endsAt}, ends_at),
        last_checked_at = now(),
        check_status = ${scrape.ok ? (scrape.available === false ? "unavailable" : "priced") : "failed"},
        check_notes = ${scrape.notes},
        updated_at = now()
      WHERE id = ${id}
    `);
    let monitor = null;
    if (row.review_status === "monitoring" && row.deal_id) {
      monitor = await runDealMonitor({ onlyInboxId: id });
    }
    return NextResponse.json({
      success: true,
      scrape: {
        ok: scrape.ok,
        salePrice: scrape.salePrice,
        listedPrice: scrape.listedPrice,
        available: scrape.available,
        notes: scrape.notes,
        title: scrape.title,
      },
      monitor,
    });
  }

  if (action === "approve") {
    // Always recheck stock before going live.
    const scrape = await scrapeProductPrice(String(row.url));
    await db.execute(sql`
      UPDATE deal_inbox SET
        title = COALESCE(${scrape.title}, title),
        sale_price = COALESCE(${scrape.salePrice}, sale_price),
        listed_price = COALESCE(${scrape.listedPrice}, listed_price),
        ends_at = COALESCE(${scrape.endsAt}, ends_at),
        last_checked_at = now(),
        check_status = ${scrape.ok ? (scrape.available === false ? "unavailable" : "priced") : "failed"},
        check_notes = ${scrape.notes},
        updated_at = now()
      WHERE id = ${id}
    `);

    if (scrape.ok && scrape.available === false) {
      return NextResponse.json({
        success: false,
        error: "Cannot approve — product appears sold out / unavailable. Fix the link or hold for review.",
        scrape,
      }, { status: 409 });
    }

    const refreshed = firstInboxRow(await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`));
    const sale = Number(refreshed?.sale_price ?? scrape.salePrice);
    if (!Number.isFinite(sale) || sale <= 0) {
      return NextResponse.json({
        success: false,
        error: "Add a sale price (or run a successful price check) before approving.",
        scrape,
      }, { status: 400 });
    }

    const published = await publishDealFromInbox(id);
    if (!published.ok) {
      return NextResponse.json({
        success: false,
        error: published.error,
        scrape,
      }, { status: published.status });
    }
    return NextResponse.json({
      success: true,
      message: "Approved & published. Live monitoring will recheck every 30 minutes via POST /api/deal-monitor/run.",
      dealId: published.dealId,
      scrape,
      publish: published,
    });
  }

  return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
}
