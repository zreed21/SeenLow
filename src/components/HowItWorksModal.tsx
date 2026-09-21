"use client";

import React from "react";
import {
  X,
  Clock,
  Sparkles,
  Truck,
  Zap,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { SeenLowLogo } from "@/components/SeenLowLogo";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <SeenLowLogo variant="lockup" size="md" />
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-400 hover:text-white border border-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-white">How SeenLow Works</h3>
          <p className="text-xs text-red-300 font-semibold mt-0.5">
            Lowest we&apos;ve seen. Checked again before you tap.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.
            Operated by SeenLow LLC at seenlow.com.
          </p>
        </div>

        {/* 4 Step Process Cards */}
        <div className="space-y-4 text-xs">
          <div className="flex gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-neutral-800">
            <div className="w-8 h-8 rounded-xl bg-[#B91C1C] text-white font-black flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B91C1C]" />
                Midnight Price Monitoring
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Every night at midnight, our crawler scans thousands of active US store offers across electronics, home, gaming, fitness, travel, and more.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-neutral-800">
            <div className="w-8 h-8 rounded-xl bg-[#B91C1C] text-white font-black flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#B91C1C]" />
                Top 50 Lowest Prices Ranked
              </h4>
              <p className="text-slate-300 leading-relaxed">
                We rank the top 50 deepest discounts against verified 30-day price history. The organic &quot;SeenLow pick&quot; marks the single strongest verified deal.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-neutral-800">
            <div className="w-8 h-8 rounded-xl bg-[#B91C1C] text-white font-black flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#B91C1C]" />
                Direct Tap-Through or Have Us Buy
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Tap &quot;Buy at [Store]&quot; to purchase directly at the retailer&apos;s own price. We may earn a commission if you buy. For vetted deals, tap &quot;Have us buy it&quot; if you want SeenLow LLC as your single seller.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-neutral-800">
            <div className="w-8 h-8 rounded-xl bg-[#B91C1C] text-white font-black flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Checked Again Before You Tap
              </h4>
              <p className="text-slate-300 leading-relaxed">
                We re-check price and stock once an hour, when you open the deal, and right before you tap through. Never get redirected to a dead deal.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
          <span className="text-[11px] text-slate-500">SeenLow LLC · support@seenlow.com</span>
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold text-xs shadow-lg shadow-red-950/40"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
