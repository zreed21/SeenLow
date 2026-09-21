"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Percent,
  Sparkles,
  Layers,
  ArrowUpRight,
  Package
} from "lucide-react";
import { PlatformStats } from "@/types";

export function AnalyticsView() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 animate-pulse">
        Loading platform savings analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <BarChart3 className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-black text-white">Platform Savings & Market Analytics</h2>
        </div>
        <p className="text-xs text-slate-400">
          Aggregated discount metrics, hourly verification uptime, and order volume.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Average Discount</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </span>
          <div className="text-2xl font-black text-amber-400">{stats.avgDiscount}</div>
          <p className="text-[11px] text-slate-400">Off standard retail MSRP</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Total Potential Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400">{stats.totalPotentialSavings}</div>
          <p className="text-[11px] text-slate-400">Across Top 50 Active Deals</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Orders Completed</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </span>
          <div className="text-2xl font-black text-indigo-300">{stats.totalOrders}</div>
          <p className="text-[11px] text-slate-400">Secure in-app purchases</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Hourly Spider Uptime</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-white">{stats.hourlyUptime}</div>
          <p className="text-[11px] text-emerald-400 font-medium">All active deals verified</p>
        </div>

      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">Deals by Category</h3>
          <div className="space-y-2.5">
            {Object.entries(stats.categoryDistribution || {}).map(([cat, cnt]) => {
              const pct = ((cnt / (stats.totalDeals || 50)) * 100).toFixed(0);
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-medium">{cat}</span>
                    <span className="text-slate-400">{cnt} items ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">Deal Quality Snapshot</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-slate-400 block">Best discount</span>
              <strong className="text-xl text-amber-400">{stats.maxDiscount}</strong>
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-slate-400 block">Deals checked</span>
              <strong className="text-xl text-white">{stats.totalDeals}</strong>
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-slate-400 block">Availability</span>
              <strong className="text-xl text-emerald-400">100%</strong>
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-slate-400 block">Check frequency</span>
              <strong className="text-xl text-indigo-300">Hourly</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
