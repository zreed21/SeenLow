"use client";

import React, { useEffect, useState } from "react";
import { TrendingDown } from "lucide-react";

/** SeenLow Top-of-App Banner */
export function BestDealBanner({ bestDiscount, bestTitle }: { bestDiscount: string; bestTitle?: string }) {
  const pct = Number(bestDiscount) || 0;
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] border-b border-red-950/60 text-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2.5 text-center">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#B91C1C] text-white shrink-0">
          <TrendingDown className={`w-3.5 h-3.5 transition-transform ${pulse ? "scale-125" : "scale-100"}`} />
        </span>
        <p className="text-[11px] sm:text-xs font-semibold tracking-tight">
          <span className="font-extrabold text-[#EF4444] uppercase tracking-wider">Lowest we&apos;ve seen:</span>{" "}
          <span className="font-black text-white">{pct.toFixed(0)}% off live</span>
          {bestTitle && <span className="hidden md:inline text-slate-400">&nbsp;— {bestTitle}</span>}
          <span className="hidden sm:inline text-slate-500 text-[10px]">&nbsp;· Checked again before you tap.</span>
        </p>
      </div>
    </div>
  );
}
