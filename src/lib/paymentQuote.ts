import type { orders } from "@/db/schema";
import type { ReadyQuote } from "./quote";
import { publicQuote } from "./quote";
import { toCents } from "./pricing";

/** Prevent stale cents or changed Stripe idempotency parameters being reused. */
export function paymentQuoteConflict(order: typeof orders.$inferSelect, quote: ReadyQuote, acceptedTotal?: unknown) {
  const hasPayment = Boolean(order.stripePaymentIntentId || order.stripeCheckoutSessionId);
  const sameTotal = toCents(order.totalAmount) === quote.amountCents;
  const sameItem = toCents(order.quotedSellPrice ?? 0) === toCents(quote.itemPrice);
  const sameSource = toCents(order.sourceLastSeenPrice ?? order.dealPrice) === toCents(quote.deal.dealPrice);
  const extraFields = {
    displayedPrice: quote.displayedPrice,
    livePrice: quote.livePrice,
    newTotal: quote.total,
    breakdown: publicQuote(quote),
  };
  if (hasPayment && (!sameTotal || !sameItem || !sameSource)) {
    return { success: false, code: "CHECKOUT_CHANGED", restartRequired: true,
      error: "This checkout quote changed. Review the updated total and start a new payment attempt.", ...extraFields };
  }
  if ((!sameTotal || quote.priceIncreased) &&
      (acceptedTotal === undefined || toCents(String(acceptedTotal), "Accepted total") !== quote.amountCents)) {
    return { success: false, code: "PRICE_INCREASED", error: "Review and approve the current total before payment.", ...extraFields };
  }
  return null;
}
