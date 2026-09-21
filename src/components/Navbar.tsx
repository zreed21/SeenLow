"use client";

import React, { useState, useEffect } from "react";
import { Clock, ShieldCheck, Bell, ShoppingBag, RefreshCw, ChevronDown, Sun, Moon, LogOut, LogIn, UserPlus } from "lucide-react";
import { getTimeUntilMidnight } from "@/lib/utils";
import { NotificationItem } from "@/types";
import { SessionUser } from "@/components/AuthModal";
import { SeenLowLogo } from "@/components/SeenLowLogo";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: SessionUser | null;
  onSignIn: () => void;
  onRegister: () => void;
  onSignOut: () => void;
  onRefreshDeals: () => void;
  isRefreshing: boolean;
  orderCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onSignIn,
  onRegister,
  onSignOut,
  onRefreshDeals,
  isRefreshing,
  orderCount,
}: NavbarProps) {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, formatted: "00h : 00m : 00s" });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    setCountdown(getTimeUntilMidnight());
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem("fd-theme", next);
    setTheme(next);
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  };
  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo Lockup */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab("top50")}
            title="SeenLow — Lowest we've seen"
          >
            <SeenLowLogo variant="lockup" size="md" />
            <span className="hidden xl:inline text-[11px] text-slate-400 border-l border-slate-800 pl-3">
              Seen low. Tap through.
            </span>
          </div>

          {/* Central Badges */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-red-900/40">
              <Clock className="w-4 h-4 text-[#B91C1C] animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">
                  Next drop in
                </span>
                <span className="font-mono font-bold text-[#B91C1C]">{countdown.formatted}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-900/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">
                  Deals
                </span>
                <span className="font-bold text-slate-200">Verified hourly</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title="Toggle light / dark"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={onRefreshDeals}
              disabled={isRefreshing}
              title="Refresh"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#B91C1C]" : ""}`} />
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`relative p-2 rounded-lg flex items-center gap-1.5 text-xs font-medium border transition ${
                activeTab === "orders"
                  ? "bg-[#B91C1C]/20 text-red-200 border-[#B91C1C]/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#B91C1C]" />
              <span className="hidden sm:inline">Orders</span>
              {orderCount > 0 && (
                <span className="px-1.5 text-[10px] font-bold rounded-full bg-[#B91C1C] text-white">
                  {orderCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-[10px] font-bold flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="font-bold text-sm text-white">Alerts</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] text-[#B91C1C] font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No alerts yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg border text-xs ${
                            n.isRead
                              ? "bg-slate-800/40 border-slate-800 text-slate-400"
                              : "bg-slate-800 border-slate-700 text-slate-200"
                          }`}
                        >
                          <div className="font-semibold text-white mb-0.5">{n.title}</div>
                          <p className="text-[11px] text-slate-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-[#B91C1C] flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:block text-xs font-semibold text-white">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 text-xs">
                    <p className="font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mb-2">{currentUser.email}</p>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onSignIn}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
                <button
                  onClick={onRegister}
                  className="px-3 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-950/30"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Join</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
