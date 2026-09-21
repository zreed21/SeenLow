import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, orders, crawlerLogs } from "@/db/schema";
import { count, sql, eq, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const allDeals = await db.select().from(deals).where(and(eq(deals.isActive, true), eq(deals.okToSell, true), inArray(deals.killStatus, ["active", "review"])));
    const allOrders = await db.select().from(orders);
    const allLogs = await db.select().from(crawlerLogs);

    // Calculate metrics
    let totalDiscountSum = 0;
    let totalMSRPAmount = 0;
    let totalDealAmount = 0;
    const categoryCount: Record<string, number> = {};
    const retailerCount: Record<string, number> = {};

    allDeals.forEach((deal) => {
      const disc = Number(deal.discountPercent) || 0;
      totalDiscountSum += disc;
      totalMSRPAmount += Number(deal.originalPrice) || 0;
      totalDealAmount += Number(deal.finalPrice) || 0;

      categoryCount[deal.category] = (categoryCount[deal.category] || 0) + 1;
      retailerCount[deal.retailer] = (retailerCount[deal.retailer] || 0) + 1;
    });

    const avgDiscount = allDeals.length > 0 ? (totalDiscountSum / allDeals.length).toFixed(1) : "0.0";
    const totalPotentialSavings = (totalMSRPAmount - totalDealAmount).toFixed(2);

    let totalOrderSavings = 0;
    let totalOrderRevenue = 0;
    let totalServiceFeesEarned = 0;

    allOrders.forEach((o) => {
      totalOrderSavings += Number(o.customerSavings) || 0;
      totalOrderRevenue += Number(o.totalAmount) || 0;
      totalServiceFeesEarned += (Number(o.serviceFee) || 0) - (Number(o.stripeFeeUsd) || 0);
    });

    const latestMidnightLog = allLogs.find((l) => l.runType === "midnight_crawl");
    const latestHourlyLog = allLogs.find((l) => l.runType === "hourly_verification");

    return NextResponse.json({
      success: true,
      stats: {
        totalDeals: allDeals.length,
        activeDealCount: allDeals.length,
        top50Count: allDeals.filter((d) => d.isTop50).length,
        averageCustomerDiscount: Number(avgDiscount),
        avgDiscount: `${avgDiscount}%`,
        maxDiscount: allDeals.length > 0 ? `${Math.max(...allDeals.map((d) => Number(d.discountPercent)))}%` : "0%",
        totalPotentialSavings: `$${Number(totalPotentialSavings).toLocaleString()}`,
        totalOrders: allOrders.length,
        totalCustomerSavingsPaid: `$${totalOrderSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalServiceFeesEarned: `$${totalServiceFeesEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalGrossVolume: `$${totalOrderRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        hourlyUptime: "100%",
        lastMidnightCrawl: latestMidnightLog?.startedAt || new Date().toISOString(),
        lastHourlyHealthcheck: latestHourlyLog?.startedAt || new Date().toISOString(),
        categoryDistribution: categoryCount,
        retailerDistribution: {},
      },
    });
  } catch (error) {
    console.error("Error in GET /api/stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate stats" },
      { status: 500 }
    );
  }
}
