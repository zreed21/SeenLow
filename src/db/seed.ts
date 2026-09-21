import { db } from "./index";
import { deals, sources, priceObservations, skuOutcomes, crawlerLogs, orders, orderHistory, agentActions, users, userAddresses, notifications, watchlists } from "./schema";
import { ALL_50_RAW_DEALS } from "./seedDataCombined";
import { count, desc } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { catalogPriceFields } from "@/lib/pricing";
import { refreshCatalogPricing } from "@/lib/catalogPricing";
import { buildQuote, orderQuoteFields } from "@/lib/quote";
import { ensureCatalogSource, normalizeDomain, sourceCanPublish } from "@/lib/sourceCertification";

export async function seedDatabaseIfEmpty() {
  try {
    const existingDealsCount = await db.select({ val: count() }).from(deals);
    if (existingDealsCount[0]?.val > 0) {
      return { status: "already_seeded", count: existingDealsCount[0].val };
    }
    return await forceSeedDatabase();
  } catch (error) {
    console.error("Error in seedDatabaseIfEmpty:", error);
    throw error;
  }
}

export async function forceSeedDatabase() {
  console.log("Seeding database with Top 50 deals, orders, and crawler data...");

  // 1. Clean existing records if any
  try {
    await db.delete(priceObservations);
    await db.delete(skuOutcomes);
    await db.delete(agentActions);
    await db.delete(orderHistory);
    await db.delete(orders);
    await db.delete(watchlists);
    await db.delete(notifications);
    await db.delete(userAddresses);
    await db.delete(crawlerLogs);
    await db.delete(deals);
    await db.delete(sources);
    await db.delete(users);
  } catch (e) {
    console.warn("Table cleanup warning:", e);
  }

  // 2. Insert Demo Users
  const insertedUsers = await db.insert(users).values([
    {
      id: 1,
      email: "sarah.connor@opportunitydeals.com",
      name: "Sarah Connor",
      passwordHash: hashPassword("fire2024"),
      role: "user",
      balance: "250.00",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      email: "concierge@opportunitydeals.com",
      name: "Concierge Admin",
      passwordHash: hashPassword("fireadmin2024"),
      role: "admin",
      balance: "5000.00",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    }
  ]).returning();

  // 3. Insert Default Address
  await db.insert(userAddresses).values([
    {
      userId: "user-1",
      fullName: "Sarah Connor",
      street: "742 Evergreen Terrace",
      apt: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94107",
      country: "United States",
      phone: "(415) 555-0198",
      isDefault: true,
    },
    {
      userId: "user-1",
      fullName: "Sarah Connor (Office)",
      street: "100 Market Street",
      apt: "Suite 1200",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
      phone: "(415) 555-0144",
      isDefault: false,
    }
  ]);

  // 4. Prepare and sort the 50 deals by discount percentage descending
  const sortedDeals = ALL_50_RAW_DEALS.map((item) => {
    const orig = Number(item.originalPrice);
    const deal = Number(item.dealPrice);
    const priced = catalogPriceFields(deal, orig);
    const serviceFee = Number(priced.serviceFee);
    const finalPrice = Number(priced.finalPrice);
    const discountPct = Number(priced.discountPercent);

    return {
      ...item,
      discountPercent: discountPct,
      serviceFee,
      finalPrice,
    };
  }).sort((a, b) => b.discountPercent - a.discountPercent);

  // Next midnight calculation
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const midnightScrape = new Date();
  midnightScrape.setHours(0, 0, 0, 0);

  // Source certification is a mandatory gate; unknown domains remain held.
  // Keyed by the product URL's own domain. Never fall back to "first approved
  // source" — that would silently attribute a SKU to a retailer it never came from.
  const sourceByDomain = new Map<string, Awaited<ReturnType<typeof ensureCatalogSource>>>();
  for (const item of sortedDeals) {
    let domainKey: string;
    try { domainKey = normalizeDomain(item.retailerUrl); }
    catch { domainKey = `invalid:${item.retailerUrl}`; }
    if (!sourceByDomain.has(domainKey)) {
      sourceByDomain.set(domainKey, await ensureCatalogSource(item.retailer, item.retailerUrl));
    }
  }

  // Insert Deals
  const dealInserts = sortedDeals.map((item, index) => {
    const rank = index + 1;
    let domainKey: string;
    try { domainKey = normalizeDomain(item.retailerUrl); }
    catch { domainKey = `invalid:${item.retailerUrl}`; }
    const source = sourceByDomain.get(domainKey)!;
    const canSell = sourceCanPublish(source);
    return {
      sourceId: source.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      brand: item.brand,
      originalPrice: item.originalPrice.toFixed(2),
      dealPrice: item.dealPrice.toFixed(2),
      serviceFee: item.serviceFee.toFixed(2),
      finalPrice: item.finalPrice.toFixed(2),
      discountPercent: item.discountPercent.toFixed(2),
      retailer: item.retailer,
      retailerUrl: item.retailerUrl,
      imageUrl: item.imageUrl,
      additionalImages: JSON.stringify(item.additionalImages || []),
      features: JSON.stringify(item.features || []),
      specs: JSON.stringify(item.specs || {}),
      stockStatus: item.stockStatus,
      stockQuantity: item.stockQuantity,
      dealRank: rank,
      isTop50: canSell && rank <= 50,
      okToSell: canSell,
      isHot: item.isHot || rank <= 5,
      isActive: canSell,
      lastScrapedAt: midnightScrape,
      lastVerifiedAt: tenMinutesAgo,
      verificationStatus: "verified_active",
      verificationNotes: `Automated hourly spider verified active at ${item.retailer}. In stock: ${item.stockQuantity} units available at $${item.dealPrice.toFixed(2)}.`,
      opportunityScore: item.opportunityScore,
      dealExpiresAt: nextMidnight,
    };
  });

  const insertedDeals = await db.insert(deals).values(dealInserts).returning();
  await refreshCatalogPricing();

  // 5. Insert Crawler Run Logs (Midnight Scan + Hourly Verification)
  await db.insert(crawlerLogs).values([
    {
      runType: "midnight_crawl",
      status: "completed",
      dealsScanned: 18450,
      dealsUpdated: 50,
      dealsExpired: 14,
      topDiscountFound: sortedDeals[0]?.discountPercent?.toFixed(2) || "77.50",
      logOutput: JSON.stringify([
        "00:00:01 [System] Midnight deal search initialized with 16 worker threads.",
        "00:00:02 [Electronics & Computing] Scanning daily discounts and clearance (4,120 items scanned)...",
        "00:00:03 [Home, Kitchen & Appliances] Scanning limited-time offers (3,400 items scanned)...",
        "00:00:04 [Gaming, Audio & Cameras] Scanning price drops (6,210 items scanned)...",
        "00:00:05 [Fitness, Travel & Style] Scanning flash sales and certified pre-owned offers (4,720 items scanned)...",
        "00:00:06 [Algorithm] Sorting all discovered items by % discount off list price.",
        "00:00:07 [Algorithm] Computing customer prices and verifying stock levels.",
        "00:00:08 [Success] Top 50 Midnight Deals compiled and locked. Highest discount: " + (sortedDeals[0]?.discountPercent || 77.5) + "% off."
      ]),
      startedAt: midnightScrape,
      completedAt: new Date(midnightScrape.getTime() + 8500),
    },
    {
      runType: "hourly_verification",
      status: "completed",
      dealsScanned: 50,
      dealsUpdated: 50,
      dealsExpired: 0,
      topDiscountFound: sortedDeals[0]?.discountPercent?.toFixed(2) || "77.50",
      logOutput: JSON.stringify([
        "Hourly Deal Healthcheck Daemon executed.",
        "Re-checking price and availability for all 50 displayed items...",
        "All 50 active items verified in stock with pricing intact.",
        "Latency check: average verification response 142ms.",
        "Next scheduled hourly healthcheck in 48 minutes."
      ]),
      startedAt: tenMinutesAgo,
      completedAt: new Date(tenMinutesAgo.getTime() + 2400),
    }
  ]);

  // 6. Insert Sample Orders with Automated Dropshipping Bot Relay
  const deal1 = insertedDeals[0]; // Sony Headphones
  const deal2 = insertedDeals[1]; // Dyson Vacuum
  const deal3 = insertedDeals[3]; // MacBook Pro 16

  if (deal1) {
    const quote1 = await buildQuote(deal1.id, "CA", 0);
    if (!quote1.ok) throw new Error(quote1.error);
    const o1 = await db.insert(orders).values({
      orderNumber: "MID-89421",
      userId: "user-1",
      userName: "Sarah Connor",
      userEmail: "sarah.connor@opportunitydeals.com",
      dealId: deal1.id,
      productTitle: deal1.title,
      productImage: deal1.imageUrl,
      retailer: deal1.retailer,
      originalMsrp: deal1.originalPrice,
      ...orderQuoteFields(quote1),
      paidAmountFrozen: quote1.total.toFixed(2),
      paymentStatus: "paid",
      paymentMethod: "credit_card",
      paymentCardLast4: "4242",
      paymentTransactionId: "txn_stripe_sim_88192039",
      dropshipStatus: "shipped",
      retailerOrderId: "BBY-98214902-US",
      retailerBotLog: "Bot relay automated checkout completed on BestBuy.com at $89.99 using Concierge Corporate Purchasing Account. Dropship destination address set to Sarah Connor, San Francisco.",
      trackingCarrier: "UPS",
      trackingNumber: "1Z999AA10123456784",
      shippingAddress: JSON.stringify({
        fullName: "Sarah Connor",
        street: "742 Evergreen Terrace",
        apt: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        zipCode: "94107",
        country: "United States",
        phone: "(415) 555-0198"
      }),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    }).returning();

    if (o1[0]) {
      await db.insert(orderHistory).values([
        {
          orderId: o1[0].id,
          status: "payment_received",
          title: "Payment Confirmed",
          description: "Payment of $" + o1[0].totalAmount + " processed successfully (Visa ending 4242).",
          location: "Secure Payment Gateway",
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
        },
        {
          orderId: o1[0].id,
          status: "retailer_order_placed",
          title: "Order Confirmed & Preparing",
          description: "Your item is confirmed and being prepared for shipment.",
          location: "Order Processing",
          timestamp: new Date(Date.now() - 35 * 60 * 60 * 1000),
        },
        {
          orderId: o1[0].id,
          status: "shipped",
          title: "Shipped & In Transit",
          description: "Package picked up by UPS. Tracking #1Z999AA10123456784.",
          location: "Oakland, CA",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        }
      ]);
    }
  }

  if (deal2) {
    const quote2 = await buildQuote(deal2.id, "CA", 0);
    if (!quote2.ok) throw new Error(quote2.error);
    const o2 = await db.insert(orders).values({
      orderNumber: "MID-86712",
      userId: "user-1",
      userName: "Sarah Connor",
      userEmail: "sarah.connor@opportunitydeals.com",
      dealId: deal2.id,
      productTitle: deal2.title,
      productImage: deal2.imageUrl,
      retailer: deal2.retailer,
      originalMsrp: deal2.originalPrice,
      ...orderQuoteFields(quote2),
      paidAmountFrozen: quote2.total.toFixed(2),
      paymentStatus: "paid",
      paymentMethod: "apple_pay",
      paymentCardLast4: "8891",
      paymentTransactionId: "txn_applepay_sim_7721839",
      dropshipStatus: "delivered",
      retailerOrderId: "TGT-44810294",
      retailerBotLog: "Target API automated order dispatched. Package delivered to front porch with photo verification.",
      trackingCarrier: "FedEx",
      trackingNumber: "784910294819",
      shippingAddress: JSON.stringify({
        fullName: "Sarah Connor",
        street: "742 Evergreen Terrace",
        apt: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        zipCode: "94107",
        country: "United States",
        phone: "(415) 555-0198"
      }),
      estimatedDelivery: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    }).returning();

    if (o2[0]) {
      await db.insert(orderHistory).values([
        {
          orderId: o2[0].id,
          status: "payment_received",
          title: "Payment Confirmed via Apple Pay",
          description: "Payment captured successfully.",
          location: "Apple Pay Gateway",
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        },
        {
          orderId: o2[0].id,
          status: "shipped",
          title: "Shipped via FedEx",
          description: "Package is on its way. Tracking #784910294819.",
          location: "Stockton, CA",
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
        },
        {
          orderId: o2[0].id,
          status: "delivered",
          title: "Delivered to Front Door",
          description: "Package safely delivered to front porch.",
          location: "San Francisco, CA",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        }
      ]);
    }
  }

  // 7. Insert Notifications
  await db.insert(notifications).values([
    {
      userId: "user-1",
      title: "🔥 Midnight Drop Complete: Top 50 Deals Live",
      message: "Tonight's automated midnight crawl scanned 18,450 retail items. 50 best deals ranked by % off are live now!",
      type: "price_drop",
      isRead: false,
      link: "/",
    },
    {
      userId: "user-1",
      title: "🛡️ Hourly Verification Passed (100% In Stock)",
      message: "Hourly price and availability check passed for all 50 deals. No out-of-stock items detected.",
      type: "hourly_check_alert",
      isRead: false,
      link: "/crawler",
    },
    {
      userId: "user-1",
      title: "📦 Order #MID-89421 In Transit",
      message: "Your Sony WH-1000XM5 has shipped via UPS. Tracking: 1Z999AA10123456784.",
      type: "order_shipped",
      isRead: true,
      link: "/orders",
    }
  ]);

  // 8. Insert initial watchlists
  if (deal1 && deal2) {
    await db.insert(watchlists).values([
      { userId: "user-1", dealId: deal1.id, targetDiscount: "75.00" },
      { userId: "user-1", dealId: deal2.id, targetDiscount: "70.00" },
    ]);
  }

  console.log("Database seeded successfully with 50 top deals, orders, addresses, and crawler history.");
  return { status: "success", count: insertedDeals.length };
}
