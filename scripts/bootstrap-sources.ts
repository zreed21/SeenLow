import "dotenv/config";
import { db, pool } from "../src/db/index";
import { deals, sources } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { normalizeDomain } from "../src/lib/sourceCertification";
import { refreshCatalogPricing } from "../src/lib/catalogPricing";

const known = new Set(["amazon.com","bestbuy.com","target.com","walmart.com","bhphotovideo.com","costco.com","rei.com","williams-sonoma.com","nordstrom.com","homedepot.com","nike.com","samsung.com","dell.com","lenovo.com","adorama.com","sephora.com","crutchfield.com","newegg.com","onepeloton.com","nordictrack.com","acehardware.com","bloomingdales.com","dickssportinggoods.com","weber.com","ooni.com","solostove.com"]);

async function run() {
  const catalog = await db.select().from(deals);
  for (const deal of catalog) {
    let domain: string;
    try { domain = normalizeDomain(deal.retailerUrl); } catch { domain = `invalid-${deal.id}.invalid`; }
    const root = domain.split(".").slice(-2).join(".");
    const isKnown = known.has(root);
    let [source] = await db.select().from(sources).where(eq(sources.domain, root)).limit(1);
    if (!source) [source] = await db.insert(sources).values({
      name: deal.retailer, domain: root, score: isKnown ? 90 : 0, status: isKnown ? "allowlisted" : "hold",
      approvalMethod: isKnown ? "allowlist" : null, approvedBy: isKnown ? "catalog-bootstrap" : null,
      approvedAt: isKnown ? new Date() : null, approvalExpiresAt: isKnown ? new Date(Date.now() + 90 * 86_400_000) : null,
      knownChain: isKnown, httpsValid: isKnown, hasContact: isKnown, hasPolicies: isKnown, hasNormalCardCheckout: isKnown,
      hasRealImprint: isKnown, reputationSummary: isKnown ? "Existing known-chain source; 90-day certification created during migration." : "Unverified source held from publication.",
      evidenceJson: JSON.stringify({ migration: true, sourceUrl: deal.retailerUrl, createdAt: new Date().toISOString() }),
    }).returning();
    const canSell = source.status === "allowlisted" || source.status === "approved" && source.testBuyPassed;
    await db.update(deals).set({ sourceId: source.id, okToSell: canSell, isActive: canSell, isTop50: canSell && deal.isTop50 }).where(eq(deals.id, deal.id));
  }
  const pricing = await refreshCatalogPricing();
  console.log(JSON.stringify({ sources: (await db.select().from(sources)).length, ...pricing }));
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
