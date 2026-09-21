/** Read an invoice from its saved order snapshot, never from today's catalog. */
export interface OrderAmountSnapshot {
  dealPrice: string;
  serviceFee: string;
  quotedSellPrice?: string | null;
  requiredProductFee?: string | null;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  paidAmountFrozen?: string | null;
}

export function orderAmounts(order: OrderAmountSnapshot) {
  const cents = (value: string | number) => Math.round(Number(value) * 100);
  const item = order.quotedSellPrice != null ? cents(order.quotedSellPrice) : cents(order.dealPrice) + cents(order.serviceFee);
  const shipping = cents(order.shippingFee);
  const tax = cents(order.taxAmount);
  const total = cents(order.paidAmountFrozen ?? order.totalAmount);
  // Older orders stored required fees in the internal adjustment. Preserve
  // their original receipt without rewriting a completed transaction.
  const fee = order.quotedSellPrice != null
    ? Math.max(0, total - item - shipping - tax)
    : cents(order.requiredProductFee ?? "0");
  return { itemPrice: item / 100, shipping: shipping / 100, tax: tax / 100, requiredProductFee: fee / 100, total: total / 100 };
}
