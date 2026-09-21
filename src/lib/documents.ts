import { readFile } from "fs/promises";
import path from "path";
import type { Policy } from "@/lib/policies";

export type DocOrder = {
  id: number;
  orderNumber: string;
  invoiceNumber?: string | null;
  productTitle: string;
  productImage: string;
  userName: string;
  userEmail: string;
  shippingAddress: string;
  originalMsrp: string;
  dealPrice: string;
  serviceFee: string;
  quotedSellPrice?: string | null;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  customerSavings: string;
  paymentMethod: string;
  paymentCardLast4?: string | null;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: Date | null;
  createdAt: Date;
  retailer: string;
  quantity?: number;
};

export type Address = {
  fullName?: string;
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
};

export function parseAddress(json: string): Address {
  try { return JSON.parse(json) as Address; } catch { return {}; }
}

export function makeInvoiceNumber(orderNumber: string) {
  return `INV-${orderNumber.replace(/[^A-Z0-9]/gi, "")}`;
}

const money = (v: string | number) => `$${Number(v || 0).toFixed(2)}`;
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

async function logoDataUri(): Promise<string> {
  try {
    const file = path.join(process.cwd(), "public", "images", "logo.png");
    const buf = await readFile(file);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

const page = (title: string, body: string) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:28px;background:#f4f4f5;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#0A0A0A}
  .sheet{max-width:800px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:32px}
  .brand{display:flex;align-items:center;gap:12px;border-bottom:3px solid #B91C1C;padding-bottom:14px;margin-bottom:20px}
  .brand img{width:52px;height:52px;border-radius:12px}
  .brand h1{margin:0;font-size:22px;letter-spacing:-.3px;color:#0A0A0A}
  .brand h1 span{color:#B91C1C}
  .brand p{margin:2px 0 0;font-size:11px;color:#71717a}
  h2{font-size:14px;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.6px;color:#B91C1C}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e4e4e7;vertical-align:top}
  th{background:#fafafa;color:#0A0A0A;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
  .box{border:1px solid #e4e4e7;border-radius:10px;padding:12px 14px;font-size:12px;background:#fafafa}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .alert{border:2px solid #B91C1C;background:#fef2f2;border-radius:10px;padding:14px;margin:16px 0}
  .alert h3{margin:0 0 8px;color:#B91C1C;font-size:13px;text-transform:uppercase;letter-spacing:.5px}
  ul{margin:8px 0 0 18px;padding:0;font-size:12px;line-height:1.65}
  .tot{text-align:right;font-size:16px;font-weight:800;color:#0A0A0A}
  .muted{color:#71717a;font-size:11px}
  .sig{margin-top:26px;border-top:1px dashed #d4d4d8;padding-top:14px;font-size:11px;color:#71717a}
  .stamp{display:inline-block;border:2px dashed #B91C1C;color:#B91C1C;font-weight:800;font-size:11px;padding:6px 12px;border-radius:8px;text-transform:uppercase;letter-spacing:.8px}
  @media print{body{background:#fff;padding:0}.sheet{border:0;border-radius:0;max-width:none}.noprint{display:none}}
  .noprint{text-align:center;margin-bottom:14px}
  .noprint button{background:#B91C1C;color:#fff;border:0;padding:10px 18px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer}
</style></head><body>
<div class="noprint"><button onclick="window.print()">Print / Save as PDF</button></div>
<div class="sheet">${body}</div></body></html>`;

function brandBlock(p: Policy, subtitle: string, logo: string) {
  return `<div class="brand">${logo ? `<img src="${logo}" alt="SeenLow">` : ""}
    <div><h1>Seen<span>Low</span></h1><p>${esc(subtitle)}</p>
    <p>Operated by SeenLow LLC · seenlow.com · ${esc(p.supportEmail || "support@seenlow.com")}</p></div></div>`;
}

function shipToBlock(addr: Address, order: DocOrder) {
  return `<div class="box"><strong>${esc(addr.fullName || order.userName)}</strong><br>
    ${esc(addr.street || "")}${addr.apt ? `<br>${esc(addr.apt)}` : ""}<br>
    ${esc(addr.city || "")}, ${esc(addr.state || "")} ${esc(addr.zipCode || "")}<br>
    ${esc(addr.country || "United States")}${addr.phone ? `<br>${esc(addr.phone)}` : ""}</div>`;
}

/**
 * Blind-shipping instruction sheet dispatched to fulfilling partner retailer.
 */
export async function blindShippingInstructions(order: DocOrder, p: Policy): Promise<string> {
  const logo = await logoDataUri();
  const addr = parseAddress(order.shippingAddress);
  const qty = order.quantity ?? 1;

  const body = `
    ${brandBlock(p, "BLIND SHIPPING INSTRUCTION SHEET — PARTNER FULFILLMENT", logo)}

    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div><span class="muted">Partner reference</span><br><strong style="font-size:15px">${esc(order.orderNumber)}</strong></div>
      <div><span class="muted">Issued</span><br><strong>${esc(order.createdAt.toDateString())}</strong></div>
      <div><span class="stamp">Blind ship required</span></div>
    </div>

    <div class="alert">
      <h3>Blind shipping required — do not include any of the following</h3>
      <ul>
        <li><strong>Please do not include invoices, pricing, promotional materials, or branded inserts.</strong></li>
        <li>No packing slip, invoice, receipt, or price list of any kind — yours or ours.</li>
        <li>No coupons, catalogues, flyers, sample products, gift-with-purchase cards, or upsell inserts.</li>
        <li>No branded tape, stickers, labels, or marketing material bearing your store name or logo.</li>
        <li>No marketing inserts asking the customer to review, subscribe, register, or buy from you directly.</li>
        <li>Do not contact the customer for marketing purposes. Order-related contact only, via us.</li>
      </ul>
    </div>

    <h2>What must be in the box</h2>
    <div class="box">
      <strong>ONE document only:</strong> the customer invoice supplied by SeenLow LLC
      (attached separately as <em>${esc(order.invoiceNumber || makeInvoiceNumber(order.orderNumber))}.pdf</em>).
      It carries our SeenLow logo, our name, and the price the customer actually paid.
      <div class="muted" style="margin-top:6px">If you cannot include our invoice, ship the box with <strong>no paperwork at all</strong>. Do not substitute your own.</div>
    </div>

    <h2>Ship-to (customer) address — US lower-48 only</h2>
    <div class="grid">
      ${shipToBlock(addr, order)}
      <div class="box">
        <strong>Item to ship</strong><br>
        ${esc(order.productTitle)}<br>
        <span class="muted">Quantity: ${qty}</span><br>
        <span class="muted">SKU / listing reference: ${esc(order.orderNumber)}</span>
      </div>
    </div>

    <h2>Labelling &amp; handling</h2>
    <ul>
      <li>Ship to the customer address above exactly as written. Do not add your own return address as the recipient.</li>
      <li>Return address on the label may be your facility; the <em>customer-facing</em> sender identity must not appear in paperwork inside the box.</li>
      <li>Use plain, unbranded outer packaging where possible. No store-branded boxes or bags.</li>
      <li>Provide the carrier name and tracking number back to SeenLow as soon as it is generated.</li>
      <li>Do not substitute an item, colour, size, or bundle without written approval from us.</li>
      <li>Do not include any statement that the customer bought from you. The customer bought from SeenLow LLC.</li>
    </ul>

    <h2>Who handles what</h2>
    <table>
      <tr><th>Responsibility</th><th>Owner</th></tr>
      <tr><td>Customer payment, pricing, taxes collected at checkout</td><td>SeenLow LLC</td></tr>
      <tr><td>Customer service, questions, delays, missing packages</td><td>SeenLow LLC (support@seenlow.com)</td></tr>
      <tr><td>Returns, refunds, replacements, change-of-mind requests</td><td>SeenLow LLC</td></tr>
      <tr><td>Pick, pack, physical shipment, carrier hand-off</td><td>Partner retailer</td></tr>
      <tr><td>Tracking number provision back to us</td><td>Partner retailer</td></tr>
    </table>

    <div class="alert" style="border-color:#B91C1C;background:#fef2f2">
      <h3 style="color:#B91C1C">Returns must not be accepted by you</h3>
      <ul>
        <li>Direct any return attempt back to SeenLow at ${esc(p.supportEmail || "support@seenlow.com")}.</li>
        <li>Do not issue refunds, credits, or exchanges directly to this customer.</li>
        <li>Do not add this customer to any mailing list, loyalty programme, or account.</li>
      </ul>
    </div>

    <div class="sig">
      This sheet is issued by <strong>SeenLow LLC</strong> (seenlow.com) as the merchant of record for order
      <strong>${esc(order.orderNumber)}</strong>. By fulfilling this order you confirm blind-shipping compliance as described above.
      <br>Contact: ${esc(p.supportEmail || "support@seenlow.com")} · partners@seenlow.com
      <br><br>
      <span class="muted">Partner acknowledgement — name: ______________________  date: ____________</span>
    </div>`;

  return page(`Blind Shipping Instructions — ${order.orderNumber}`, body);
}

/**
 * Customer-facing invoice with SeenLow logo, supplied to partner to place inside box.
 */
export async function customerInvoice(order: DocOrder, p: Policy): Promise<string> {
  const logo = await logoDataUri();
  const addr = parseAddress(order.shippingAddress);
  const qty = order.quantity ?? 1;
  const unit = order.quotedSellPrice != null ? Number(order.quotedSellPrice) : Number(order.dealPrice) + Number(order.serviceFee);
  const ship = Number(order.shippingFee || 0);
  const tax = Number(order.taxAmount || 0);

  const body = `
    ${brandBlock(p, "CUSTOMER INVOICE — PLACE INSIDE SHIPPED PACKAGE", logo)}

    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <span class="muted">Invoice number</span><br>
        <strong style="font-size:16px">${esc(order.invoiceNumber || makeInvoiceNumber(order.orderNumber))}</strong><br>
        <span class="muted">Order number: ${esc(order.orderNumber)}</span>
      </div>
      <div style="text-align:right">
        <span class="muted">Invoice date</span><br>
        <strong>${esc(order.createdAt.toDateString())}</strong><br>
        <span class="muted">Paid with ${esc(order.paymentMethod.replace(/_/g, " "))}${order.paymentCardLast4 ? ` ending ${esc(order.paymentCardLast4)}` : ""}</span>
      </div>
    </div>

    <div class="grid" style="margin-top:18px">
      <div><h2 style="margin-top:0">Billed to</h2>${shipToBlock({ ...addr, fullName: order.userName }, order)}
        <div class="muted" style="margin-top:6px">${esc(order.userEmail)}</div></div>
      <div><h2 style="margin-top:0">Ship to</h2>${shipToBlock(addr, order)}</div>
    </div>

    <h2>Items</h2>
    <table>
      <tr><th>Description</th><th style="width:60px">Qty</th><th style="width:100px;text-align:right">Unit price</th><th style="width:100px;text-align:right">Amount</th></tr>
      <tr>
        <td><strong>${esc(order.productTitle)}</strong><br><span class="muted">Sold by SeenLow LLC</span></td>
        <td>${qty}</td>
        <td style="text-align:right">${money(unit)}</td>
        <td style="text-align:right">${money(unit * qty)}</td>
      </tr>
      <tr><td colspan="3" style="text-align:right">Shipping</td><td style="text-align:right">${ship === 0 ? "FREE" : money(ship)}</td></tr>
      <tr><td colspan="3" style="text-align:right">Sales tax</td><td style="text-align:right">${money(tax)}</td></tr>
      <tr><td colspan="3" class="tot">Total paid</td><td class="tot">${money(order.totalAmount)}</td></tr>
    </table>

    <div class="box" style="margin-top:16px">
      <strong>You saved ${money(order.customerSavings)}</strong> on this order compared with the regular list price of ${money(order.originalMsrp)}.
      ${order.trackingNumber ? `<br><span class="muted">Tracking: ${esc(order.trackingCarrier || "Carrier")} ${esc(order.trackingNumber)}</span>` : ""}
      ${order.estimatedDelivery ? `<br><span class="muted">Estimated delivery: ${esc(order.estimatedDelivery.toDateString())} (estimate, not a guarantee)</span>` : ""}
    </div>

    <h2>Returns &amp; support</h2>
    <div class="box">
      <strong>This order was placed with SeenLow (SeenLow LLC at seenlow.com). We are the seller and the merchant you paid.</strong>
      A partner retailer may have fulfilled and shipped your order, and the name on the shipping label or box may not be ours.
      That does not change who you bought from.
      <ul>
        <li><strong>Returns and refunds go to SeenLow LLC only</strong> — not to any retailer named on the packaging.</li>
        <li>Do not open a return with that retailer unless we tell you to.</li>
        <li>Change of mind: ${p.changeOfMindDays} days from delivery, unused and in original condition. Return shipping is ${esc(p.returnShippingCost)}.</li>
        <li>Defective, damaged, or not as described: contact us first and we will arrange a refund or replacement at no return-postage cost to you.</li>
        <li>Restocking fee: ${esc(p.restockingFee)}. Refunds issued to the ${esc(p.refundMethod)}.</li>
        <li>If a partner ships the wrong item or cancels after you paid, SeenLow LLC still refunds you.</li>
        <li>Items in one order may arrive in separate packages.</li>
      </ul>
      <div style="margin-top:10px"><strong>Contact:</strong> ${esc(p.supportEmail || "support@seenlow.com")} — include your order number ${esc(order.orderNumber)}.</div>
    </div>

    <div class="sig">
      SeenLow LLC is the seller of record for this transaction. Governed by the laws of ${esc(p.governingState || "Delaware")},
      without limiting consumer protections that apply where you live.
      <br><span class="muted">Prices and availability subject to change without notice. This invoice reflects the amount charged at checkout.</span>
    </div>`;

  return page(`Invoice ${order.invoiceNumber || makeInvoiceNumber(order.orderNumber)} — ${order.orderNumber}`, body);
}
