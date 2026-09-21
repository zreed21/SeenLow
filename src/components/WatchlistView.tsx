"use client";

import React from "react";
import {
  Heart,
  Flame,
  ShoppingBag,
  ExternalLink,
  Trash2,
  Bell,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { WatchlistItem, Deal } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface WatchlistViewProps {
  watchlistItems: WatchlistItem[];
  onRemoveFromWatchlist: (dealId: number) => void;
  onSelectDeal: (deal: Deal) => void;
  onQuickBuy: (deal: Deal) => void;
  onBrowseDeals: () => void;
}

export function WatchlistView({
  watchlistItems,
  onRemoveFromWatchlist,
  onSelectDeal,
  onQuickBuy,
  onBrowseDeals,
}: WatchlistViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
            </span>
            <h2 className="text-xl font-black text-white">Saved Watchlist & Price Alerts</h2>
          </div>
          <p className="text-xs text-slate-400">
            Keep tabs on specific products. When midnight spiders find new price drops, you'll be the first to know.
          </p>
        </div>

        <button
          onClick={onBrowseDeals}
          className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold self-start sm:self-center"
        >
          Explore Top 50 Deals
        </button>
      </div>

      {watchlistItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <Heart className="w-12 h-12 mx-auto text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Click the heart icon on any deal in the Top 50 feed to save it and receive automated discount drops.
            </p>
          </div>
          <button
            onClick={onBrowseDeals}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs"
          >
            Discover Deals Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlistItems.map(({ watchlistId, deal }) => {
            const origPrice = Number(deal.originalPrice);
            const finalPrice = Number(deal.finalPrice);
            const savings = origPrice - finalPrice;
            const discountPct = Number(deal.discountPercent);

            return (
              <div
                key={watchlistId}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 shadow-xl transition space-y-3 flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0 cursor-pointer"
                    onClick={() => onSelectDeal(deal)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
                        {discountPct.toFixed(0)}% OFF
                      </span>
                      <button
                        onClick={() => onRemoveFromWatchlist(deal.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4
                      onClick={() => onSelectDeal(deal)}
                      className="text-xs font-bold text-white line-clamp-2 mt-1 hover:text-amber-400 cursor-pointer"
                    >
                      {deal.title}
                    </h4>
                    <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified available</div>
                  </div>
                </div>

                {/* Price Breakdown in Watchlist */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">All-In Price:</span>
                    <span className="text-base font-black text-amber-400">{formatCurrency(finalPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 block">Savings:</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(savings)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectDeal(deal)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onQuickBuy(deal)}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
