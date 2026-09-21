import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderHistory, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { recordSkuOutcome } from "@/lib/skuHealth";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const orderId = Number(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
    }

    const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (orderResult.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const history = await db
      .select()
      .from(orderHistory)
      .where(eq(orderHistory.orderId, orderId))
      .orderBy(orderHistory.timestamp);

    const order = orderResult[0];
    const publicHistory = history.map((item) => item.status === "retailer_order_placed" ? { ...item, title: "Order Confirmed & Preparing", description: "Your item is confirmed and being prepared for shipment.", location: "Order Processing" } : item.status === "payment_received" ? { ...item, title: "Payment Confirmed", description: `Payment of $${order.totalAmount} was processed successfully.`, location: "Secure Payment Gateway" } : item);
    const { retailer: _retailer, retailerOrderId: _retailerOrderId, retailerBotLog: _retailerBotLog, sourceName: _sn, sourceLastSeenPrice: _sp, ...publicOrder } = order;
    return NextResponse.json({
      success: true,
      order: {
        ...publicOrder,
        dealPrice: publicOrder.quotedSellPrice ?? (Number(publicOrder.dealPrice) + Number(publicOrder.serviceFee)).toFixed(2),
        serviceFee: "0.00",
        history: publicHistory,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const orderId = Number(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    const { dropshipStatus, location = "Regional Distribution Facility", note } = body;

    const existingOrder = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (existingOrder.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = existingOrder[0];

    const statusDescriptions: Record<string, { title: string; description: string }> = {
      retailer_order_placed: {
        title: "Order Confirmed & Preparing",
        description: "Your item is confirmed and being prepared for shipment.",
      },
      retailer_processing: {
        title: "Order Being Packed",
        description: "Your item has been allocated and is being packed for dispatch.",
      },
      shipped: {
        title: "Package Shipped & In Transit",
        description: `Shipped via ${order.trackingCarrier}. Tracking #${order.trackingNumber}.`,
      },
      out_for_delivery: {
        title: "Out for Delivery Today",
        description: `Your ${order.trackingCarrier} package is out for delivery today.`,
      },
      delivered: {
        title: "Package Delivered",
        description: `Your package has been delivered.`,
      },
      cancelled: {
        title: "Order Cancelled & Refunded",
        description: "Your order was cancelled and a full refund has been issued.",
      },
    };

    const statusMeta = statusDescriptions[dropshipStatus] || {
      title: `Status Updated: ${dropshipStatus}`,
      description: note || `Order updated to ${dropshipStatus}.`,
    };

    const wasDelivered = order.dropshipStatus === "delivered";
    const updated = await db
      .update(orders)
      .set({
        dropshipStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (dropshipStatus === "delivered" && !wasDelivered) {
      const estimatedNet = Number(order.quotedSellPrice || 0) - Number(order.sourceLastSeenPrice || 0) - Number(order.stripeFeeUsd || 0);
      await recordSkuOutcome({ dealId: order.dealId, orderId, type: "delivered", amount: Math.max(0, estimatedNet) });
    }

    // Add milestone
    await db.insert(orderHistory).values({
      orderId,
      status: dropshipStatus,
      title: statusMeta.title,
      description: note || statusMeta.description,
      location,
      timestamp: new Date(),
    });

    // Send notification
    await db.insert(notifications).values({
      userId: order.userId,
      title: `📦 Order #${order.orderNumber}: ${statusMeta.title}`,
      message: note || statusMeta.description,
      type: "order_shipped",
      isRead: false,
      link: `/orders?orderId=${orderId}`,
    });

    const fullHistory = await db
      .select()
      .from(orderHistory)
      .where(eq(orderHistory.orderId, orderId))
      .orderBy(orderHistory.timestamp);

    const { retailer: _retailer, retailerOrderId: _retailerOrderId, retailerBotLog: _retailerBotLog, sourceName: _sn2, sourceLastSeenPrice: _sp2, ...publicOrder } = updated[0];
    return NextResponse.json({
      success: true,
      order: {
        ...publicOrder,
        dealPrice: publicOrder.quotedSellPrice ?? (Number(publicOrder.dealPrice) + Number(publicOrder.serviceFee)).toFixed(2),
        serviceFee: "0.00",
        history: fullHistory,
      },
    });
  } catch (error) {
    console.error("Error in PUT /api/orders/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
