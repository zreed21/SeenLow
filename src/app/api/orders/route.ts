import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, orders, orderHistory, notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { buildQuote, orderQuoteFields, publicQuote } from "@/lib/quote";
import { toCents } from "@/lib/pricing";
import { paymentProvider } from "@/lib/payments";
import { sourceSellableForDeal } from "@/lib/sourceCertification";
import { getMonetizationSettings, resolveRail } from "@/lib/monetization";
import { validateUsShipTo } from "@/lib/geo";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user-1";
    const status = searchParams.get("status");

    let query = db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const allOrders = await query;

    // Fetch order histories for these orders
    const ordersWithHistory = await Promise.all(
      allOrders.map(async (order) => {
        const rawHistory = await db
          .select()
          .from(orderHistory)
          .where(eq(orderHistory.orderId, order.id))
          .orderBy(orderHistory.timestamp);
        const history = rawHistory.map((item) => item.status === "retailer_order_placed" ? {
          ...item,
          title: "Order Confirmed & Preparing",
          description: "Your item is confirmed and being prepared for shipment.",
          location: "Order Processing",
        } : item.status === "payment_received" ? {
          ...item,
          title: "Payment Confirmed",
          description: `Payment of $${order.totalAmount} was processed successfully.`,
          location: "Secure Payment Gateway",
        } : item);

        const { retailer, retailerOrderId, retailerBotLog, sourceName, sourceLastSeenPrice, ...publicOrder } = order;
        return {
          ...publicOrder,
          dealPrice: publicOrder.quotedSellPrice ?? (Number(publicOrder.dealPrice) + Number(publicOrder.serviceFee)).toFixed(2),
          serviceFee: "0.00",
          history,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithHistory,
    });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      dealId,
      userId = "demo-user-1",
      userName = "Sarah Connor",
      userEmail = "sarah.connor@opportunitydeals.com",
      shippingAddress,
      paymentMethod = "credit_card",
      cardNumber = "4242 4242 4242 4242",
      displayedPrice,
      acceptedPriceIncrease = false,
    } = body;

    if (!dealId || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Deal ID and Shipping Address are required" },
        { status: 400 }
      );
    }

    const addressObj = typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress;
    // GEO CONTRACT: US lower-48 street addresses only (no AK/HI/PO boxes, no non-US country).
    const geo = validateUsShipTo(addressObj);
    if (!geo.ok) {
      return NextResponse.json({ success: false, code: geo.code, error: geo.error }, { status: 400 });
    }
    const quote = await buildQuote(Number(dealId), String(addressObj.state || "CA"), Number(displayedPrice ?? 0));
    if (!quote.ok) return NextResponse.json({ success: false, error: quote.error }, { status: 409 });
    // Legacy/simulation checkout is still a NEW charge path and must use the
    // same live source + rail guards as Stripe. It may never bypass a DB-only
    // block simply because no PaymentIntent exists.
    const sourceGate = await sourceSellableForDeal(quote.deal);
    if (!sourceGate.sellable) {
      return NextResponse.json({ success: false, code: "SOURCE_NOT_CERTIFIED", error: "This deal is unavailable." }, { status: 409 });
    }
    const rail = resolveRail(quote.deal, await getMonetizationSettings(), sourceGate.source);
    if (rail.rail !== "reseller" && !rail.resellerSecondary) {
      return NextResponse.json({ success: false, code: "AFFILIATE_ONLY",
        error: "This deal is purchased directly at the retailer.", redirectPath: `/api/go/${quote.deal.id}` }, { status: 409 });
    }
    // This legacy endpoint exists only for local simulation. In real Stripe mode
    // it remains disabled, but source certification was still checked first.
    if (paymentProvider() === "stripe") {
      return NextResponse.json({ success: false, error: "Use /api/orders/init and the shared payment flow to pay." }, { status: 409 });
    }
    if (quote.priceIncreased && (!acceptedPriceIncrease || body.acceptedTotal === undefined || toCents(String(body.acceptedTotal)) !== quote.amountCents)) {
      return NextResponse.json({ success: false, code: "PRICE_INCREASED", error: "Review and approve the updated total before paying.",
        livePrice: quote.livePrice, displayedPrice: quote.displayedPrice, newTotal: quote.total, breakdown: publicQuote(quote) }, { status: 409 });
    }
    const deal = quote.deal;
    const dealPriceNum = Number(deal.dealPrice);
    const originalMsrpNum = Number(deal.originalPrice);
    const totalAmount = quote.total;
    const customerSavings = Number(deal.originalPrice) - quote.itemPrice;

    // 2. Generate unique order and retailer bot identifiers
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `MID-${randomSuffix}`;

    const retailerPrefixes: Record<string, string> = {
      "Amazon": "AMZ",
      "Best Buy": "BBY",
      "Target": "TGT",
      "Walmart": "WMT",
      "B&H Photo": "BH",
      "Costco": "CST",
      "REI": "REI",
      "Williams Sonoma": "WS",
      "Nordstrom": "NRD",
      "Nike": "NKE",
      "Samsung": "SAM",
      "Apple": "APL",
    };

    const retailerCode = retailerPrefixes[deal.retailer] || "RET";
    const retailerOrderId = `${retailerCode}-${Math.floor(1000000 + Math.random() * 9000000)}-US`;

    // 3. Select carrier & tracking
    const carriers = ["UPS", "FedEx", "USPS"];
    const chosenCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const trackingNumber = chosenCarrier === "UPS"
      ? `1Z999AA1${Math.floor(1000000000 + Math.random() * 9000000000)}`
      : chosenCarrier === "FedEx"
      ? `${Math.floor(700000000000 + Math.random() * 299999999999)}`
      : `940011189956${Math.floor(10000000 + Math.random() * 90000000)}`;

    const last4 = cardNumber.replace(/\s+/g, "").slice(-4) || "4242";
    const paymentTxnId = `txn_concierge_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // 4. Retailer bot automated execution log
    const botLog = `[INTERNAL FULFILLMENT LOG] Order relay activated.\n` +
      `1. Payment $${totalAmount.toFixed(2)} processed after final live verification.\n` +
      `2. Authenticated with ${deal.retailer} fulfillment interface.\n` +
      `3. Purchased SKU for $${dealPriceNum.toFixed(2)} (MSRP $${originalMsrpNum.toFixed(2)}).\n` +
      `4. Dropship recipient configured: ${addressObj.fullName || userName}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}.\n` +
      `5. Retailer Order Confirmed: #${retailerOrderId}.\n` +
      `6. Carrier assigned: ${chosenCarrier} (Tracking: ${trackingNumber}).`;

    // 5. Create Order
    const newOrder = await db.insert(orders).values({
      orderNumber,
      userId,
      userName: addressObj.fullName || userName,
      userEmail,
      dealId: deal.id,
      productTitle: deal.title,
      productImage: deal.imageUrl,
      retailer: deal.retailer,
      ...orderQuoteFields(quote),
      paidAmountFrozen: quote.total.toFixed(2),
      originalMsrp: deal.originalPrice,
      paymentStatus: "paid",
      paymentMethod,
      paymentCardLast4: last4,
      paymentTransactionId: paymentTxnId,
      dropshipStatus: "retailer_order_placed",
      retailerOrderId,
      retailerBotLog: botLog,
      trackingCarrier: chosenCarrier,
      trackingNumber,
      shippingAddress: JSON.stringify(addressObj),
      estimatedDelivery,
      invoiceNumber: `INV-${orderNumber.replace(/[^A-Z0-9]/gi, "")}`,
      blindShippingRequestedAt: new Date(),
      blindShippingAcknowledged: false,
    }).returning();

    const createdOrder = newOrder[0];

    // 6. Create initial order milestones
    const now = new Date();
    await db.insert(orderHistory).values([
      {
        orderId: createdOrder.id,
        status: "payment_received",
        title: "Payment Confirmed",
        description: `Payment of $${totalAmount.toFixed(2)} was captured successfully via ${paymentMethod.replace("_", " ")}.`,
        location: "Secure Payment Gateway",
        timestamp: now,
      },
      {
        orderId: createdOrder.id,
        status: "retailer_order_placed",
        title: "Order Confirmed & Preparing",
        description: `Your item is confirmed and being prepared for shipment to ${addressObj.city}, ${addressObj.state}.`,
        location: "Order Processing",
        timestamp: new Date(now.getTime() + 1500),
      },
      {
        orderId: createdOrder.id,
        status: "retailer_order_placed",
        title: "Blind-Shipping Instructions Sent",
        description: "Partner fulfilment partner instructed: no invoices, pricing, promotional material, or branded inserts. Our branded customer invoice supplied for the box.",
        location: "Fulfilment Coordination",
        timestamp: new Date(now.getTime() + 3000),
      }
    ]);

    // 7. Update stock in deals
    const updatedStock = Math.max(0, (deal.stockQuantity || 10) - 1);
    await db.update(deals).set({
      stockQuantity: updatedStock,
      stockStatus: updatedStock === 0 ? "sold_out" : updatedStock < 3 ? "low_stock" : "in_stock",
      updatedAt: new Date(),
    }).where(eq(deals.id, deal.id));

    // 8. Create user notification
    await db.insert(notifications).values({
      userId,
      title: `🎉 Order #${orderNumber} Confirmed!`,
      message: `Your order for "${deal.title.slice(0, 40)}..." is confirmed at ${deal.discountPercent}% off. You saved $${customerSavings.toFixed(2)}.`,
      type: "order_shipped",
      isRead: false,
      link: "/orders",
    });

    // 9. Fetch complete created order with history
    const history = await db.select().from(orderHistory).where(eq(orderHistory.orderId, createdOrder.id));

    const { retailer: _retailer, retailerOrderId: _retailerOrderId, retailerBotLog: _retailerBotLog, sourceName: _sn, sourceLastSeenPrice: _sp, ...publicOrder } = createdOrder;
    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: {
        ...publicOrder,
        history,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process your order", details: String(error) },
      { status: 500 }
    );
  }
}
