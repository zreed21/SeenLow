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
          <h2 className="text-xl font-black text-white">How {store} Works — FAQ & Disclosures</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.
          Operated by Zach Reed doing business as SeenLow at seenlow.com. Read this before you order.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center space-y-2">
        <Mail className="w-5 h-5 text-[#B91C1C] mx-auto" />
        <p className="text-xs text-slate-300">
          Questions about an order? Email <a className="text-red-400 font-bold hover:underline" href={`mailto:${email}`}>{email}</a>.
        </p>
        <p className="text-[10px] text-slate-500">Operated by Zach Reed doing business as SeenLow at seenlow.com</p>
      </div>
    </div>
  );
}
