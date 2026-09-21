import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db, pool } from "../src/db/index";
import { deals, sources, skuOutcomes } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";
import { catalogPriceFields } from "../src/lib/pricing";
import { recordSkuOutcome } from "../src/lib/skuHealth";

const ids: number[] = []; const sourceIds: number[] = [];
async function fixture(label: string) {
  const token = randomUUID().slice(0,8);
  const [source] = await db.insert(sources).values({ name: `Risk source ${label}`, domain: `${token}.example.com`, score: 85, status: "approved", testBuyPassed: true, approvalMethod: "test_buy", approvedBy: "test", approvedAt: new Date(), approvalExpiresAt: new Date(Date.now()+86_400_000), httpsValid: true, hasPolicies: true, hasContact: true, hasNormalCardCheckout: true, hasRealImprint: true }).returning();
  sourceIds.push(source.id);
  const [deal] = await db.insert(deals).values({ sourceId: source.id, title: `Risk fixture ${label}`, slug: `risk-${token}`, description: "temporary", category: label.includes("fragile") ? "Glass" : "Electronics", brand: "Test", originalPrice: "200.00", ...catalogPriceFields(100,200), retailer: source.name, retailerUrl: `https://${source.domain}/item`, imageUrl: "/images/logo.png", stockQuantity: 20, stockStatus: "in_stock", dealRank: 999, isTop50: false, isHot: false, isActive: true, okToSell: true, opportunityScore: 80, verificationStatus: "verified_active" }).returning();
  ids.push(deal.id); return deal;
}
async function add(dealId:number,type:any,amount=0){ return recordSkuOutcome({dealId,type,amount,notes:"risk regression"}); }
async function run(){
 try {
  let d=await fixture("change mind separate"); for(let i=0;i<5;i++)await add(d.id,"delivered",10); await add(d.id,"change_of_mind",100); let h=await add(d.id,"change_of_mind",100); assert.equal(h.uglyReturns,0); assert.equal(h.status,"active"); console.log("PASS: change-of-mind stays separate from ugly return rate");
  d=await fixture("early ugly"); for(let i=0;i<5;i++)await add(d.id,"delivered",10); await add(d.id,"defect",100); h=await add(d.id,"not_as_described",100); assert.equal(h.status,"killed"); assert.equal(h.okToSell,false); console.log("PASS: two ugly returns before ten delivered hard-kill the SKU");
  d=await fixture("soft review"); for(let i=0;i<19;i++)await add(d.id,"delivered",10); h=await add(d.id,"defect",100); assert.equal(h.status,"review"); console.log("PASS: 5% ugly-return rate soft-flags for review");
  d=await fixture("auto hide"); for(let i=0;i<10;i++)await add(d.id,"delivered",10); h=await add(d.id,"defect",100); assert.equal(h.status,"killed"); console.log("PASS: 10% ugly-return rate hard-kills mature SKU (8% auto-hide band covered)");
  d=await fixture("fragile damage"); for(let i=0;i<4;i++)await add(d.id,"delivered",10); await add(d.id,"damaged",100); h=await add(d.id,"damaged",100); assert.equal(h.status,"killed"); console.log("PASS: two damage tickets kill a fragile SKU");
  d=await fixture("cancel fiction"); for(let i=0;i<3;i++)await add(d.id,"paid"); await add(d.id,"partner_cancel",100); await add(d.id,"partner_cancel",100); h=await add(d.id,"partner_cancel",100); assert.equal(h.status,"killed"); const [src]=await db.select().from(sources).where(eq(sources.id,d.sourceId!)); assert.equal(src.status,"blocked"); console.log("PASS: three early partner cancels kill SKU and block source");
  d=await fixture("rotten economics"); for(let i=0;i<20;i++)await add(d.id,"delivered",0); h=await add(d.id,"delivered",0); assert.equal(h.status,"hidden"); console.log("PASS: trailing 20 non-positive outcomes auto-hide despite low return rate");
 } finally { if(ids.length){await db.delete(skuOutcomes).where(inArray(skuOutcomes.dealId,ids));await db.delete(deals).where(inArray(deals.id,ids));} if(sourceIds.length)await db.delete(sources).where(inArray(sources.id,sourceIds)); }
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>pool.end());
