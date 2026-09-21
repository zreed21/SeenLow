import "dotenv/config";
import assert from "node:assert/strict";
import { db, pool } from "../src/db/index";
import { orders } from "../src/db/schema";
import { refreshCatalogPricing } from "../src/lib/catalogPricing";

async function run() {
  const before = await db.select().from(orders).orderBy(orders.id);
  const result = await refreshCatalogPricing();
  const after = await db.select().from(orders).orderBy(orders.id);
  assert.deepEqual(after, before, "Catalog migration must never rewrite order prices or payment records");
  console.log(JSON.stringify({ ...result, existingOrdersPreserved: before.length }));
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
