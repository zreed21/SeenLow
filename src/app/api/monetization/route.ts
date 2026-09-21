import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, affiliatePrograms, sponsoredSlots, monetizationSettings, affiliateClicks, sources } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getMonetizationSettings, resolveRail } from "@/lib/monetization";
import { sourceCanPublish } from "@/lib/sourceCertification";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { isUsAffiliateTracker, isUsStorefrontUrl } from "@/lib/geo";

async function admin() { return (await getSessionUser())?.role === "admin"; }

export async function GET() {
  if (!await admin()) return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const settings = await getMonetizationSettings();
  const programs = await db.select().from(affiliatePrograms).orderBy(affiliatePrograms.id);
  const slots = await db.select().from(sponsoredSlots).orderBy(desc(sponsoredSlots.createdAt));
  const catalog = await db.select().from(deals).orderBy(deals.dealRank);
  const sourceRows = await db.select().from(sources);
  const clicks = await db.select().from(affiliateClicks).orderBy(desc(affiliateClicks.clickedAt)).limit(100);
  return NextResponse.json({ success: true, settings, programs, slots,
    clicks: { recent: clicks, total: clicks.length, blocked: clicks.filter((c) => !c.revalidated).length },
    skus: catalog.map((deal) => ({ id: deal.id, title: deal.title, okToSell: deal.okToSell,
      ctaType: deal.ctaType, affiliateNetwork: deal.affiliateNetwork, affiliateStatus: deal.affiliateStatus,
      trackingUrl: deal.trackingUrl, commissionEstimate: deal.commissionEstimate,
      resellerAllowed: deal.resellerAllowed,
      sourceCertified: sourceCanPublish(sourceRows.find((row) => row.id === deal.sourceId)),
      rail: resolveRail(deal, settings, sourceRows.find((row) => row.id === deal.sourceId)) })) });
}

export async function PUT(request: NextRequest) {
  if (!await admin()) return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  const body = await request.json();
  try {
    if (body.target === "settings") {
      await getMonetizationSettings();
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (body.defaultRail !== undefined) update.defaultRail = body.defaultRail === "reseller" ? "reseller" : "affiliate";
      if (body.resellerFrozen !== undefined) update.resellerFrozen = Boolean(body.resellerFrozen);
      if (body.bestDealMinScore !== undefined) update.bestDealMinScore = String(Math.min(1, Math.max(0, Number(body.bestDealMinScore) || 0)));
      if (body.cashbackEnabled !== undefined) {
        const settings = await getMonetizationSettings();
        if (Boolean(body.cashbackEnabled) && !settings.firstCommissionPaidAt) {
          return NextResponse.json({ success: false, error: "Cashback stays off until the first network commission has actually paid out. Record firstCommissionPaidAt first." }, { status: 409 });
        }
        update.cashbackEnabled = Boolean(body.cashbackEnabled);
      }
      if (body.firstCommissionPaidAt !== undefined) update.firstCommissionPaidAt = body.firstCommissionPaidAt ? new Date(body.firstCommissionPaidAt) : null;
      const rows = await db.select().from(monetizationSettings).limit(1);
      const [updated] = await db.update(monetizationSettings).set(update).where(eq(monetizationSettings.id, rows[0].id)).returning();
      return NextResponse.json({ success: true, settings: updated });
    }
    if (body.target === "program") {
      const [updated] = await db.update(affiliatePrograms).set({
        status: ["not_applied", "applied", "approved", "rejected"].includes(body.status) ? body.status : "not_applied",
        publisherId: body.publisherId ? String(body.publisherId) : null, notes: body.notes ? String(body.notes) : null,
        appliedAt: body.status === "applied" ? new Date() : undefined, approvedAt: body.status === "approved" ? new Date() : undefined,
        updatedAt: new Date() }).where(eq(affiliatePrograms.id, Number(body.id))).returning();
      return NextResponse.json({ success: true, program: updated });
    }
    if (body.target === "sku") {
      const dealId = Number(body.dealId);
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (body.affiliateNetwork !== undefined) update.affiliateNetwork = body.affiliateNetwork || null;
      if (body.advertiserId !== undefined) update.advertiserId = body.advertiserId || null;
      if (body.trackingUrl !== undefined) {
        const url = String(body.trackingUrl || "");
        if (url && !url.startsWith("https://")) return NextResponse.json({ success: false, error: "Tracking URLs must be HTTPS" }, { status: 400 });
        // GEO CONTRACT: affiliate links must be the US program tracker.
        if (url) {
          const tracker = isUsAffiliateTracker(url);
          if (!tracker.ok) return NextResponse.json({ success: false, code: "NON_US_TRACKER", error: tracker.reason }, { status: 400 });
        }
        update.trackingUrl = url || null;
      }
      if (body.commissionEstimate !== undefined) update.commissionEstimate = body.commissionEstimate === "" ? null : String(Number(body.commissionEstimate));
      if (body.affiliateStatus !== undefined && ["none", "applied", "approved", "rejected"].includes(body.affiliateStatus)) update.affiliateStatus = body.affiliateStatus;
      if (body.resellerAllowed !== undefined) update.resellerAllowed = Boolean(body.resellerAllowed);
      const [current] = await db.select().from(deals).where(eq(deals.id, dealId));
      if (!current) return NextResponse.json({ success: false, error: "SKU not found" }, { status: 404 });
      const next = { ...current, ...update } as typeof current;
      if (next.affiliateStatus === "approved" && !next.trackingUrl) {
        return NextResponse.json({ success: false, error: "An approved affiliate SKU needs a tracking URL before Stripe is switched off." }, { status: 400 });
      }
      if (next.affiliateStatus === "approved") {
        const [skuSource] = next.sourceId ? await db.select().from(sources).where(eq(sources.id, next.sourceId)) : [];
        if (!sourceCanPublish(skuSource)) {
          return NextResponse.json({ success: false, code: "SOURCE_NOT_CERTIFIED",
            error: "Certify the source (live HTTPS scan, score >= 70, approved + test buy or allowlisted, unexpired) before turning on an affiliate CTA." }, { status: 409 });
        }
        if (!skuSource.lastScannedAt || !skuSource.httpsValid) {
          return NextResponse.json({ success: false, code: "NO_LIVE_SCAN_EVIDENCE",
            error: "A live HTTPS inspection of this source is required as evidence before the affiliate CTA can turn on." }, { status: 409 });
        }
        // The tracked link must leave from the certified domain's program, not an unrelated host.
        if (!/^https:\/\//i.test(String(next.trackingUrl))) {
          return NextResponse.json({ success: false, error: "Tracking URLs must be HTTPS" }, { status: 400 });
        }
        // GEO CONTRACT: re-check at approval time — the stored link must be a US program tracker.
        const approvedTracker = isUsAffiliateTracker(String(next.trackingUrl));
        if (!approvedTracker.ok) {
          return NextResponse.json({ success: false, code: "NON_US_TRACKER", error: approvedTracker.reason }, { status: 400 });
        }
        // GEO CONTRACT: the SKU's own product URL must also be a US storefront.
        const productGeo = isUsStorefrontUrl(String(next.retailerUrl || ""));
        if (!productGeo.ok) {
          return NextResponse.json({ success: false, code: "NON_US_STOREFRONT",
            error: `SKU product URL is not a US storefront (${productGeo.domain || "invalid URL"}).` }, { status: 400 });
        }
      }
      update.ctaType = next.affiliateStatus === "approved" && next.trackingUrl ? "affiliate" : "reseller";
      const [updated] = await db.update(deals).set(update).where(eq(deals.id, dealId)).returning();
      await refreshCatalogPricing();
      const [updatedSource] = updated.sourceId ? await db.select().from(sources).where(eq(sources.id, updated.sourceId)) : [];
      return NextResponse.json({ success: true, sku: updated, rail: resolveRail(updated, await getMonetizationSettings(), updatedSource) });
    }
    if (body.target === "sponsored") {
      if (body.id) {
        const [updated] = await db.update(sponsoredSlots).set({ active: Boolean(body.active) }).where(eq(sponsoredSlots.id, Number(body.id))).returning();
        return NextResponse.json({ success: true, slot: updated });
      }
      if (!String(body.destinationUrl || "").startsWith("https://")) return NextResponse.json({ success: false, error: "Sponsored destination must be HTTPS" }, { status: 400 });
      const [slot] = await db.insert(sponsoredSlots).values({ brandName: String(body.brandName || "Brand"),
        headline: String(body.headline || "Sponsored deal"), destinationUrl: String(body.destinationUrl),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null, weeklyFeeUsd: String(Number(body.weeklyFeeUsd) || 0),
        active: Boolean(body.active), startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null }).returning();
      return NextResponse.json({ success: true, slot });
    }
    return NextResponse.json({ success: false, error: "Unknown target" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Update failed" }, { status: 400 });
  }
}
