import "dotenv/config";
import assert from "node:assert/strict";
import { db, pool } from "../src/db/index";
import { deals, sources } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { resolveRail, getMonetizationSettings, validateRedirect } from "../src/lib/monetization";
import { sourceCanPublish } from "../src/lib/sourceCertification";

/**
 * Read-time source-gate leak test.
 *
 * Blocks a source in the DB ONLY — applySourceGate is deliberately never called,
 * so the deal's denormalized okToSell/isActive/isTop50 flags stay stale and true.
 * Every read path must still drop the SKU immediately. If any of these fail, a
 * blocked/uncertified retailer is reachable in the catalog.
 */
async function run() {
  const settings = await getMonetizationSettings();
  const [deal] = await db.select().from(deals).where(eq(deals.okToSell, true)).limit(1);
  assert.ok(deal?.sourceId, "need a seeded deal with a source");
  const [original] = await db.select().from(sources).where(eq(sources.id, deal.sourceId!));

  const restore = async () => {
    await db.update(sources).set({
      status: original.status, score: original.score,
      approvalExpiresAt: original.approvalExpiresAt, blockReason: original.blockReason,
    }).where(eq(sources.id, original.id));
    await db.update(deals).set({ sourceId: original.id }).where(eq(deals.id, deal.id));
  };

  try {
    // Baseline: certified source publishes.
    await db.update(sources).set({ status: "allowlisted", score: 95, approvalExpiresAt: new Date(Date.now() + 90 * 86_400_000), blockReason: null }).where(eq(sources.id, original.id));
    let [src] = await db.select().from(sources).where(eq(sources.id, original.id));
    assert.equal(resolveRail(deal, settings, src).rail === "unavailable", false, "certified source should publish");

    const staleFlags = await db.select().from(deals).where(eq(deals.id, deal.id));
    assert.equal(staleFlags[0].okToSell, true, "flags must remain stale/true for a valid leak test");

    // 1. status = blocked, DB only.
    await db.update(sources).set({ status: "blocked", blockReason: "leak test" }).where(eq(sources.id, original.id));
    [src] = await db.select().from(sources).where(eq(sources.id, original.id));
    assert.equal(sourceCanPublish(src), false, "blocked source must not publish");
    assert.equal(resolveRail(deal, settings, src).rail, "unavailable", "blocked source must hide BOTH rails, not just affiliate");
    const blockedClick = await validateRedirect(deal.id);
    assert.equal(blockedClick.ok, false, "outbound click must refuse for a blocked source");

    // Flags are still stale — proving the gate is read-time, not gate-job dependent.
    const afterBlock = await db.select().from(deals).where(eq(deals.id, deal.id));
    assert.equal(afterBlock[0].okToSell, true, "applySourceGate must not have run");

    // 2. expired approval.
    await db.update(sources).set({ status: "allowlisted", score: 95, approvalExpiresAt: new Date(Date.now() - 86_400_000), blockReason: null }).where(eq(sources.id, original.id));
    [src] = await db.select().from(sources).where(eq(sources.id, original.id));
    assert.equal(resolveRail(deal, settings, src).rail, "unavailable", "expired approval must hide the SKU");

    // 3. score below floor.
    await db.update(sources).set({ approvalExpiresAt: new Date(Date.now() + 86_400_000), score: 45 }).where(eq(sources.id, original.id));
    [src] = await db.select().from(sources).where(eq(sources.id, original.id));
    assert.equal(resolveRail(deal, settings, src).rail, "unavailable", "sub-70 score must hide the SKU");

    // 4. no source record at all — fail closed.
    assert.equal(resolveRail(deal, settings, undefined).rail, "unavailable", "missing source must fail closed");
    assert.equal(resolveRail(deal, settings, null).rail, "unavailable", "null source must fail closed");

    console.log("PASS: DB-only source block hides the SKU on every read path without applySourceGate");
    console.log("PASS: expired approval, sub-floor score, and missing source all fail closed");
  } finally {
    await restore();
  }
}

run().catch((error) => { console.error("FAIL:", error.message); process.exitCode = 1; }).finally(() => pool.end());
