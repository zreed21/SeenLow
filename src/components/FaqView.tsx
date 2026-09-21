"use client";

import React, { useEffect, useState } from "react";
import { FileText, ChevronDown, AlertTriangle, Mail } from "lucide-react";
import type { Policy } from "@/lib/policies";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <h2 className="text-base font-black text-white flex items-center gap-2">
        <span className="w-1.5 h-5 rounded-full bg-[#B91C1C]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0A0A0A] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="text-xs font-bold text-slate-100">{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#B91C1C] shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-[11.5px] leading-relaxed text-slate-300 space-y-2">{children}</div>}
    </div>
  );
}

export function FaqView() {
  const [p, setP] = useState<Policy | null>(null);

  useEffect(() => {
    fetch("/api/policies").then((r) => r.json()).then((d) => { if (d.success) setP(d.policies); }).catch(() => {});
  }, []);

  const store = p?.companyName || "SeenLow";
  const email = p?.supportEmail || "support@seenlow.com";
  const days = p?.changeOfMindDays ?? 30;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-red-950/60 text-red-300 border border-red-900/60">
            <FileText className="w-4 h-4 text-[#B91C1C]" />
          </span>
          <h2 className="text-xl font-black text-white">How {store} Works — FAQ &amp; Disclosures</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.
          Operated by SeenLow LLC at seenlow.com. Read this before you order.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 p-6 space-y-3">
        <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-emerald-400" /> How buying works on SeenLow (default)
        </h3>
        <p className="text-[11.5px] leading-relaxed text-slate-300">
          <strong className="text-white">{store} is a US deal-discovery app.</strong> For most deals, tapping
          &quot;Buy at [Store]&quot; sends you to that retailer, where you buy at <strong className="text-white">their price</strong> —
          the retailer handles payment, shipping, and returns. <strong className="text-emerald-300">We may earn a commission if you buy.</strong>{" "}
          Your price is never increased by our commission. If a tracked link breaks or a purchase does not credit, contact us at {email} and we will fix our side.
        </p>
        <p className="text-[11.5px] leading-relaxed text-slate-300">
          Sponsored cards in the feed are paid placements and always labeled. Our SeenLow pick is chosen by
          price history and source certification — it cannot be bought.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-red-900/60 bg-red-950/20 p-6 space-y-3">
        <h3 className="text-sm font-black text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#B91C1C]" /> Fulfillment disclosure — &quot;Have us buy it&quot; orders only
        </h3>
        <p className="text-[11px] text-red-300">
          Everything below applies only when you check out inside our app and SeenLow LLC charges your card. It does not apply to outbound retailer purchases.
        </p>
      </div>

      <Section title="Quick answers">
        <Q q={`How ${store} works — what is this site?`}>
          <p>SeenLow is operated by SeenLow LLC at seenlow.com. We find discounted products across US stores and list them in one place. We are not a warehouse retailer.</p>
          <p>When you choose our checkout, you are buying from <strong className="text-white">{store} (SeenLow LLC)</strong> — we are the merchant you pay — and a partner retailer often picks, packs, and ships the item to you.</p>
          <p>Our job is to monitor prices, list deals we believe are real at the time we publish them, take your order, place or assign fulfillment, send tracking when we have it, and handle problems and returns.</p>
        </Q>
        <Q q="Do you have a warehouse?">
          <p>No. We search public and partner listings, compare prices, and post deals. Inventory sits with other retailers or suppliers until an order is placed. That is why prices, stock, shipping speed, and packaging can look different from a traditional store that owns the shelf.</p>
        </Q>
        <Q q="Will my order come from another store?">
          <p>Often yes. A partner retailer may fulfill and ship directly to the address you give us. You should expect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>a sender name on the label that is not {store}</li>
            <li>packing materials, slips, or invoices from that retailer</li>
            <li>tracking that first updates when they hand the package to a carrier</li>
            <li>more than one box if you bought more than one item</li>
          </ul>
          <p>That is normal for this model. It does not mean you bought from that retailer. You bought from SeenLow LLC.</p>
        </Q>
        <Q q="Why does the box look like it came from a big-name store?">
          <p>Because that store physically shipped it. We do not rebrand their carton. Do not open a return or claim with the name on the box unless we ask you to. Support starts with us at {email}.</p>
        </Q>
        <Q q="Will the invoice in the box be yours?">
          <p>Not always. It may be the fulfilling retailer&apos;s. Your paid receipt from SeenLow LLC is the customer invoice that matches what you charged.</p>
          <p className="text-red-300">We instruct every partner to ship blind — no invoices, pricing, promotional material, or branded inserts — and we supply our own branded invoice for the box.</p>
        </Q>
        <Q q="Can I pick it up?">
          <p>No. There is no public warehouse.</p>
        </Q>
      </Section>

      <Section title="Prices and availability">
        <Q q="Why did the price change after I looked at it?">
          <p>Prices are not controlled by us. They come from other retailers and can move at any time. We monitor listings and try to keep our site close to what we last verified, but we do not set the partner&apos;s price and we cannot freeze it.</p>
          <p>A deal can change or disappear without notice: the source raises the price, runs out of stock, ends a promotion, or blocks the sale.</p>
          <p className="text-red-300">The price that matters is the price shown at checkout when you complete payment — not an old ad, screenshot, email, or cached page.</p>
        </Q>
        <Q q="Is a listed deal a guarantee?">
          <p>No. A listing is an invitation to order at the current displayed terms, not a promise that the same price or stock will exist later. We may cancel or refuse an order if the partner price or availability changes before we can fulfill it. If we cancel for that reason, we refund you. We do not owe the &quot;old&quot; deal price.</p>
        </Q>
        <Q q='What does "monitored" mean?'>
          <p>We check sources on a schedule and when we refresh a listing. Monitoring is not live inventory from our own warehouse. There can be a lag between a partner changing price or stock and our page updating. During that lag, checkout may fail, the item may ship later than the estimate, or we may contact you with a new price or a refund.</p>
        </Q>
        <Q q="Can I force a price match to another site?">
          <p>Not unless a listing or promotion on our site says we will. We are not obligated to match a partner&apos;s public price after you order, or to honor a price we no longer display.</p>
        </Q>
        <Q q="What about taxes and extra fees?">
          <p>Sales tax, shipping, and any listed fees are calculated at checkout when possible. If a partner or destination requires extra charges we could not display up front (uncommon, but possible on some items or addresses), we will tell you before we proceed, or we will cancel and refund.</p>
        </Q>
      </Section>

      <Section title="Shipping and delivery (US only)">
        <Q q='Who "handles shipping"?'>
          <p><strong className="text-white">Physical shipment:</strong> usually the partner retailer and the carrier.</p>
          <p><strong className="text-white">Your order:</strong> we submit it, pass the address, collect tracking when the partner provides it, and chase delays.</p>
          <p>We do not promise that the label will say {store} or that the package leaves a building we operate.</p>
        </Q>
        <Q q="How long does shipping take?">
          <p>US lower-48 street addresses only — we do not ship to Alaska, Hawaii, PO boxes, Canada, Mexico, or worldwide. All prices are in USD and assume lower-48 US shipping.</p>
          <p>Estimates on a listing are typical ranges, not guarantees. They start from when the partner ships, not always from the minute you pay. Partner stock, address checks, weekends, weather, and carriers all affect timing.</p>
          <p>If we cannot get a partner to ship within a reasonable time after you pay, we will update you. You can ask us to cancel for a refund if it has not shipped and the delay is on us or the partner.</p>
        </Q>
        <Q q="What if items arrive separately?">
          <p>That is expected. One checkout can become several packages from several partners.</p>
        </Q>
        <Q q="What if tracking shows a name I don't recognize?">
          <p>That is consistent with partner fulfillment. Compare the tracking number we sent you. If the number does not match, contact us before refusing the package.</p>
        </Q>
        <Q q="What if my address is wrong or incomplete?">
          <p>You are responsible for the address at checkout. We can try to change it only if the partner has not shipped. After scan-out, carrier rules apply and we may not be able to redirect.</p>
        </Q>
      </Section>

      <Section title="Returns, problems, and who is responsible">
        <Q q="Who do I contact if something is wrong?">
          <p><strong className="text-white">{store} (SeenLow LLC).</strong> We handle returns, missing packages, damage, wrong items, and &quot;not as described&quot; claims. The partner on the box is not your customer-service desk.</p>
          <p>Email <a className="text-red-400 font-bold hover:underline" href={`mailto:${email}`}>{email}</a> and include your order number, photos if relevant, and the tracking number.</p>
        </Q>
        <Q q="What is your return policy?">
          <p><strong className="text-white">Changed your mind:</strong> {days} days from delivery, item unused and in original condition, all included accessories and packaging reasonably intact. Return shipping is {p?.returnShippingCost || "the customer's cost"}. Refund after we confirm receipt (or after we authorize the partner return, if we use that path).</p>
          <p><strong className="text-white">Defective, damaged in transit, missing parts, or not as described:</strong> contact us first. We will refund or replace. You should not be stuck paying return postage for a problem caused by us, the partner, or the carrier.</p>
          <p><strong className="text-white">Restocking:</strong> {p?.restockingFee || "None"}.</p>
          <p><strong className="text-white">Refund method:</strong> {p?.refundMethod || "original payment method"}. Processing time depends on your bank or app after we issue it.</p>
          <p>We may give you a return address that is ours, a processing partner, or (only if we say so) the original fulfilling retailer. Follow the instructions in our email, not the slip in the box.</p>
        </Q>
        <Q q="What if the partner cancels or is out of stock after I paid?">
          <p className="text-red-300">We refund the affected items. We do not owe you the product at the old deal price if the source can no longer sell it.</p>
        </Q>
        <Q q="What if the package never arrives?">
          <p>Tell us when tracking has stalled past the estimated window. We will file a carrier/partner inquiry. If it is confirmed lost or undeliverable through no fault of yours, we refund or reship at our choice.</p>
        </Q>
        <Q q="What about chargebacks?">
          <p>If you have a problem, contact us first at {email} so we can fix it. A chargeback for &quot;I didn&apos;t recognize the name on the box&quot; is not valid when we disclosed partner fulfillment. Fraud and non-delivery claims are different; we still investigate those.</p>
        </Q>
      </Section>

      <Section title="Service clauses (plain language)">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <h4 className="text-xs font-black text-emerald-300 mb-2">What we do</h4>
            <ul className="list-disc pl-4 text-[11.5px] text-slate-300 space-y-1">
              <li>List deals we have monitored and believe are available at publish/refresh time</li>
              <li>Take payment as the seller of record on SeenLow checkouts</li>
              <li>Attempt fulfillment through partner retailers</li>
              <li>Share tracking when we receive it</li>
              <li>Handle support, returns, and refunds under this FAQ and our full Terms</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-4">
            <h4 className="text-xs font-black text-red-300 mb-2">What we do not do</h4>
            <ul className="list-disc pl-4 text-[11.5px] text-slate-300 space-y-1">
              <li>Hold a general warehouse of listed goods</li>
              <li>Control partner prices, stock, packing slips, or warehouses</li>
              <li>Guarantee a ship date or a specific sender name on the label</li>
              <li>Guarantee a deal will exist tomorrow</li>
              <li>Act as the other retailer or as their authorized marketplace</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2 text-[11.5px] text-slate-300 leading-relaxed pt-2">
          <p><strong className="text-white">Title and risk.</strong> {p?.titleTransfer || "You own the item when it is delivered to the address you provided (or when you or your recipient accept it from the carrier)."} Risk of loss in transit follows the carrier&apos;s rules and our returns policy for lost or damaged parcels.</p>
          <p><strong className="text-white">Limitation of responsibility.</strong> To the extent allowed by law, SeenLow LLC is not liable for partner stockouts, partner packing mistakes we then make right under this policy, carrier delays outside our control, or indirect losses (lost time, missed events, business profits).</p>
          <p><strong className="text-white">Law.</strong> These practices are governed by the laws of {p?.governingState || "Delaware"}, without limiting any consumer protections that apply where you live.</p>
        </div>
      </Section>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center space-y-2">
        <Mail className="w-5 h-5 text-[#B91C1C] mx-auto" />
        <p className="text-xs text-slate-300">
          Questions about an order? Email <a className="text-red-400 font-bold hover:underline" href={`mailto:${email}`}>{email}</a> (also hello@seenlow.com, partners@seenlow.com).
        </p>
        <p className="text-[10px] text-slate-500">import { SiteFooter } from "@/components/SiteFooter";
                <SiteFooter />
        </p>
      </div>
    </div>
  );
}
