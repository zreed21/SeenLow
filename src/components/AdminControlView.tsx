"use client";

import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye
} from "lucide-react";
import { Deal, Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface AdminControlViewProps {
  deals: Deal[];
  orders: Order[];
  onRefreshDeals: () => void;
  onRefreshOrders: () => void;
  onSelectDeal: (deal: Deal) => void;
}

export function AdminControlView({
  deals,
  orders,
  onRefreshDeals,
  onRefreshOrders,
  onSelectDeal,
}: AdminControlViewProps) {
  const [activeTab, setActiveTab] = useState<"deals_crud" | "dropship_queue" | "ledger" | "email" | "policies" | "fulfillment" | "sources" | "sku_health" | "price_audit" | "monetization">("deals_crud");
  const [policy, setPolicy] = useState<any>(null);
  const [policySaved, setPolicySaved] = useState(false);
  const [gate, setGate] = useState<any>(null);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [skuHealth, setSkuHealth] = useState<any[]>([]);
  const [priceAudit, setPriceAudit] = useState<any[]>([]);
  const [mon, setMon] = useState<any>(null);
  const loadMon = async () => { const d = await fetch("/api/monetization").then((r) => r.json()); if (d.success) setMon(d); };
  const monPut = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/monetization", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (!d.success) alert(d.error);
    await loadMon(); onRefreshDeals();
  };
  const loadPriceAudit = async () => { const d = await fetch("/api/price-observations?limit=300").then((r) => r.json()); if (d.success) setPriceAudit(d.observations); };
  const loadSources = async () => { const d = await fetch("/api/sources").then((r) => r.json()); if (d.success) setSourceData(d.sources); };
  const sourceAction = async (id: number, action: string) => {
    const testOrderId = action === "approve_test_buy" ? prompt("Test-buy order/reference ID") : undefined;
    const reason = action === "block" ? prompt("Block reason") : undefined;
    await fetch("/api/sources", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, testOrderId, reason }) });
    await loadSources(); onRefreshDeals();
  };
  const loadSkuHealth = async () => { const d = await fetch("/api/sku-health").then((r) => r.json()); if (d.success) setSkuHealth(d.skus); };
  const addOutcome = async (dealId: number, type: string) => {
    const amount = Number(prompt("Loss or retained-margin amount ($)", "0") || 0);
    const postageLoss = Number(prompt("Postage loss ($)", "0") || 0);
    await fetch("/api/sku-health", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dealId, type, amount, postageLoss, notes: "Recorded by admin" }) });
    await loadSkuHealth(); onRefreshDeals();
  };
  const [gateBusy, setGateBusy] = useState(false);

  const loadGate = async () => {
    const res = await fetch("/api/agent/partner-buy");
    const data = await res.json();
    if (data.success) setGate(data);
  };

  const authorizePartnerBuy = async (orderId: number, partnerPrice: number, humanOverride: boolean) => {
    setGateBusy(true);
    try {
      const res = await fetch("/api/agent/partner-buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, partnerPrice, actor: "ops", humanOverride }),
      });
      await res.json();
      await loadGate();
      onRefreshOrders();
    } finally { setGateBusy(false); }
  };

  const saveSettings = async (patch: Record<string, unknown>) => {
    setGateBusy(true);
    try {
      await fetch("/api/agent/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      await loadGate();
    } finally { setGateBusy(false); }
  };

  const loadPolicies = async () => {
    const res = await fetch("/api/policies");
    const data = await res.json();
    if (data.success) setPolicy(data.policies);
  };

  const savePolicies = async () => {
    const res = await fetch("/api/policies", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(policy) });
    const data = await res.json();
    if (data.success) { setPolicy(data.policies); setPolicySaved(true); setTimeout(() => setPolicySaved(false), 2500); }
  };

  React.useEffect(() => { if (activeTab === "policies" && !policy) loadPolicies(); }, [activeTab]);
  React.useEffect(() => { if (activeTab === "fulfillment") loadGate(); }, [activeTab]);
  React.useEffect(() => { if (activeTab === "sources") loadSources(); }, [activeTab]);
  React.useEffect(() => { if (activeTab === "sku_health") loadSkuHealth(); }, [activeTab]);
  React.useEffect(() => { if (activeTab === "price_audit") loadPriceAudit(); }, [activeTab]);
  React.useEffect(() => { if (activeTab === "monetization") loadMon(); }, [activeTab]);
  const [emailData, setEmailData] = useState<{ subscribers: any[]; logs: any[] }>({ subscribers: [], logs: [] });
  const [sendingDigest, setSendingDigest] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const loadEmailData = async () => {
    const res = await fetch("/api/newsletter");
    const data = await res.json();
    if (data.success) setEmailData({ subscribers: data.subscribers, logs: data.logs });
  };

  const sendDigestNow = async () => {
    setSendingDigest(true);
    try {
      await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send_digest" }) });
      await loadEmailData();
    } finally { setSendingDigest(false); }
  };

  React.useEffect(() => { if (activeTab === "email") loadEmailData(); }, [activeTab]);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // New deal form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    brand: "",
    originalPrice: "",
    dealPrice: "",
    retailer: "",
    retailerUrl: "",
    imageUrl: "",
    stockQuantity: 10,
    isHot: false,
  });

  const [pricePreview, setPricePreview] = useState<string | null>(null);
  React.useEffect(() => {
    const sourceCost = editingDeal?.dealPrice ?? formData.dealPrice;
    const regularPrice = editingDeal?.originalPrice ?? formData.originalPrice;
    if ((!editingDeal && !showAddDealModal) || Number(sourceCost) <= 0 || Number(regularPrice) <= 0) { setPricePreview(null); return; }
    const controller = new AbortController();
    setPricePreview(null);
    const timer = setTimeout(() => {
      fetch("/api/pricing/preview", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCost, regularPrice }), signal: controller.signal })
        .then((res) => res.json()).then((data) => { if (data.success) setPricePreview(data.salePrice); })
        .catch(() => {});
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [editingDeal?.dealPrice, editingDeal?.originalPrice, formData.dealPrice, formData.originalPrice, showAddDealModal]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Financial calculations
  const totalGrossOrderVolume = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalCustomerSavingsDelivered = orders.reduce((sum, o) => sum + (Number(o.customerSavings) || 0), 0);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create deal");

      setStatusMsg({ type: "success", text: "Deal created successfully with customer pricing applied!" });
      setShowAddDealModal(false);
      setFormData({
        title: "",
        description: "",
        category: "Electronics",
        brand: "",
        originalPrice: "",
        dealPrice: "",
        retailer: "",
        retailerUrl: "",
        imageUrl: "",
        stockQuantity: 10,
        isHot: false,
      });
      onRefreshDeals();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/deals/${editingDeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDeal),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update deal");

      setEditingDeal(null);
      setStatusMsg({ type: "success", text: "Deal updated successfully!" });
      onRefreshDeals();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onRefreshDeals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefund = async (orderId: number, orderNumber: string) => {
    if (!confirm(`Refund order ${orderNumber}? This issues a Stripe refund and stops fulfillment.`)) return;
    await fetch(`/api/orders/${orderId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refund", reason: "The partner could not fulfill this order." }),
    });
    onRefreshOrders();
  };

  const handleUpdateDropshipStage = async (orderId: number, nextStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dropshipStatus: nextStatus,
          note: `Concierge operator advanced fulfillment status to ${nextStatus}.`,
        }),
      });
      onRefreshOrders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Concierge & Admin Control Room</h2>
          </div>
          <p className="text-xs text-slate-400">
            Manage product listings, customer prices, availability, and order delivery statuses.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("deals_crud")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "deals_crud"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Deals Management ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab("dropship_queue")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "dropship_queue"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "ledger"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Sales & Savings
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "email" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            Email List
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "policies" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            Policy Copy
          </button>
          <button onClick={() => setActiveTab("sources")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "sources" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}>
            Source Certification
          </button>
          <button onClick={() => setActiveTab("monetization")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "monetization" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}>
            Monetization
          </button>
          <button onClick={() => setActiveTab("price_audit")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "price_audit" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}>
            Price Audit
          </button>
          <button onClick={() => setActiveTab("sku_health")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "sku_health" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}>
            SKU Health
          </button>
          <button
            onClick={() => setActiveTab("fulfillment")}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === "fulfillment" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            Fulfillment Gate
          </button>
        </div>
      </div>

      {/* Deals CRUD View */}
      {activeTab === "deals_crud" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Current Deal Catalog</h3>
            <button
              onClick={() => setShowAddDealModal(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Deal</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/60">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Regular Price</th>
                    <th className="py-3 px-4">Customer Price</th>
                    <th className="py-3 px-4">Discount %</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4 font-bold text-amber-400">#{deal.dealRank}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={deal.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0"
                          />
                          <span
                            onClick={() => onSelectDeal(deal)}
                            className="font-semibold text-white truncate max-w-xs cursor-pointer hover:text-amber-400"
                          >
                            {deal.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 line-through text-slate-500">{formatCurrency(deal.originalPrice)}</td>
                      <td className="py-3 px-4 font-black text-amber-400">{formatCurrency(deal.finalPrice)}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">{deal.discountPercent}%</td>
                      <td className="py-3 px-4 font-mono">{deal.stockQuantity}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={async () => { const d = await fetch(`/api/deals/${deal.id}?internal=true`).then((r) => r.json()); if (d.success) setEditingDeal(d.deal); }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Deal"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dropship Queue View */}
      {activeTab === "dropship_queue" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Order Fulfillment Pipeline</h3>
              <p className="text-xs text-slate-400">Manage customer orders and delivery status updates</p>
            </div>
            <button
              onClick={onRefreshOrders}
              className="py-1.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Orders</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Paid Total</th>
                  <th className="py-3 px-3">Order Status</th>
                  <th className="py-3 px-3 text-right">Documents &amp; Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">{order.orderNumber}</td>
                    <td className="py-3 px-3 text-white font-medium">{order.userName}</td>
                    <td className="py-3 px-3 text-slate-200 truncate max-w-xs">{order.productTitle}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 capitalize">
                        {{ payment_received: "Payment confirmed", retailer_order_placed: "Order preparing", retailer_processing: "Order preparing", shipped: "Shipped", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled" }[order.dropshipStatus] || "Processing"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <a href={`/api/documents/${order.id}/blind-shipping`} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold hover:bg-rose-500/25">
                          Blind-Ship Doc
                        </a>
                        <a href={`/api/documents/${order.id}/invoice`} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold hover:bg-slate-700">
                          Invoice
                        </a>
                        {(order as any).blindShippingAcknowledged
                          ? <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">Partner ack</span>
                          : <span className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">Sent</span>}
                        {(order as any).fulfillmentHold && (
                          <span className="px-2 py-1 rounded-lg bg-rose-600/25 border border-rose-500/50 text-rose-200 text-[10px] font-black" title={(order as any).holdReason || ""}>
                            ⛔ HOLD
                          </span>
                        )}
                        {order.paymentStatus !== "refunded" && (
                          <button onClick={() => handleRefund(order.id, order.orderNumber)}
                            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold hover:text-rose-300">
                            Refund
                          </button>
                        )}
                      </div>
                      <select
                        value={order.dropshipStatus}
                        onChange={(e) => handleUpdateDropshipStage(order.id, e.target.value)}
                        className="mt-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 outline-none"
                      >
                        <option value="payment_received">Payment Received</option>
                        <option value="retailer_order_placed">Order Preparing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled / Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ledger & Margins View */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Money movement: Stripe revenue vs partner COGS vs refunds */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Gross sales (Stripe)", value: orders.filter(o=>o.paymentStatus!=="pending").reduce((s,o)=>s+Number(o.totalAmount||0),0), color: "text-amber-400" },
              { label: "Est. Stripe fees", value: orders.filter(o=>o.paymentStatus!=="pending").reduce((s,o)=>s+Number((o as any).stripeFeeUsd||0),0), color: "text-slate-300" },
              { label: "Partner COGS", value: orders.reduce((s,o)=>s+Number((o as any).cogsUsd||0),0), color: "text-rose-300" },
              { label: "Refunds", value: orders.reduce((s,o)=>s+Number(o.refundAmount||0),0), color: "text-rose-400" },
              { label: "Net margin", value: (() => {
                const g = orders.filter(o=>o.paymentStatus!=="pending").reduce((s,o)=>s+Number(o.totalAmount||0),0);
                const f = orders.reduce((s,o)=>s+Number((o as any).stripeFeeUsd||0),0);
                const c = orders.reduce((s,o)=>s+Number((o as any).cogsUsd||0),0);
                const r = orders.reduce((s,o)=>s+Number(o.refundAmount||0),0);
                return g - f - c - r;
              })(), color: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{m.label}</span>
                <span className={`text-lg font-black ${m.color}`}>{formatCurrency(m.value)}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Working-capital note: Stripe payouts land in ~2 business days, but partner buys hit the company card immediately.
            Price processing into the listing, not after.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Customer Orders</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{orders.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Orders placed through the app</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Gross Merchandise Value</span>
              <div className="text-2xl font-black text-white mt-1">{formatCurrency(totalGrossOrderVolume)}</div>
              <p className="text-[11px] text-slate-400 mt-1">Total customer checkout payments</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Customer Savings Generated</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalCustomerSavingsDelivered)}</div>
              <p className="text-[11px] text-slate-400 mt-1">Customer savings off retail MSRP</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "email" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Midnight Deal Email List</h3>
              <p className="text-xs text-slate-400">Digest goes out automatically at 12:15 AM after the midnight drop. {process.env.NEXT_PUBLIC_SMTP_CONFIGURED ? "SMTP delivery active." : "Without SMTP credentials, sends are recorded in the outbox below."}</p>
            </div>
            <button onClick={sendDigestNow} disabled={sendingDigest} className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-slate-950 font-black text-xs disabled:opacity-50">
              {sendingDigest ? "Sending..." : "Send tonight's digest now"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-3">Subscribers ({emailData.subscribers.filter((s) => s.isActive).length} active)</h4>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-800 text-xs">
                {emailData.subscribers.length === 0 && <p className="text-slate-400 py-4 text-center">No subscribers yet.</p>}
                {emailData.subscribers.map((s) => (
                  <div key={s.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0"><div className="text-white font-medium truncate">{s.email}</div><div className="text-[10px] text-slate-500">{s.source} · joined {new Date(s.createdAt).toLocaleDateString()}</div></div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>{s.isActive ? "Active" : "Unsubscribed"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-3">Send Log / Outbox</h4>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-800 text-xs">
                {emailData.logs.length === 0 && <p className="text-slate-400 py-4 text-center">No digests sent yet.</p>}
                {emailData.logs.map((l) => (
                  <div key={l.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0"><div className="text-white font-medium truncate">{l.subject}</div><div className="text-[10px] text-slate-500">{new Date(l.sentAt).toLocaleString()} · {l.recipientCount} recipients · {l.deliveryMode}</div></div>
                    <button onClick={() => setPreviewHtml(l.htmlPreview)} className="text-amber-400 font-semibold whitespace-nowrap">Preview</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {previewHtml && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={() => setPreviewHtml(null)}>
              <div className="w-full max-w-2xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <iframe title="Email preview" srcDoc={previewHtml} className="w-full h-full border-0" />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "policies" && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base">Disclosure &amp; Policy Copy</h3>
            <p className="text-xs text-slate-400 mt-1">
              These values fill the blanks in the fulfillment disclosure shown above Pay, the FAQ page, the blind-shipping sheet, and every customer invoice.
            </p>
          </div>

          {policy ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { k: "companyName", label: "Store name ([Store])" },
                  { k: "supportEmail", label: "Support email" },
                  { k: "governingState", label: "Governing law ([State])" },
                  { k: "returnShippingCost", label: "Change-of-mind return shipping ([your cost / customer's cost])" },
                  { k: "restockingFee", label: "Restocking ([none / $X / only if…])" },
                  { k: "refundMethod", label: "Refund method" },
                  { k: "titleTransfer", label: "Title & risk sentence" },
                ].map((f) => (
                  <label key={f.k} className="block">
                    <span className="text-slate-400 block mb-1">{f.label}</span>
                    <input
                      value={policy[f.k] ?? ""}
                      onChange={(e) => setPolicy({ ...policy, [f.k]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-slate-400 block mb-1">Change-of-mind window ([X] days)</span>
                  <input
                    type="number" min={0}
                    value={policy.changeOfMindDays ?? 30}
                    onChange={(e) => setPolicy({ ...policy, changeOfMindDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={!!policy.blindShippingRequired}
                    onChange={(e) => setPolicy({ ...policy, blindShippingRequired: e.target.checked })} className="accent-orange-500" />
                  Require blind shipping from every partner
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={!!policy.partnerFulfillmentDisclosed}
                    onChange={(e) => setPolicy({ ...policy, partnerFulfillmentDisclosed: e.target.checked })} className="accent-orange-500" />
                  Show partner-fulfillment disclosure at checkout
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={savePolicies} className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-slate-950 font-black">Save policy copy</button>
                {policySaved && <span className="text-emerald-400 font-semibold">Saved — disclosure, FAQ, and documents updated.</span>}
              </div>

              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                Keep <strong>blind shipping</strong> and <strong>partner-fulfillment disclosure</strong> both enabled: the disclosure is what makes
                &quot;name on the box isn&apos;t ours&quot; defensible, and the blind-ship sheet is what stops partner pricing and inserts reaching the customer.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 text-xs animate-pulse">Loading policy copy…</div>
          )}
        </div>
      )}

      {activeTab === "sources" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6"><h3 className="font-bold text-white">Source Certification</h3>
            <p className="text-xs text-slate-400">Internal evidence only. Unknown domains stay on hold. A score of 70 is not enough by itself: non-chain sources also require a recorded test buy.</p></div>
          <div className="grid gap-4">{sourceData.map((source) => (
            <div key={source.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs">
              <div className="flex flex-wrap justify-between gap-3"><div><strong className="text-white text-sm">{source.name}</strong><div className="font-mono text-slate-400">{source.domain}</div></div>
                <div className="text-right"><span className={`px-2 py-1 rounded-full font-bold ${source.canPublish ? "bg-emerald-500/20 text-emerald-300" : source.status === "blocked" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}>{source.status} · {source.score}/100</span><div className="text-[10px] text-slate-500 mt-1">{source.products.length} SKU(s) · {source.testBuyPassed ? `test buy ${source.testOrderId}` : "no test buy"}</div></div></div>
              <p className="text-slate-300 mt-3">{source.reputationSummary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-[10px]">{[["HTTPS",source.httpsValid],["Policies",source.hasPolicies],["Contact",source.hasContact],["Card checkout",source.hasNormalCardCheckout],["Real imprint",source.hasRealImprint]].map(([label,pass])=><span key={String(label)} className={pass ? "text-emerald-400" : "text-rose-400"}>{pass ? "✓" : "✕"} {label}</span>)}</div>
              {source.blockReason && <div className="mt-2 text-rose-300">Reason: {source.blockReason}</div>}
              <div className="mt-3 flex gap-2"><button onClick={() => sourceAction(source.id,"approve_test_buy")} className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">Approve after test buy</button><button onClick={() => sourceAction(source.id,"block")} className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30">Block source</button></div>
            </div>))}</div>
        </div>
      )}

      {activeTab === "monetization" && mon && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-white">Dual-Rail Cutover</h3>
            <p className="text-xs text-slate-400">Approved affiliate link = redirect by default, Stripe off. No program = reseller or hidden. Cashback stays locked until the first commission actually pays.</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={mon.settings.defaultRail === "affiliate"} onChange={(e) => monPut({ target: "settings", defaultRail: e.target.checked ? "affiliate" : "reseller" })} className="accent-orange-500" /> New traffic defaults to redirect</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!mon.settings.resellerFrozen} onChange={(e) => monPut({ target: "settings", resellerFrozen: e.target.checked })} className="accent-orange-500" /> Freeze reseller (day 22+: allowlist only)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!mon.settings.cashbackEnabled} onChange={(e) => monPut({ target: "settings", cashbackEnabled: e.target.checked })} className="accent-orange-500" /> Cashback {mon.settings.firstCommissionPaidAt ? "" : "(locked — no commission paid yet)"}</label>
              <span className="text-slate-500">Outbound clicks: {mon.clicks.total} recent · {mon.clicks.blocked} blocked pre-tap</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h4 className="font-bold text-white text-sm mb-2">Network applications (apply in this order)</h4>
            <div className="divide-y divide-slate-800 text-xs">
              {mon.programs.map((program: any) => (
                <div key={program.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0"><a href={program.signupUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline">{program.displayName}</a>
                    <p className="text-[10px] text-slate-500 max-w-xl">{program.notes}</p></div>
                  <select value={program.status} onChange={(e) => monPut({ target: "program", id: program.id, status: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200">
                    <option value="not_applied">Not applied</option><option value="applied">Applied</option>
                    <option value="approved">Approved</option><option value="rejected">Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h4 className="font-bold text-white text-sm mb-2">Per-SKU rail</h4>
            <p className="mb-3 text-xs text-slate-400 leading-relaxed">
              Paste your real, network-issued HTTPS tracking link into <strong className="text-slate-200">Admin → Monetization → Per-SKU rail → Tracking URL</strong> on the matching SKU.
              Field: <code className="text-amber-400">trackingUrl</code> (database: <code>tracking_url</code>).
              Leave affiliate approval pending (<code>none</code>, or <code>applied</code> after you have submitted an application) until you supply the real link and the source has current live HTTPS scan evidence and certification.
              Do not use example or generated tracking URLs, and do not select <code>approved</code> before both checks pass.
              The link must be the <strong className="text-slate-200">US program tracker</strong> (never a .co.uk/.ca/.de locale link); non-US trackers are rejected.
            </p>
            <div className="overflow-x-auto"><table className="w-full text-[11px] text-left"><thead className="text-slate-500 uppercase text-[9px]"><tr><th className="p-2">SKU</th><th>Rail</th><th>Network</th><th>Tracking URL</th><th>Status</th><th>Have-us-buy-it</th></tr></thead><tbody className="divide-y divide-slate-800">
              {mon.skus.map((sku: any) => (
                <tr key={sku.id}>
                  <td className="p-2 text-white max-w-[200px] truncate">{sku.title}</td>
                  <td><span className={sku.rail.rail === "affiliate" ? "text-emerald-400 font-bold" : sku.rail.rail === "reseller" ? "text-amber-400" : "text-rose-400"}>{sku.rail.rail}</span></td>
                  <td><select defaultValue={sku.affiliateNetwork || ""} onChange={(e) => monPut({ target: "sku", dealId: sku.id, affiliateNetwork: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-1"><option value="">—</option>{["amazon","cj","awin","impact","rakuten","flexoffers","ebay","direct"].map((n) => <option key={n} value={n}>{n}</option>)}</select></td>
                  <td><input defaultValue={sku.trackingUrl || ""} placeholder="https://…" onBlur={(e) => e.target.value !== (sku.trackingUrl || "") && monPut({ target: "sku", dealId: sku.id, trackingUrl: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-1 w-44" /></td>
                  <td><select defaultValue={sku.affiliateStatus} onChange={(e) => monPut({ target: "sku", dealId: sku.id, affiliateStatus: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-1"><option value="none">none</option><option value="applied">applied</option><option value="approved">approved</option><option value="rejected">rejected</option></select></td>
                  <td><input type="checkbox" checked={sku.resellerAllowed} onChange={(e) => monPut({ target: "sku", dealId: sku.id, resellerAllowed: e.target.checked })} className="accent-orange-500" /></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h4 className="font-bold text-white text-sm mb-2">Sponsored slots (one promoted card per screen, always labeled)</h4>
            <div className="divide-y divide-slate-800 text-xs">
              {mon.slots.map((slot: any) => (
                <div key={slot.id} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-white">{slot.brandName} — {slot.headline} (${Number(slot.weeklyFeeUsd).toFixed(0)}/wk)</span>
                  <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={slot.active} onChange={(e) => monPut({ target: "sponsored", id: slot.id, active: e.target.checked })} className="accent-orange-500" /> Active</label>
                </div>
              ))}
            </div>
            <button onClick={() => { const brandName = prompt("Brand"); if (!brandName) return; const headline = prompt("Headline") || "Sponsored deal"; const destinationUrl = prompt("HTTPS destination URL") || ""; const weeklyFeeUsd = Number(prompt("Weekly fee ($)", "250") || 0); monPut({ target: "sponsored", brandName, headline, destinationUrl, weeklyFeeUsd, active: false }); }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 hover:text-white">Add sponsored slot</button>
          </div>
        </div>
      )}

      {activeTab === "price_audit" && (
        <div className="space-y-4"><div className="bg-slate-900 border border-slate-800 rounded-3xl p-6"><h3 className="font-bold text-white">Four-Checkpoint Price Audit</h3><p className="text-xs text-slate-400">Immutable observations at midnight, product view, immediately before payment, and after successful payment. Internal source costs are restricted to admin.</p></div>
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-3xl"><table className="w-full text-[11px] text-left"><thead className="text-slate-500 uppercase text-[9px]"><tr><th className="p-3">Observed</th><th>Checkpoint</th><th>SKU</th><th>Order</th><th>Source snapshot</th><th>Full partner cost</th><th>Sale price</th><th>Total</th><th>Available</th></tr></thead><tbody className="divide-y divide-slate-800">{priceAudit.map((row) => <tr key={row.id}><td className="p-3 text-slate-400 whitespace-nowrap">{new Date(row.observedAt).toLocaleString()}</td><td><span className="px-2 py-1 rounded bg-amber-500/15 text-amber-300">{row.checkpoint.replace(/_/g," ")}</span></td><td className="font-mono">{row.dealId}</td><td className="font-mono">{row.orderId || "—"}</td><td>{formatCurrency(row.sourcePrice)}</td><td>{formatCurrency(row.fullPartnerCost)}</td><td className="text-white font-bold">{formatCurrency(row.salePrice)}</td><td>{row.totalQuoted ? formatCurrency(row.totalQuoted) : "—"}</td><td className={row.available ? "text-emerald-400" : "text-rose-400"}>{row.available ? "yes" : "no"}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === "sku_health" && (
        <div className="space-y-4"><div className="bg-slate-900 border border-slate-800 rounded-3xl p-6"><h3 className="font-bold text-white">SKU Outcome & Kill Controls</h3><p className="text-xs text-slate-400">Partner cancels, change-of-mind, and ugly returns are separate. Auto-hide at 8% ugly returns after 10 delivered; 2 ugly returns in the first 10 hard-kills.</p></div>
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-3xl"><table className="w-full text-xs text-left"><thead className="text-slate-500 uppercase text-[9px]"><tr><th className="p-3">SKU</th><th>Status</th><th>Paid / Delivered</th><th>Cancel</th><th>Change mind</th><th>Ugly</th><th>Record outcome</th></tr></thead><tbody className="divide-y divide-slate-800">{skuHealth.map((sku) => <tr key={sku.id}><td className="p-3 text-white max-w-xs truncate">{sku.title}</td><td><span className={sku.killStatus === "active" ? "text-emerald-400" : sku.killStatus === "review" ? "text-amber-400" : "text-rose-400"}>{sku.killStatus}</span><div className="text-[9px] text-slate-500 max-w-xs">{sku.killReason}</div></td><td>{sku.paid} / {sku.delivered}</td><td>{sku.partnerCancels}</td><td>{sku.changeOfMind}</td><td>{sku.uglyReturns}</td><td><select defaultValue="" onChange={(e) => { if(e.target.value) addOutcome(sku.id,e.target.value); e.target.value=""; }} className="bg-slate-950 border border-slate-700 rounded p-1"><option value="">Add…</option><option value="change_of_mind">Change of mind</option><option value="defect">Defect</option><option value="wrong_item">Wrong item</option><option value="damaged">Damaged</option><option value="not_as_described">Not as described</option><option value="partner_cancel">Partner cancel</option><option value="safety_complaint">Safety complaint</option></select></td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === "fulfillment" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base">Fulfillment Gate — Agent Spend Controls</h3>
            <p className="text-xs text-slate-400 mt-1">
              The agent can <strong className="text-slate-200">never</strong> create or modify a Stripe charge. It may only buy from a partner
              on the company card, and only when every rule passes. Margin is checked after Stripe fees.
            </p>
          </div>

          {gate && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Spend today</span>
                  <div className={`text-xl font-black ${(gate.spentToday || 0) > gate.dailyCap ? "text-rose-400" : "text-amber-400"}`}>
                    ${(gate.spentToday || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">of ${Number(gate.dailyCap).toFixed(0)} cap</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Spend this month</span>
                  <div className={`text-xl font-black ${(gate.spentMonth || 0) > gate.monthlyCap ? "text-rose-400" : "text-white"}`}>
                    ${(gate.spentMonth || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">of ${Number(gate.monthlyCap).toFixed(0)} cap</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Per-order cap</span>
                  <div className="text-xl font-black text-white">${Number(gate.perOrderCap).toFixed(0)}</div>
                  <div className="text-[10px] text-slate-500">{gate.settings?.cardNickname} •••• {gate.settings?.cardLast4}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Margin floor</span>
                  <div className="text-xl font-black text-white">${Number(gate.settings?.minMarginUsd || 0).toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">{Number(gate.settings?.minMarginPercent || 0).toFixed(1)}% min</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Rules & Caps</h4>
                  <span className="text-[10px] text-slate-500">Saved instantly</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  {[
                    { k: "maxPartnerBuyUsd", label: "Per-order cap ($)", type: "number" },
                    { k: "dailySpendCapUsd", label: "Daily cap ($)", type: "number" },
                    { k: "monthlySpendCapUsd", label: "Monthly cap ($)", type: "number" },
                    { k: "minMarginUsd", label: "Min margin ($)", type: "number" },
                    { k: "minMarginPercent", label: "Min margin (%)", type: "number" },
                    { k: "cardLast4", label: "Card last 4", type: "text" },
                  ].map((f) => (
                    <label key={f.k} className="block">
                      <span className="text-slate-400 block mb-1">{f.label}</span>
                      <input
                        type={f.type}
                        defaultValue={gate.settings?.[f.k] ?? ""}
                        onBlur={(e) => saveSettings({ [f.k]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" checked={!!gate.settings?.enabled} className="accent-orange-500"
                      onChange={(e) => saveSettings({ enabled: e.target.checked })} /> Fulfillment enabled
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" checked={!!gate.settings?.allowLossPurchases} className="accent-orange-500"
                      onChange={(e) => saveSettings({ allowLossPurchases: e.target.checked })} /> Allow loss purchases (risky)
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <h4 className="font-bold text-white text-sm">Paid orders awaiting partner buy</h4>
                <div className="divide-y divide-slate-800 text-xs">
                  {orders.filter((o) => o.paymentStatus === "paid" && !(o as any).partnerPurchased).length === 0 && (
                    <p className="text-slate-400 py-3">Nothing waiting. All paid orders have been fulfilled or refunded.</p>
                  )}
                  {orders.filter((o) => o.paymentStatus === "paid" && !(o as any).partnerPurchased).map((o) => (
                    <div key={o.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-amber-400 font-bold">{o.orderNumber}</span>
                        <span className="text-slate-400 ml-2 truncate max-w-[220px] inline-block align-bottom">{o.productTitle}</span>
                        <div className="text-[10px] text-slate-500">
                          Paid ${Number(o.totalAmount).toFixed(2)} · quoted ${Number((o as any).quotedSellPrice || 0).toFixed(2)}
                          {(o as any).fulfillmentHold && <span className="ml-1 text-rose-400 font-bold">⛔ HOLD</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button disabled={gateBusy} onClick={() => authorizePartnerBuy(o.id, Number((o as any).sourceLastSeenPrice || o.dealPrice), false)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold disabled:opacity-50">
                          Authorize buy
                        </button>
                        <button disabled={gateBusy} onClick={() => authorizePartnerBuy(o.id, Number(o.totalAmount) * 1.5, true)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold disabled:opacity-50"
                          title="Attempt a buy that will fail the margin guard — proves the guard works">
                          Test guard
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <h4 className="font-bold text-white text-sm">Agent audit log</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-300 divide-y divide-slate-800">
                    <thead><tr className="text-slate-500 uppercase text-[9px]">
                      <th className="py-2 pr-3">Order</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Result</th>
                      <th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Reason</th><th className="py-2">When</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(gate.recentActions || []).length === 0 && <tr><td colSpan={6} className="py-3 text-slate-500">No agent actions yet.</td></tr>}
                      {(gate.recentActions || []).map((a: any) => (
                        <tr key={a.id}>
                          <td className="py-2 pr-3 font-mono text-amber-400">{a.orderId}</td>
                          <td className="py-2 pr-3">{a.action.replace(/_/g, " ")}</td>
                          <td className="py-2 pr-3"><span className={a.allowed ? "text-emerald-400" : "text-rose-400"}>{a.allowed ? "allowed" : "blocked"}</span></td>
                          <td className="py-2 pr-3">${Number(a.amountUsd || 0).toFixed(2)}</td>
                          <td className="py-2 pr-3 text-slate-400 max-w-xs truncate" title={a.decisionReason}>{a.decisionReason}</td>
                          <td className="py-2 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base">Add New Midnight Deal</h4>
              <button
                onClick={() => setShowAddDealModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Apple iPad Pro 12.9 M2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Audio & Wearables">Audio & Wearables</option>
                    <option value="Computing & Laptops">Computing & Laptops</option>
                    <option value="TV & Home Theater">TV & Home Theater</option>
                    <option value="Home & Appliances">Home & Appliances</option>
                    <option value="Gaming & VR">Gaming & VR</option>
                    <option value="Cameras & Drones">Cameras & Drones</option>
                    <option value="Outdoor & Fitness">Outdoor & Fitness</option>
                    <option value="Fashion & Travel">Fashion & Travel</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple / Sony"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Retail MSRP ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="399.99"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Source Item Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.dealPrice}
                    onChange={(e) => setFormData({ ...formData, dealPrice: e.target.value })}
                    placeholder="89.99"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 border border-amber-500/30 p-3 flex items-center justify-between"><span className="text-slate-400">Calculated sale price</span><strong className="text-amber-400">{pricePreview ? formatCurrency(pricePreview) : "Enter cost and regular price"}</strong></div>
              <p className="text-[11px] text-slate-400">Internal pricing: source cost plus a 10% markup, with estimated processing costs included. Customers see a single product price. Shipping and destination tax are finalized at checkout.</p>
              <div>
                <label className="text-slate-400 block mb-1">Available Quantity</label>
                <input
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-slate-400 block mb-1">Internal source name</span>
                  <input required value={formData.retailer} onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
                    placeholder="Partner business" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none" /></label>
                <label className="block"><span className="text-slate-400 block mb-1">Exact source product URL</span>
                  <input type="url" required value={formData.retailerUrl} onChange={(e) => setFormData({ ...formData, retailerUrl: e.target.value })}
                    placeholder="https://partner.example/product" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none" /></label>
              </div>
              <p className="text-[11px] text-slate-400">The source is scanned and held unless certified. It is internal and never presented as the customer-facing seller.</p>

              <div>
                <label className="text-slate-400 block mb-1">Product Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product overview..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmitting ? "Saving Deal..." : "Publish Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base">Edit Deal #{editingDeal.id}</h4>
              <button
                onClick={() => setEditingDeal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDeal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingDeal.title}
                  onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDeal.originalPrice}
                    onChange={(e) => setEditingDeal({ ...editingDeal, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Source Item Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDeal.dealPrice}
                    onChange={(e) => setEditingDeal({ ...editingDeal, dealPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 border border-amber-500/30 p-3 flex items-center justify-between"><span className="text-slate-400">Calculated sale price</span><strong className="text-amber-400">{pricePreview ? formatCurrency(pricePreview) : "Calculating…"}</strong></div>
              <p className="text-[11px] text-slate-400">Internal pricing: source cost plus a 10% markup with processing included. Existing paid orders are never repriced.</p>
              <div>
                <label className="text-slate-400 block mb-1">Available Quantity</label>
                <input
                  type="number"
                  value={editingDeal.stockQuantity}
                  onChange={(e) => setEditingDeal({ ...editingDeal, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDeal(null)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
