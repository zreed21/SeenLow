"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { Policy } from "@/lib/policies";

/**
 * Must-accept acknowledgment rendered directly above the Pay button.
 * The Pay button stays disabled until `accepted` is true.
 */
export function OrderAcknowledgment({
  accepted,
  onAccept,
  policies,
}: {
  accepted: boolean;
  onAccept: (v: boolean) => void;
  policies: Policy | null;
}) {
  const store = policies?.companyName || "SeenLow";

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0A0A0A] p-4 space-y-3">
      <div className="text-xs font-black text-white">By placing this order you understand:</div>
      <ul className="space-y-1.5 text-[11.5px] text-slate-300 leading-relaxed">
        {[
          `${store} (SeenLow LLC) is the seller you are buying from.`,
          "A partner retailer may fulfill the order and ship it directly to you.",
          "The shipping label, packing slip, or invoice in the box may show that retailer's name instead of ours.",
          "Estimated delivery is not a guarantee; partner stock and carrier times can change.",
          `Problems, cancellations, and refunds are handled by ${store} under our Returns Policy, not by the partner retailer.`,
        ].map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#B91C1C] shrink-0" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <label className="flex items-start gap-2.5 pt-2 border-t border-neutral-800 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAccept(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-red-600 shrink-0"
        />
        <span className="text-[11px] text-slate-300">
          I have read the fulfillment disclosure above and accept it.
        </span>
      </label>
    </div>
  );
}

export function AcknowledgedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
      <CheckCircle2 className="w-3.5 h-3.5" /> Fulfillment disclosure accepted
    </span>
  );
}
