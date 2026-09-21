"use client";

import React, { useEffect, useState } from "react";
import { Crown, ExternalLink, Megaphone, ShieldCheck } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

/**
 * Home-screen BEST DEAL module:
 * Labeled: "SeenLow pick — lowest we’ve tracked in 30 days"
 * Rules:
 *  - One organic winner, scored by drop vs 30-day history x source trust
 *  - Sponsored neighbor sits beside it, clearly labeled, never inside it
 *  - If nothing clears the threshold, we show "No standout deal right now"
 */
export function BestDealModule({ onOpenDeal }: { onOpenDeal: (dealId: number) => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/best-deal")
        .then((r) => r.json())
        .then((d) => {
          if (alive && d.success) setData(d);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (!data) return null;
  const best = data.bestDeal;

  return (
    <div className={`grid gap-3 ${data.sponsored ? "lg:grid-cols-3" : ""}`}>
      <div
        className={`rounded-3xl border border-red-900/60 bg-gradient-to-br from-[#0A0A0A] via-red-950/20 to-[#0A0A0A] p-5 shadow-2xl ${
          data.sponsored ? "lg:col-span-2" : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B91C1C] text-white text-xs font-black uppercase tracking-wide shadow-md">
            <Crown className="w-3.5 h-3.5" /> SeenLow pick — lowest we&apos;ve tracked in 30 days
          </span>
          {best?.hasWinner && (
            <span className="text-[10px] text-slate-500">Recalculated hourly & on open</span>
          )}
        </div>

        {best?.hasWinner ? (
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <img
              src={best.imageUrl}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover border border-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-black text-white leading-snug">{best.title}</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-red-500">{formatCurrency(best.priceNow)}</span>
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(best.thirtyDayHigh)} 30-day high
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {best.whyItWon}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {best.rail === "affiliate" ? (
                  <a
                    href={best.redirectPath}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="py-2 px-4 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-950/40"
                  >
                    {best.ctaLabel} · {formatCurrency(best.priceNow)} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => onOpenDeal(best.dealId)}
                    className="py-2 px-4 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-black shadow-md shadow-red-950/40"
                  >
                    Order Now · {formatCurrency(best.priceNow)}
                  </button>
                )}
                <button
                  onClick={() => onOpenDeal(best.dealId)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Details
                </button>
                <span className="text-[10px] text-slate-500">
                  Last checked {formatRelativeTime(best.lastChecked)}
                </span>
              </div>
              {best.commissionDisclosure && (
                <p className="text-[10px] text-slate-500">{best.commissionDisclosure}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-3">
            No standout deal right now — the catalog below is verified hourly for live price drops.
          </p>
        )}
      </div>

      {data.sponsored && (
        <a
          href={data.sponsored.destinationUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-5 flex flex-col justify-between hover:border-slate-500 transition"
        >
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wide">
              <Megaphone className="w-3 h-3" /> Sponsored
            </span>
            {data.sponsored.imageUrl && (
              <img
                src={data.sponsored.imageUrl}
                alt=""
                className="w-full h-20 object-cover rounded-xl mt-3 border border-slate-800"
              />
            )}
            <h4 className="font-bold text-white text-sm mt-3">{data.sponsored.headline}</h4>
            <p className="text-[11px] text-slate-400 mt-1">{data.sponsored.brandName}</p>
          </div>
          <span className="text-[10px] text-slate-500 mt-3">
            Paid placement — clearly labeled, never our SeenLow pick.
          </span>
        </a>
      )}
    </div>
  );
}
