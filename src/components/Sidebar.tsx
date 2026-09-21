"use client";

import React from "react";
import {
  Flame,
  Search,
  Package,
  Heart,
  Sliders,
  BarChart3,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  FileText
} from "lucide-react";
import { SeenLowLogo } from "@/components/SeenLowLogo";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dealCount: number;
  orderCount: number;
  watchlistCount: number;
  userRole: string;
  onOpenHowItWorks: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  dealCount,
  orderCount,
  watchlistCount,
  userRole,
  onOpenHowItWorks,
}: SidebarProps) {
  const navItems = [
    {
      id: "top50",
      label: "Top 50 Lowest Deals",
      icon: Flame,
      badge: `${dealCount}`,
      badgeColor: "bg-red-950/60 text-red-300 border-red-900/60",
      description: "Lowest we've seen today",
    },
    {
      id: "crawler",
      label: "Live Price Checker",
      icon: Search,
      badge: "Hourly",
      badgeColor: "bg-emerald-950/40 text-emerald-300 border-emerald-900/40",
      description: "Midnight & hourly scans",
    },
    {
      id: "orders",
      label: "My Orders & Tracking",
      icon: Package,
      badge: orderCount > 0 ? `${orderCount}` : undefined,
      badgeColor: "bg-red-950/60 text-red-300 border-red-900/60",
      description: "Live order status",
    },
    {
      id: "watchlist",
      label: "Saved Price Alerts",
      icon: Heart,
      badge: watchlistCount > 0 ? `${watchlistCount}` : undefined,
      badgeColor: "bg-red-950/60 text-red-300 border-red-900/60",
      description: "Personal price drop alerts",
    },
    {
      id: "analytics",
      label: "Market Savings Stats",
      icon: BarChart3,
      description: "US discount analytics",
    },
    {
      id: "faq",
      label: "Fulfillment & Returns FAQ",
      icon: FileText,
      description: "How orders ship and get refunded",
    },
    {
      id: "admin",
      label: "SeenLow Admin Desk",
      icon: Sliders,
      badge: userRole === "admin" ? "Admin" : undefined,
      badgeColor: "bg-red-950/60 text-red-300 border-red-900/60",
      description: "Listings, orders & email list",
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-4">
      {/* Primary Navigation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          SeenLow Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between group ${
                isActive
                  ? "bg-red-950/40 border border-[#B91C1C]/60 text-white font-semibold shadow-md"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition ${
                    isActive
                      ? "bg-[#B91C1C] text-white shadow-sm"
                      : "bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-red-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.description}</div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SeenLow Mission Card */}
      <div className="bg-gradient-to-br from-[#0A0A0A] via-red-950/20 to-[#0A0A0A] border border-red-950/80 rounded-2xl p-4 text-slate-200 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <SeenLowLogo variant="icon" size="sm" />
          <span className="text-white font-extrabold text-sm">Seen low. Tap through.</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.
        </p>

        <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Hourly Price Audit:</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Active
          </span>
        </div>

        <button
          onClick={onOpenHowItWorks}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-900/50 transition flex items-center justify-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5 text-red-400" />
          <span>How SeenLow Works</span>
        </button>
      </div>

      {/* Popular US Categories */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-slate-400 text-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Monitored US Categories
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Computers", "Audio", "Home", "Gaming", "TV", "Fitness", "Cameras", "Travel"].map((category) => (
            <span
              key={category}
              className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300 border border-slate-700/60"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
