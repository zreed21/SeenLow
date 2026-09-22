"use client";

import React, { useState } from "react";
import {
  Flame,
  ShieldCheck,
  Zap,
  Heart,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Layers,
  Clock,
  Eye
} from "lucide-react";
import { Deal } from "@/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
  onSelectDeal: (deal: Deal) => void;
  onQuickBuy: (deal: Deal) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (dealId: number) => void;
}

export function DealCard({
  deal,
  onSelectDeal,
  onQuickBuy,
  isWatchlisted,
  onToggleWatchlist,
}: DealCardProps) {
  const [imgError, setImgError] = useState(false);

  const origPrice = Number(deal.originalPrice);
  const finalPrice = Number(deal.finalPrice);
  const discountPct = Number(deal.discountPercent);
  const totalSavings = origPrice - finalPrice;

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
      
      {/* Top Banner & Badges */}
      <div className="relative">
        {/* Rank & Discount Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-extrabold text-xs tracking-tight shadow-lg flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>#{deal.dealRank} • {discountPct.toFixed(0)}% OFF</span>
          </span>

          {deal.isHot && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/90 text-white font-bold text-[10px] tracking-wider uppercase shadow">
              HOT
            </span>
          )}
        </div>

        {/* Watchlist Quick Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(deal.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition ${
            isWatchlisted
              ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
          }`}
          title={isWatchlisted ? "Saved in Watchlist" : "Save to Watchlist"}
        >
          <Heart className={`w-4 h-4 ${isWatchlisted ? "fill-white" : ""}`} />
        </button>

        {/* Product Image */}
        <div
          onClick={() => onSelectDeal(deal)}
          className="w-full h-52 bg-slate-950 overflow-hidden cursor-pointer relative flex items-center justify-center"
        >
          <img
            src={imgError ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" : deal.imageUrl}
            alt={deal.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-2.5 left-3">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 backdrop-blur-sm">
              {deal.category}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content & Detailed Pricing */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Title & Brand */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {deal.brand}
          </div>
          <h3
            onClick={() => onSelectDeal(deal)}
            className="font-bold text-white text-sm line-clamp-2 hover:text-amber-400 cursor-pointer transition leading-snug"
          >
            {deal.title}
          </h3>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-xs text-slate-400">Regular price</div>
            <div className="text-xs line-through text-slate-500 font-medium">{formatCurrency(origPrice)}</div>
          </div>
          <div className="flex items-end justify-between border-t border-slate-800 pt-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Today&apos;s price</span>
              <span className="text-xl font-black text-amber-400 tracking-tight">{formatCurrency(finalPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-400 block leading-none">You save</span>
              <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(totalSavings)}</span>
            </div>
          </div>
        </div>

        {/* Verification Status & Opportunity Heat Score */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active & In Stock ({deal.stockQuantity} left)</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{deal.opportunityScore}/100 Score</span>
          </div>
        </div>

        {/* Action Buttons — rail-aware. Affiliate = outbound redirect at THEIR price. */}
        {deal.ctaType === "affiliate" ? (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectDeal(deal)}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details & Specs</span>
              </button>
              <a
                href={deal.redirectPath || `/api/go/${deal.id}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy at {deal.retailerName} · {formatCurrency(finalPrice)}</span>
              </a>
            </div>
            {deal.resellerSecondary && deal.resellerPrice && (
              <button
                onClick={() => onQuickBuy(deal)}
                className="w-full py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] font-medium transition"
              >
                Have us buy it · {formatCurrency(Number(deal.resellerPrice))}
              </button>
            )}
            <p className="text-[10px] text-slate-500 text-center">We may earn a commission if you buy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => onSelectDeal(deal)}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details & Specs</span>
            </button>
            <button
              onClick={() => onQuickBuy(deal)}
              className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Now</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
