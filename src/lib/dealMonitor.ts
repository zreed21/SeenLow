import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { ensureDealInboxTable, firstInboxRow, inboxRows } from "@/lib/dealInboxSchema";
import { applyScrapedPriceToDeal, scrapeProductPrice } from "@/lib/priceScrape";

/** Stop monitoring when discount falls to 50% or below (not a deal anymore). */
export const MIN_DEAL_DISCOUNT_PERCENT = 50;

export type MonitorStopReason = "sold_out" | "no_longer_a_deal";

async function stopMonitoring(
  inboxId: number,
  dealId: number,
  reason: MonitorStopReason,
  detail: string,
) {
  const notes =
    reason === "sold_out"
      ? `Monitoring stopped: sold out. ${detail}`
      : `Monitoring stopped: discount <= ${MIN_DEAL_DISCOUNT_PERCENT}%. ${detail}`;

  await db.execute(sql`
    UPDATE deal_inbox SET
      review_status = 'stopped_needs_review',
      check_status = ${reason === "sold_out" ? "unavailable" : "priced"},
      check_notes = ${notes},
      last_monitored_at = now(),
      updated_at = now()
    WHERE id = ${inboxId}
  `);

  const stockPatch =
    reason === "sold_out"
      ? { stockStatus: "sold_out" as const, verificationStatus: "out_of_stock" as const }
      : { verificationStatus: "price_changed" as const };

  await db.update(deals).set({
    isActive: false,
    okToSell: false,
    isTop50: false,
    ...stockPatch,
    verificationNotes: notes,
    updatedAt: new Date(),
  }).where(eq(deals.id, dealId));
}

/**
 * Recheck every deal_inbox row in `monitoring` state.
 * Stops (and flags for owner review) when sold out or discountPercent <= 50.
 */
export async function runDealMonitor(opts?: { onlyInboxId?: number; limit?: number }) {
  await ensureDealInboxTable();
  const limit = opts?.limit ?? 25;
  const found = opts?.onlyInboxId
    ? await db.execute(sql`
        SELECT * FROM deal_inbox
        WHERE id = ${opts.onlyInboxId} AND review_status = 'monitoring' AND deal_id IS NOT NULL
        LIMIT 1
      `)
    : await db.execute(sql`
        SELECT * FROM deal_inbox
        WHERE review_status = 'monitoring' AND deal_id IS NOT NULL
        ORDER BY COALESCE(last_monitored_at, monitor_started_at, created_at) ASC NULLS FIRST
        LIMIT ${limit}
      `);

  const rows = inboxRows(found);
  const results: Array<{
    inboxId: number;
    dealId: number;
    ok: boolean;
    action: "still_monitoring" | "stopped_needs_review" | "skipped";
    reason?: string;
    salePrice?: number | null;
    discountPercent?: number | null;
  }> = [];

  for (const row of rows) {
    const inboxId = Number(row.id);
    const dealId = Number(row.deal_id);
    if (!inboxId || !dealId) {
      results.push({ inboxId, dealId, ok: false, action: "skipped", reason: "Missing ids" });
      continue;
    }

    const scrape = await scrapeProductPrice(String(row.url));
    await db.execute(sql`
      UPDATE deal_inbox SET
        title = COALESCE(${scrape.title}, title),
        sale_price = COALESCE(${scrape.salePrice}, sale_price),
        listed_price = COALESCE(${scrape.listedPrice}, listed_price),
        ends_at = COALESCE(${scrape.endsAt}, ends_at),
        last_checked_at = now(),
        last_monitored_at = now(),
        check_status = ${scrape.ok ? (scrape.available === false ? "unavailable" : "priced") : "failed"},
        check_notes = ${scrape.notes},
        updated_at = now()
      WHERE id = ${inboxId}
    `);

    if (scrape.ok) {
      await applyScrapedPriceToDeal(dealId, scrape);
    }

    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      results.push({ inboxId, dealId, ok: false, action: "skipped", reason: "Deal missing" });
      continue;
    }

    const discount = Number(deal.discountPercent);
    const soldOut =
      deal.stockStatus === "sold_out" ||
      (scrape.ok && scrape.available === false);

    if (soldOut) {
      await stopMonitoring(inboxId, dealId, "sold_out", scrape.notes || `stockStatus=${deal.stockStatus}`);
      results.push({
        inboxId,
        dealId,
        ok: true,
        action: "stopped_needs_review",
        reason: "sold_out",
        salePrice: scrape.salePrice,
        discountPercent: discount,
      });
      continue;
    }

    if (Number.isFinite(discount) && discount <= MIN_DEAL_DISCOUNT_PERCENT) {
      await stopMonitoring(
        inboxId,
        dealId,
        "no_longer_a_deal",
        `discountPercent=${discount.toFixed(2)}; sale=${deal.dealPrice}; list=${deal.originalPrice}`,
      );
      results.push({
        inboxId,
        dealId,
        ok: true,
        action: "stopped_needs_review",
        reason: "no_longer_a_deal",
        salePrice: Number(deal.dealPrice),
        discountPercent: discount,
      });
      continue;
    }

    results.push({
      inboxId,
      dealId,
      ok: scrape.ok,
      action: "still_monitoring",
      reason: scrape.notes,
      salePrice: scrape.salePrice ?? Number(deal.dealPrice),
      discountPercent: discount,
    });
  }

  if (results.some((r) => r.action !== "skipped")) {
    await refreshCatalogPricing();
  }

  return {
    checked: results.length,
    stopped: results.filter((r) => r.action === "stopped_needs_review").length,
    stillMonitoring: results.filter((r) => r.action === "still_monitoring").length,
    results,
  };
}

export async function getInboxById(id: number) {
  await ensureDealInboxTable();
  const found = await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`);
  return firstInboxRow(found);
}
