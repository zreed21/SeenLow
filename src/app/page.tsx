"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  Flame,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  Percent,
  CheckCircle2,
  Package,
  TrendingDown,
  AlertCircle,
  X
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DealCard } from "@/components/DealCard";
import { DealDetailModal } from "@/components/DealDetailModal";
import { CheckoutDrawer } from "@/components/CheckoutDrawer";
import { MidnightCrawlerView } from "@/components/MidnightCrawlerView";
import { OrdersTrackerView } from "@/components/OrdersTrackerView";
import { WatchlistView } from "@/components/WatchlistView";
import { AdminControlView } from "@/components/AdminControlView";
import { AnalyticsView } from "@/components/AnalyticsView";
import { DealTableListView } from "@/components/DealTableListView";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { AuthModal, SessionUser } from "@/components/AuthModal";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BestDealBanner } from "@/components/BestDealBanner";
import { BestDealModule } from "@/components/BestDealModule";
import { FaqView } from "@/components/FaqView";
import { Deal, Order, WatchlistItem, PlatformStats } from "@/types";
import { getTimeUntilMidnight } from "@/lib/utils";

const CATEGORIES = [
  "All Categories",
  "Audio & Wearables",
  "TV & Home Theater",
  "Computing & Laptops",
  "Home & Appliances",
  "Gaming & VR",
  "Cameras & Drones",
  "Outdoor & Fitness",
  "Fashion & Travel",
  "Personal Care & Beauty",
  "Office & Furniture",
];

const DISCOUNT_TIERS = [
  { label: "All Discounts", value: 0 },
  { label: "🔥 70%+ Off", value: 70 },
  { label: "⚡ 60%+ Off", value: 60 },
  { label: "✨ 50%+ Off", value: 50 },
  { label: "🏷️ 40%+ Off", value: 40 },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("top50");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Real session (null = guest)
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({ open: false, mode: "login" });
  const scopedUserId = currentUser ? `user-${currentUser.id}` : guestEmail ? `guest-${guestEmail.toLowerCase().trim()}` : "demo-user-1";

  useEffect(() => {
    setGuestEmail(localStorage.getItem("fd-guest-email") || "");
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const requestedTab = urlParams?.get("tab");
    const requestedAuth = urlParams?.get("auth");

    if (requestedAuth === "signin" || urlParams?.get("login") === "true") {
      setAuthModal({ open: true, mode: "login" });
    }

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          setCurrentUser(d.user);
          if (requestedTab === "admin" && d.user.role === "admin") {
            setActiveTab("admin");
          }
        } else if (requestedTab === "admin") {
          // Unauthenticated user requesting admin tab -> redirect to sign-in
          setAuthModal({ open: true, mode: "login" });
          setActiveTab("top50");
        }
      })
      .catch(() => {});
  }, []);

  // Guard: if unauthenticated or non-admin ever has activeTab="admin", kick back to "top50"
  useEffect(() => {
    if (activeTab === "admin" && currentUser?.role !== "admin") {
      setActiveTab("top50");
    }
  }, [activeTab, currentUser]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    if (activeTab === "admin") {
      setActiveTab("top50");
    }
  };

  const handleDeleteAccount = async () => {
    const typed = window.prompt(
      'Permanently delete your SeenLow account? Type "delete" to confirm. Orders are kept in anonymized form for accounting.'
    );
    if (!typed || typed.trim().toLowerCase() !== "delete") return;
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "delete" }),
      });
      const data = await res.json();
      if (!data.success) {
        window.alert(data.error || "Could not delete account.");
        return;
      }
      setCurrentUser(null);
      setWatchlistItems([]);
      setWatchlistSet(new Set());
      setOrders([]);
      if (activeTab === "admin") setActiveTab("top50");
      window.alert("Your account has been deleted.");
    } catch {
      window.alert("Could not delete account. Email support@seenlow.com.");
    }
  };

  const rememberGuestEmail = (email: string) => {
    setGuestEmail(email);
    localStorage.setItem("fd-guest-email", email);
  };

  // Data state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [bestDeal, setBestDeal] = useState<Deal | null>(null);
  const [portfolioStats, setPortfolioStats] = useState<PlatformStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlistSet, setWatchlistSet] = useState<Set<number>>(new Set());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState("discount_desc");

  // Loading & Async states
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modals & Drawers
  const [selectedDealForDetail, setSelectedDealForDetail] = useState<Deal | null>(null);
  const [selectedDealForCheckout, setSelectedDealForCheckout] = useState<Deal | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Countdown timer for Hero
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, formatted: "00h : 00m : 00s" });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    setCountdown(getTimeUntilMidnight());
    return () => clearInterval(timer);
  }, []);

  // Fetch Deals
  const fetchDeals = async () => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (minDiscount > 0) params.append("minDiscount", minDiscount.toString());
      params.append("sortBy", sortBy);
      params.append("top50", "true");

      const res = await fetch(`/api/deals?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDeals(data.deals || []);
      }

      const [top, stats] = await Promise.all([
        fetch("/api/deals?top50=true&sortBy=discount_desc&limit=1").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()),
      ]);
      if (top.success && top.deals?.[0]) setBestDeal(top.deals[0]);
      if (stats.success) setPortfolioStats(stats.stats);
    } catch (e) {
      console.error("Failed to load deals", e);
    } finally {
      setIsLoadingDeals(false);
      setIsRefreshing(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(scopedUserId)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load orders", e);
    }
  };

  // Fetch Watchlist
  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`/api/watchlist?userId=${encodeURIComponent(scopedUserId)}`);
      const data = await res.json();
      if (data.success) {
        setWatchlistItems(data.items || []);
        const idSet = new Set<number>((data.items || []).map((item: WatchlistItem) => item.deal.id));
        setWatchlistSet(idSet);
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory, minDiscount, sortBy]);

  useEffect(() => {
    fetchOrders();
    fetchWatchlist();
  }, [scopedUserId]);

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDeals();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Toggle Watchlist with Optimistic UI
  const handleToggleWatchlist = async (dealId: number) => {
    const isCurrentlySaved = watchlistSet.has(dealId);
    
    // Optimistic update
    setWatchlistSet((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, userId: scopedUserId }),
      });
      await res.json();
      fetchWatchlist();
    } catch (e) {
      console.error("Failed to toggle watchlist", e);
      // Rollback on failure
      fetchWatchlist();
    }
  };

  const handleSelectDeal = async (deal: Deal) => {
    try {
      const verification = await fetch(`/api/deals/${deal.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayedPrice: Number(deal.finalPrice), context: "catalog", checkpoint: "viewed" }),
      }).then((res) => res.json());

      if (!verification.success) throw new Error(verification.error || "Unable to verify this product.");
      if (!verification.available) {
        alert("This product is no longer available. We refreshed today’s list with another deal.");
        await fetchDeals();
        return;
      }
      if (verification.priceStatus === "increased") {
        alert(`The price changed from $${Number(verification.displayedPrice).toFixed(2)} to $${Number(verification.livePrice).toFixed(2)}. The updated price is shown in product details.`);
      }

      const latest = await fetch(`/api/deals/${deal.id}`).then((res) => res.json());
      setSelectedDealForDetail(latest.success ? latest.deal : deal);
    } catch (error: any) {
      alert(error.message || "Unable to verify this product right now.");
    }
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    fetchDeals();
  };

  const handleAdvanceOrderStatus = async (orderId: number, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dropshipStatus: nextStatus,
          note: `Carrier updated tracking progress to ${nextStatus}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (e) {
      console.error("Failed to advance order status", e);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setMinDiscount(0);
    setSortBy("discount_desc");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      <BestDealBanner bestDiscount={bestDeal?.discountPercent || "0"} bestTitle={bestDeal?.title} />

      {/* Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSignIn={() => setAuthModal({ open: true, mode: "login" })}
        onRegister={() => setAuthModal({ open: true, mode: "register" })}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        onRefreshDeals={fetchDeals}
        isRefreshing={isRefreshing}
        orderCount={orders.length}
      />

      <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center text-[11px] sm:text-xs text-slate-200">
        <AlertCircle className="mr-1.5 inline h-4 w-4 text-amber-400" />
        <strong>Prices and availability are subject to change without notice.</strong> We verify every hour, when you open a product, and again before payment. If a price increases before checkout, you&apos;ll be alerted and can continue or cancel before any payment is taken.
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dealCount={deals.length}
            orderCount={orders.length}
            watchlistCount={watchlistItems.length}
            userRole={currentUser?.role || "guest"}
            onOpenHowItWorks={() => setShowHowItWorks(true)}
          />

          {/* Right Main Content Area */}
          <section className="flex-1 w-full space-y-6">
            
            {/* TAB 1: Top 50 Midnight Deals Flagship Feed */}
            {activeTab === "top50" && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Hero Header Banner */}
                <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-900/60 text-red-200 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                        <span>TODAY&apos;S 50 LOWEST PRICES • RANKED BY SAVINGS</span>
                      </div>
                      
                      <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                        Lowest we&apos;ve seen. <span className="text-[#B91C1C]">Checked again before you tap.</span>
                      </h1>
                      
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Prices and availability subject to change without notice. If a price rises before checkout, you&apos;ll be alerted and can continue or cancel.
                      </p>
                    </div>

                    {/* Countdown Clock & Health Badge */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      
                      <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 text-center shadow-xl backdrop-blur-sm">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                          Next Midnight Scrape In
                        </span>
                        <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                          {countdown.formatted}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold">Hourly Verified Active</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold">100% In Stock</span>
                      </div>

                    </div>
                  </div>
                </div>

                <BestDealModule onOpenDeal={(dealId) => { const found = deals.find((d) => d.id === dealId); if (found) handleSelectDeal(found); }} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-rose-500/30 bg-slate-900 p-4 shadow-xl">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total potential savings</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{portfolioStats?.totalPotentialSavings || "—"}</div>
                    <p className="text-[10px] text-slate-500">One unit of every active, certified deal vs. regular price</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-4 shadow-xl">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Average customer discount</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">{portfolioStats ? `${Number(portfolioStats.averageCustomerDiscount || 0).toFixed(1)}%` : "—"}</div>
                    <p className="text-[10px] text-slate-500">Across all active, certified and sellable deals</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-500/30 bg-slate-900 p-4 shadow-xl">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Active certified deals</span>
                    <div className="text-2xl font-black text-white mt-1">{portfolioStats?.activeDealCount ?? "—"}</div>
                    <p className="text-[10px] text-slate-500">
                      Top {portfolioStats?.top50Count ?? 0} ranked into today&apos;s feed; the rest are active reserve
                    </p>
                  </div>
                </div>

                {/* Midnight email list */}
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-rose-600/10 via-amber-500/10 to-yellow-400/10 p-5 shadow-xl">
                  <NewsletterSignup source="website" defaultEmail={currentUser?.email || guestEmail} />
                </div>

                {/* Filter Toolbar & Search Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
                  
                  {/* Search and Main Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search top deals (e.g. MacBook, OLED, Dyson, Sony, Breville)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none transition"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-amber-400 outline-none font-medium"
                      >
                        <option value="discount_desc">Highest % Off</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="opportunity_score">Deal Heat Score</option>
                        <option value="rank_asc">Rank #1 to #50</option>
                      </select>

                      {/* View Mode Toggle */}
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-1.5 rounded-lg transition ${
                            viewMode === "grid" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                          }`}
                          title="Grid View"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("table")}
                          className={`p-1.5 rounded-lg transition ${
                            viewMode === "table" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                          }`}
                          title="Table View"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Category Pills Slider */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                            isSelected
                              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                              : "bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Discount Tier Quick Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Min Discount:
                      </span>
                      {DISCOUNT_TIERS.map((tier) => (
                        <button
                          key={tier.label}
                          onClick={() => setMinDiscount(tier.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            minDiscount === tier.value
                              ? "bg-rose-500 text-white shadow-sm"
                              : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>

                    <div className="text-slate-400 text-xs font-medium hidden sm:block">
                      Showing <strong className="text-amber-400">{deals.length}</strong> Top Deals
                    </div>
                  </div>

                </div>

                {/* Deal Cards Grid / Table Area */}
                {isLoadingDeals ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-96 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4 space-y-4" />
                    ))}
                  </div>
                ) : deals.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
                    <Search className="w-12 h-12 mx-auto text-slate-600" />
                    <div>
                      <h3 className="text-base font-bold text-white">No Deals Matched Your Filters</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        Try adjusting your search query, discount percentage, or selected category.
                      </p>
                    </div>
                    <button
                      onClick={resetFilters}
                      className="py-2.5 px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {deals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onSelectDeal={handleSelectDeal}
                        onQuickBuy={(deal) => { if ((deal as any).ctaType === "affiliate" && !(deal as any).resellerSecondary) { window.open((deal as any).redirectPath || `/api/go/${deal.id}`, "_blank"); return; } setSelectedDealForCheckout(deal); }}
                        isWatchlisted={watchlistSet.has(deal.id)}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                    ))}
                  </div>
                ) : (
                  <DealTableListView
                    deals={deals}
                    onSelectDeal={handleSelectDeal}
                    onQuickBuy={(deal) => { if ((deal as any).ctaType === "affiliate" && !(deal as any).resellerSecondary) { window.open((deal as any).redirectPath || `/api/go/${deal.id}`, "_blank"); return; } setSelectedDealForCheckout(deal); }}
                    watchlistSet={watchlistSet}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                )}

              </div>
            )}

            {/* TAB 2: Live Crawler & Healthcheck Hub */}
            {activeTab === "crawler" && (
              <MidnightCrawlerView
                onMidnightRunSuccess={() => {
                  fetchDeals();
                  fetchOrders();
                }}
                onHourlyCheckSuccess={() => {
                  fetchDeals();
                }}
              />
            )}

            {/* TAB 3: My Orders & Dropship Tracker */}
            {activeTab === "orders" && (
              <OrdersTrackerView
                orders={orders}
                onRefreshOrders={fetchOrders}
                onAdvanceOrderStatus={handleAdvanceOrderStatus}
              />
            )}

            {/* TAB 4: Saved Watchlist & Alerts */}
            {activeTab === "watchlist" && (
              <WatchlistView
                watchlistItems={watchlistItems}
                onRemoveFromWatchlist={handleToggleWatchlist}
                onSelectDeal={handleSelectDeal}
                onQuickBuy={(deal) => { if ((deal as any).ctaType === "affiliate" && !(deal as any).resellerSecondary) { window.open((deal as any).redirectPath || `/api/go/${deal.id}`, "_blank"); return; } setSelectedDealForCheckout(deal); }}
                onBrowseDeals={() => setActiveTab("top50")}
              />
            )}

            {/* TAB 5: Platform Savings & Market Stats */}
            {activeTab === "analytics" && <AnalyticsView />}

            {/* TAB: Fulfillment & Returns FAQ */}
            {activeTab === "faq" && <FaqView />}

            {/* TAB 6: Concierge Admin Control Room */}
            {activeTab === "admin" && currentUser?.role === "admin" && (
              <AdminControlView
                deals={deals}
                orders={orders}
                onRefreshDeals={fetchDeals}
                onRefreshOrders={fetchOrders}
                onSelectDeal={handleSelectDeal}
              />
            )}

          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SeenLow</span>
            <span className="text-slate-500">·</span>
            <span>Operated by SeenLow LLC at seenlow.com</span>
            <span className="text-slate-500">·</span>
            <span>support@seenlow.com</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Hourly Deal Auditing Active
            </span>
            <span>US Only · Prices in USD</span>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <DealDetailModal
        deal={selectedDealForDetail}
        isOpen={Boolean(selectedDealForDetail)}
        onClose={() => setSelectedDealForDetail(null)}
        onBuyNow={(deal) => {
          setSelectedDealForDetail(null);
          setSelectedDealForCheckout(deal);
        }}
        isWatchlisted={selectedDealForDetail ? watchlistSet.has(selectedDealForDetail.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Checkout Drawer */}
      <CheckoutDrawer
        deal={selectedDealForCheckout}
        isOpen={Boolean(selectedDealForCheckout)}
        onClose={() => setSelectedDealForCheckout(null)}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
        guestEmail={guestEmail}
        onGuestEmail={rememberGuestEmail}
        onRequestSignIn={() => setAuthModal({ open: true, mode: "login" })}
        userId={scopedUserId}
      />

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((a) => ({ ...a, open: false }))}
        onAuthenticated={(user) => { setCurrentUser(user); }}
      />

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

    </div>
  );
}
