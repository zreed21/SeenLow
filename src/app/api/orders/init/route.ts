import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { buildQuote, orderQuoteFields, publicQuote } from "@/lib/quote";
import { toCents } from "@/lib/pricing";
import { randomBytes } from "node:crypto";
import { hashShipTo, paymentProvider, STATEMENT_DESCRIPTOR } from "@/lib/payments";
import { withCors, preflight, isAuthorized } from "@/lib/apiAccess";
import { getMonetizationSettings, resolveRail } from "@/lib/monetization";
import { sourceSellableForDeal } from "@/lib/sourceCertification";
import { validateUsShipTo } from "@/lib/geo";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

/**
 * Step 1 of checkout: create a PENDING order so we own an order_id BEFORE any
 * payment object exists. That id becomes the Stripe metadata key and the
 * idempotency key, which is what makes disputes and the agent queue workable.
 *
 * No charge happens here. Totals are computed server-side from the live price.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return withCors(request, { success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const dealId = Number(body.dealId);
    const shippingAddress = typeof body.shippingAddress === "string" ? JSON.parse(body.shippingAddress) : body.shippingAddress;
    const userEmail = String(body.userEmail || "").trim().toLowerCase();
    const userId = String(body.userId || "guest");
    const acceptedPriceIncrease = Boolean(body.acceptedPriceIncrease);
    const displayedPrice = Number(body.displayedPrice || 0);

    if (!dealId || !shippingAddress?.state) {
      return withCors(request, { success: false, error: "dealId and shipping address are required" }, { status: 400 });
    }

    // GEO CONTRACT: reseller path only serves lower-48 US street addresses, and
    // only from US storefront sources (enforced again inside the quote + rail gate).
    const geo = validateUsShipTo(shippingAddress);
    if (!geo.ok) {
      return withCors(request, { success: false, code: geo.code, error: geo.error }, { status: 400 });
    }

    const quote = await buildQuote(dealId, shippingAddress.state, displayedPrice);
    if (quote.ok) {
      const sourceGate = await sourceSellableForDeal(quote.deal);
      if (!sourceGate.sellable) {
        return withCors(request, { success: false, code: "SOURCE_NOT_CERTIFIED",
          error: "This deal is unavailable." }, { status: 409 });
      }
      const decision = resolveRail(quote.deal, await getMonetizationSettings(), sourceGate.source);
      const resellerPermitted = decision.rail === "reseller" || decision.resellerSecondary;
      if (!resellerPermitted) {
        return withCors(request, { success: false, code: "AFFILIATE_ONLY",
          error: "This deal is purchased directly at the retailer. Use the Buy at store button.",
          redirectPath: `/api/go/${quote.deal.id}` }, { status: 409 });
      }
    }
    if (!quote.ok) {
      return withCors(request, { success: false, code: quote.code, error: quote.error }, { status: quote.code === "not_found" ? 404 : 409 });
    }

    // Source moved while they sat on the page → do not charge the old deal.
    if (quote.priceIncreased && (!acceptedPriceIncrease || body.acceptedTotal === undefined || toCents(String(body.acceptedTotal)) !== quote.amountCents)) {
      return withCors(request, {
        success: false,
        code: "PRICE_INCREASED",
        error: "The price changed before payment. Review and accept the new total to continue.",
        displayedPrice: quote.displayedPrice,
        livePrice: quote.livePrice,
        newTotal: quote.total,
        breakdown: publicQuote(quote),
      }, { status: 409 });
    }

    const { deal } = quote;
    const orderNumber = `MID-${randomBytes(5).toString("hex").toUpperCase()}`;
    const shipToHash = hashShipTo(shippingAddress);
    const addressId = body.addressId ? String(body.addressId) : `addr_${shipToHash.slice(0, 12)}`;

    const [pending] = await db.insert(orders).values({
      orderNumber,
      userId,
      userName: shippingAddress.fullName || body.userName || "Customer",
      userEmail,
      dealId: deal.id,
      productTitle: deal.title,
      productImage: deal.imageUrl,
      retailer: deal.retailer,
      ...orderQuoteFields(quote),
      originalMsrp: deal.originalPrice,
      paymentStatus: "pending",
      paymentMethod: "pending",
      paymentTransactionId: `pending_${orderNumber}`,
      dropshipStatus: "payment_received",
      shippingAddress: JSON.stringify(shippingAddress),
      invoiceNumber: `INV-${orderNumber.replace(/[^A-Z0-9]/gi, "")}`,
      // dispute-evidence metadata (mirrored into Stripe)
      paymentProvider: paymentProvider(),
      statementDescriptor: STATEMENT_DESCRIPTOR,
      customerRef: userId,
      lineSkus: `deal-${deal.id} x1`,
      fulfillmentModel: "partner_retailer",
      shipToHash,
      addressId,
    }).returning();

    return withCors(request, {
      success: true,
      orderId: pending.id,
      orderNumber: pending.orderNumber,
      totals: publicQuote(quote),
    });
  } catch (error) {
    console.error("order init failed", error);
    return withCors(request, { success: false, error: "Unable to start checkout" }, { status: 500 });
  }
}
