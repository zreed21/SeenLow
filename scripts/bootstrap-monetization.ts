import "dotenv/config";
import { db, pool } from "../src/db/index";
import { affiliatePrograms, monetizationSettings } from "../src/db/schema";

/** Publisher applications, in the order they should be filed. */
const NETWORKS = [
  { network: "amazon", displayName: "Amazon Associates", signupUrl: "https://affiliate-program.amazon.com", notes: "~1-10% by category. 3 qualifying sales in 180 days or the account closes. App must be free and must not wrap Amazon pages in a WebView." },
  { network: "cj", displayName: "CJ Affiliate", signupUrl: "https://signup.cj.com", notes: "Walmart + big box. Fill the network profile like a pitch: deal app, US shoppers, FTC disclosure, no coupon stuffing." },
  { network: "awin", displayName: "Awin (incl. ShareASale)", signupUrl: "https://ui.awin.com/publisher-signup", notes: "Huge mid-market retail coverage." },
  { network: "impact", displayName: "impact.com", signupUrl: "https://impact.com", notes: "Modern contracts; Rakuten Advertising programs migrating here." },
  { network: "rakuten", displayName: "Rakuten Advertising", signupUrl: "https://rakutenadvertising.com", notes: "Create alongside impact.com so no brands still on this dashboard are missed." },
  { network: "flexoffers", displayName: "FlexOffers", signupUrl: "https://www.flexoffers.com", notes: "Easier approvals when CJ/Rakuten say no." },
  { network: "ebay", displayName: "eBay Partner Network", signupUrl: "https://partnernetwork.ebay.com", notes: "Only if marketplace deals are listed." },
];

async function run() {
  for (const program of NETWORKS) {
    await db.insert(affiliatePrograms).values(program).onConflictDoNothing();
  }
  const settings = await db.select().from(monetizationSettings).limit(1);
  if (!settings[0]) await db.insert(monetizationSettings).values({});
  console.log(JSON.stringify({ programs: NETWORKS.length, settingsReady: true }));
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
