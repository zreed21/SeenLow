"use client";

import React, { useState } from "react";
import {
  X,
  Flame,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Heart,
  ExternalLink,
  CheckCircle,
  Truck,
  Sparkles,
  Layers,
  Clock,
  DollarSign
} from "lucide-react";
import { Deal } from "@/types";
import { formatCurrency, parseJsonSafe } from "@/lib/utils";
import { SupportNotice } from "@/components/SupportNotice";

interface DealDetailModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (deal: Deal) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (dealId: number) => void;
}

export function DealDetailModal({
  deal,
  isOpen,
  onClose,
  onBuyNow,
  isWatchlisted,
  onToggleWatchlist,
}: DealDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !deal) return null;

  const features: string[] = parseJsonSafe(deal.features, []);
  const specs: Record<string, string> = parseJsonSafe(deal.specs, {});
  const additionalImages: string[] = parseJsonSafe(deal.additionalImages, []);
  const allImages = [deal.imageUrl, ...additionalImages];

  const origPrice = Number(deal.originalPrice);
  const finalPrice = Number(deal.finalPrice);
  const discountPct = Number(deal.discountPercent);
  const savings = origPrice - finalPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black text-xs tracking-tight flex items-center gap-1 shadow">
              <Flame className="w-4 h-4 fill-slate-950" />
              RANK #{deal.dealRank} • {discountPct.toFixed(0)}% OFF MSRP
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
              {deal.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(deal.id)}
              className={`p-2 rounded-xl transition ${
                isWatchlisted
                  ? "bg-rose-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
              title="Save to Watchlist"
            >
              <Heart className={`w-4 h-4 ${isWatchlisted ? "fill-white" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Images */}
            <div className="space-y-3">
              <div className="w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                <img
                  src={allImages[activeImageIndex] || deal.imageUrl}
                  alt={deal.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-semibold text-emerald-400 backdrop-blur-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Active Stock
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        activeImageIndex === idx ? "border-amber-400" : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Price & Availability Confirmed
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  This deal is active and ready to order. {deal.stockQuantity} units currently available.
                </p>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Last checked: {new Date(deal.lastVerifiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>

            {/* Right: Deal Details & Transparent Pricing */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{deal.brand}</span>
                <h2 className="text-xl font-bold text-white mt-0.5 leading-snug">{deal.title}</h2>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-100">
                Prices and availability may change without notice. We checked this item when you opened it and will check again before payment. Any increase requires your approval before purchase.
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Regular price</span>
                  <span className="line-through text-slate-500 font-medium">{formatCurrency(origPrice)}</span>
                </div>
                <div className="flex items-end justify-between border-t border-slate-800 pt-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Today&apos;s price</span>
                    <span className="text-3xl font-black text-amber-400">{formatCurrency(finalPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 block">You save</span>
                    <span className="text-base font-extrabold text-emerald-400">{formatCurrency(savings)} ({discountPct.toFixed(0)}% off)</span>
                  </div>
                </div>
              </div>

              {deal.ctaType === "affiliate" ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <ExternalLink className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-[11px] text-slate-300">
                    <strong className="text-white">Retailer checkout:</strong> You&apos;ll complete purchase on{" "}
                    {deal.retailerName || "the retailer"}&apos;s site. They handle payment, shipping, tracking, and returns.
                    {deal.commissionDisclosure ? ` ${deal.commissionDisclosure}` : " We may earn a commission if you buy."}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <Truck className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-[11px] text-slate-300">
                    <strong className="text-white">Tracked delivery:</strong> After you pay SeenLow, carrier tracking updates are available from order confirmation through delivery. A partner retailer may fulfill the shipment.
                  </div>
                </div>
              )}
              <SupportNotice compact />

              {deal.ctaType === "affiliate" ? (
                <div className="space-y-2">
                  <a
                    href={deal.redirectPath || `/api/go/${deal.id}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Buy at {deal.retailerName} • {formatCurrency(finalPrice)}</span>
                  </a>
                  {deal.resellerSecondary && deal.resellerPrice && (
                    <button
                      onClick={() => { onClose(); onBuyNow(deal); }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                    >
                      Have us buy it • {formatCurrency(Number(deal.resellerPrice))}
                    </button>
                  )}
                  <p className="text-[10px] text-slate-500 text-center">
                    We may earn a commission if you buy. You&apos;ll purchase directly from {deal.retailerName}, who handles payment, shipping, and returns.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onBuyNow(deal);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order Now • {formatCurrency(finalPrice)}</span>
                </button>
              )}

            </div>

          </div>

          {/* Description & Specs Section */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Description & Features */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Item Overview & Highlights
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{deal.description}</p>

              {features.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Features</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                Technical Specifications
              </h4>

              <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2.5">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
