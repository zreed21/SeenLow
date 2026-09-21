"use client";

import React, { useState } from "react";
import { AlertTriangle, ChevronDown, Package, Truck, Undo2, FileText, Mail } from "lucide-react";
import type { Policy } from "@/lib/policies";

/**
 * Plain-language partner-fulfillment disclosure for SeenLow / SeenLow LLC.
 * Rendered above the Pay button (required) and on the FAQ page.
 */
export function FulfillmentDisclosure({ p, compact = false }: { p: Policy | null; compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const store = p?.companyName || "SeenLow";
  const email = p?.supportEmail || "support@seenlow.com";
  const days = p?.changeOfMindDays ?? 30;

  return (
    <div className="rounded-2xl border border-red-900/60 bg-red-950/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-black text-red-200">
          <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
          IMPORTANT: How your order is fulfilled — please read before paying
        </span>
        <ChevronDown className={`w-4 h-4 text-red-300 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 text-[11.5px] leading-relaxed text-slate-300 border-t border-red-900/30 pt-3">
          <section className="space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#B91C1C]" /> Fulfillment disclosure
            </h4>
            <p>
              <strong className="text-white">{store}</strong> (operated by SeenLow LLC at seenlow.com) is a deal site. We sell products at the prices listed and are the merchant you pay. We do not stock every item ourselves. A partner retailer may fulfill your order and ship it directly to you.
            </p>
            <p>
              The package, shipping label, and any packing slip or invoice in the box may show that retailer&apos;s name. That does not change who you bought from. We provide tracking when we have it, and we handle questions, delays, missing packages, and refunds under our Shipping and Returns policies.
            </p>
            <p>
              Estimated delivery is based on typical partner and carrier times. Items in the same order may arrive separately. Return requests go to <strong className="text-white">{store}</strong>, not to the retailer named on the package. Do not open a return with that retailer unless we tell you to.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Undo2 className="w-3.5 h-3.5 text-[#B91C1C]" /> Returns
            </h4>
            <p>
              <strong className="text-slate-100">Change of mind:</strong> {days} days from delivery, unused and in original condition. Return shipping is {p?.returnShippingCost || "the customer's cost"}.
            </p>
            <p>
              <strong className="text-slate-100">Defective, damaged, or not as described:</strong> contact us first. We will arrange a refund or replacement. You should not be out return postage for a problem we or the partner caused.
            </p>
            <p>
              <strong className="text-slate-100">Restocking:</strong> {p?.restockingFee || "None"}.
            </p>
            <p>
              <strong className="text-slate-100">Refunds:</strong> issued to the {p?.refundMethod || "original payment method"} after we receive the item or confirm it was never shipped.
            </p>
            <p className="text-red-300">
              If a partner ships the wrong item or cancels after you paid, <strong className="text-white">{store} still refunds you.</strong>
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#B91C1C]" /> What to expect in the box
            </h4>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>A sender name on the label that is not {store}</li>
              <li>Packing materials, slips, or invoices from that retailer</li>
              <li>Tracking that first updates when they hand the package to a carrier</li>
              <li>More than one box if you bought more than one item</li>
            </ul>
            <p>That is normal for this model. It does not mean you bought from that retailer. You bought from us.</p>
          </section>

          <div className="pt-2 border-t border-red-900/30 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#B91C1C]" />
              <a href={`mailto:${email}`} className="hover:text-red-300">
                {email}
              </a>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#B91C1C]" /> See our full FAQ &amp; Terms for details
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
