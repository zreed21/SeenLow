"use client";

import React from "react";
import {
  Flame,
  ShieldCheck,
  Zap,
  Heart,
  ShoppingBag,
  ExternalLink,
  Eye,
  Sparkles
} from "lucide-react";
import { Deal } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface DealTableListViewProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onQuickBuy: (deal: Deal) => void;
  watchlistSet: Set<number>;
  onToggleWatchlist: (dealId: number) => void;
}

export function DealTableListView({
  deals,
  onSelectDeal,
  onQuickBuy,
  watchlistSet,
  onToggleWatchlist,
}: DealTableListViewProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
          <thead>
            <tr className="text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/70">
              <th className="py-3.5 px-4">Rank</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Regular Price</th>
              <th className="py-3.5 px-4">Today&apos;s Price</th>
              <th className="py-3.5 px-4">Discount %</th>
              <th className="py-3.5 px-4">Audit Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {deals.map((deal) => {
              const origPrice = Number(deal.originalPrice);
              const finalPrice = Number(deal.finalPrice);
              const discountPct = Number(deal.discountPercent);
              const isSaved = watchlistSet.has(deal.id);

              return (
                <tr key={deal.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 font-black text-amber-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      #{deal.dealRank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={deal.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0 cursor-pointer"
                        onClick={() => onSelectDeal(deal)}
                      />
                      <div className="min-w-0 max-w-xs">
                        <span className="text-[10px] font-bold text-amber-400 uppercase block">{deal.brand}</span>
                        <h4
                          onClick={() => onSelectDeal(deal)}
                          className="font-bold text-white truncate hover:text-amber-400 cursor-pointer text-xs"
                        >
                          {deal.title}
                        </h4>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium">
                      {deal.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 line-through text-slate-500">{formatCurrency(origPrice)}</td>
                  <td className="py-3 px-4 font-black text-amber-400 text-sm">{formatCurrency(finalPrice)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30">
                      {discountPct.toFixed(0)}% OFF
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      In Stock ({deal.stockQuantity})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleWatchlist(deal.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isSaved ? "bg-rose-500 text-white border-rose-500" : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                        title="Save to watchlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
                      </button>
                      <button
                        onClick={() => onSelectDeal(deal)}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Details
                      </button>
                      {(deal as any).ctaType === "affiliate" ? (
                        <a
                          href={(deal as any).redirectPath || `/api/go/${deal.id}`}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          title="We may earn a commission if you buy."
                          className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy at {(deal as any).retailerName}</span>
                        </a>
                      ) : (
                        <button
                        onClick={() => onQuickBuy(deal)}
                        className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Buy</span>
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
