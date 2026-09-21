import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db, pool } from "../src/db/index";
import { deals, sources } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { applySourceGate, ensureCatalogSource, scanSourcePage, sourceCanPublish } from "../src/lib/sourceCertification";
import { catalogPriceFields } from "../src/lib/pricing";

async function run(){
 const dealIds:number[]=[]; const sourceIds:number[]=[];
 try{
  await assert.rejects(()=>scanSourcePage("https://127.0.0.1/internal"),/Private source address blocked/);
  console.log("PASS: SSRF/private-network source URL is blocked");
  const unknown=await ensureCatalogSource("Unknown",`https://${randomUUID().slice(0,8)}.example.invalid/item`); sourceIds.push(unknown.id); assert.equal(sourceCanPublish(unknown),false);
  const [held]=await db.insert(deals).values({sourceId:unknown.id,title:"Held source fixture",slug:`held-${randomUUID()}`,description:"temp",category:"Electronics",brand:"Test",originalPrice:"200",...catalogPriceFields(100,200),retailer:"Unknown",retailerUrl:`https://${unknown.domain}/item`,imageUrl:"/images/logo.png",stockQuantity:2,stockStatus:"in_stock",dealRank:999,isTop50:false,isHot:false,isActive:true,okToSell:true,opportunityScore:80,verificationStatus:"verified_active"}).returning(); dealIds.push(held.id); await applySourceGate(unknown.id); const [after]=await db.select().from(deals).where(eq(deals.id,held.id)); assert.equal(after.okToSell,false); assert.equal(after.isActive,false); console.log("PASS: no source scan/test buy means SKU cannot publish");
  const [approved]=await db.update(sources).set({score:80,status:"approved",testBuyPassed:true,testOrderId:"TEST-1",approvalMethod:"test_buy",approvedAt:new Date(),approvalExpiresAt:new Date(Date.now()+86_400_000)}).where(eq(sources.id,unknown.id)).returning(); assert.equal(sourceCanPublish(approved),true); await applySourceGate(unknown.id); const [live]=await db.select().from(deals).where(eq(deals.id,held.id)); assert.equal(live.okToSell,true); console.log("PASS: score >=70 plus completed test buy certifies unknown source");
  await db.update(sources).set({status:"blocked",blockReason:"fraud evidence"}).where(eq(sources.id,unknown.id)); await applySourceGate(unknown.id); const [blocked]=await db.select().from(deals).where(eq(deals.id,held.id)); assert.equal(blocked.okToSell,false); assert.equal(blocked.isTop50,false); console.log("PASS: source block immediately disables every linked SKU");
 }finally{for(const id of dealIds)await db.delete(deals).where(eq(deals.id,id));for(const id of sourceIds)await db.delete(sources).where(eq(sources.id,id));}
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>pool.end());
