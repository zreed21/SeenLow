import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPolicies } from "@/lib/policies";
import { blindShippingInstructions, customerInvoice, makeInvoiceNumber } from "@/lib/documents";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ orderId: string; type: string }> }
) {
  try {
    const { orderId, type } = await props.params;
    const id = Number(orderId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid order id" }, { status: 400 });
    }

    const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!rows[0]) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const order = rows[0];
    const p = await getPolicies();
    const invoiceNumber = order.invoiceNumber || makeInvoiceNumber(order.orderNumber);

    let html: string;
    if (type === "blind-shipping") {
      html = await blindShippingInstructions({ ...order, invoiceNumber, quantity: 1 }, p);
    } else if (type === "invoice") {
      html = await customerInvoice({ ...order, invoiceNumber, quantity: 1 }, p);
    } else {
      return new NextResponse("Unknown document type", { status: 404 });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Document generation failed", error);
    return new NextResponse("Unable to generate document", { status: 500 });
  }
}
