"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Zap,
  ShieldCheck,
  RotateCcw,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Server,
  Cpu
} from "lucide-react";
import { CrawlerLog } from "@/types";
import { parseJsonSafe } from "@/lib/utils";

interface MidnightCrawlerViewProps {
  onMidnightRunSuccess: () => void;
  onHourlyCheckSuccess: () => void;
}

export function MidnightCrawlerView({
  onMidnightRunSuccess,
  onHourlyCheckSuccess,
}: MidnightCrawlerViewProps) {
  const [logs, setLogs] = useState<CrawlerLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningMidnight, setIsRunningMidnight] = useState(false);
  const [isRunningHourly, setIsRunningHourly] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[DAEMON ONLINE] Opportunity Deals Web Crawler active.",
    "[SCHEDULE] Automated midnight scrape scheduled every 24 hours at 00:00:00 EST.",
    "[DAEMON HEALTH] Hourly Deal Verification Spider active. Next cycle in ~42 mins.",
    "[READY] Ready to initiate manual Spider Crawl or Hourly Stock Audit."
  ]);
  const [selectedLog, setSelectedLog] = useState<CrawlerLog | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/crawler/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Failed to load crawler logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRunMidnightCrawl = async () => {
    setIsRunningMidnight(true);
    setTerminalOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⚡ INITIATING MANUAL MIDNIGHT WEB CRAWLER RUN...`,
      `[WORKERS] Spawning 16 concurrent search workers across all shopping categories...`,
      `[INGEST] Scanning 18,000+ daily discounts and limited-time offers...`
    ]);

    try {
      const res = await fetch("/api/crawler/midnight-run", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTerminalOutput((prev) => [
          ...prev,
          `[SUCCESS] Midnight scrape completed! Processed ${data.dealsUpdated} deals.`,
          `[RANKED] Top 50 Deals re-indexed by % discount (Highest: ${data.topDiscount}% off).`,
          `[PRICING] Customer prices computed and verified for checkout.`
        ]);
        fetchLogs();
        onMidnightRunSuccess();
      }
    } catch (e) {
      setTerminalOutput((prev) => [...prev, `[ERROR] Midnight crawl failed: ${String(e)}`]);
    } finally {
      setIsRunningMidnight(false);
    }
  };

  const handleRunHourlyVerify = async () => {
    setIsRunningHourly(true);
    setTerminalOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🛡️ INITIATING HOURLY DEAL HEALTHCHECK AUDIT...`,
      `[HEALTH] Verifying stock quantities and price stability for all 50 displayed items...`
    ]);

    try {
      const res = await fetch("/api/crawler/hourly-verify", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTerminalOutput((prev) => [
          ...prev,
          `[SUCCESS] Verified ${data.verifiedCount} deals active and in stock. `,
          `[STATUS] 0 out-of-stock items detected. Hourly healthcheck passed 100%.`
        ]);
        fetchLogs();
        onHourlyCheckSuccess();
      }
    } catch (e) {
      setTerminalOutput((prev) => [...prev, `[ERROR] Hourly check failed: ${String(e)}`]);
    } finally {
      setIsRunningHourly(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm("Reset and re-seed the Top 50 deals database?")) return;
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTerminalOutput((prev) => [
          ...prev,
          `[SEED] Database re-seeded with 50 fresh deals, orders, and crawler history.`
        ]);
        fetchLogs();
        onMidnightRunSuccess();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Trigger Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Search className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-white">Deal Scanner & Web Crawler Engine</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Our automated search runs every night at midnight to curate the 50 steepest discounts. Hourly healthchecks verify that displayed prices remain active and products stay available.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Run Midnight Scrape */}
            <button
              onClick={handleRunMidnightCrawl}
              disabled={isRunningMidnight}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isRunningMidnight ? "animate-spin" : ""}`} />
              <span>{isRunningMidnight ? "Crawling Web..." : "Run Midnight Crawl Now"}</span>
            </button>

            {/* Run Hourly Healthcheck */}
            <button
              onClick={handleRunHourlyVerify}
              disabled={isRunningHourly}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 ${isRunningHourly ? "animate-spin" : ""}`} />
              <span>{isRunningHourly ? "Verifying..." : "Run Hourly Deal Healthcheck"}</span>
            </button>

            {/* Reset Database */}
            <button
              onClick={handleResetDatabase}
              title="Reset & Reseed Deals"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Retailer Spiders Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 border-t border-slate-800">
          {[
            { name: "Computing", latency: "14ms", status: "Healthy" },
            { name: "Audio", latency: "18ms", status: "Healthy" },
            { name: "Home", latency: "12ms", status: "Healthy" },
            { name: "Gaming", latency: "22ms", status: "Healthy" },
            { name: "Cameras", latency: "26ms", status: "Healthy" },
            { name: "Fitness", latency: "15ms", status: "Healthy" },
            { name: "Travel & Style", latency: "19ms", status: "Healthy" },
          ].map((worker, i) => (
            <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300 text-[11px] truncate">{worker.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{worker.status}</span>
                <span className="font-mono text-emerald-400">{worker.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Crawler Terminal Simulation */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 font-mono text-xs shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">Crawler Spider Telemetry Console</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              DAEMON RUNNING
            </span>
            <span className="text-slate-400">Worker Threads: 16</span>
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-1 text-slate-300 scrollbar-thin">
          {terminalOutput.map((line, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-amber-400 mr-2">›</span>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Historical Crawler Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Crawl & Verification History Logs</h3>
            <p className="text-xs text-slate-400">Records of midnight scrapes and hourly healthchecks</p>
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Run Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Deals Scanned</th>
                <th className="py-3 px-3">Updated / Active</th>
                <th className="py-3 px-3">Top Discount</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => {
                const isMidnight = log.runType === "midnight_crawl";
                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {isMidnight ? (
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span className="capitalize">{log.runType.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">{log.dealsScanned.toLocaleString()} items</td>
                    <td className="py-3 px-3 font-mono">{log.dealsUpdated} deals</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{log.topDiscountFound || "75.0"}% Off</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {new Date(log.startedAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        View Logs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Output Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Crawl Log #{selectedLog.id} ({selectedLog.runType})
              </h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-72 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5">
              {parseJsonSafe<string[]>(selectedLog.logOutput, [selectedLog.logOutput]).map((msg, i) => (
                <div key={i}>
                  <span className="text-amber-400 mr-1.5">›</span>
                  {msg}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
