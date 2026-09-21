"use client";

import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Printer,
  Copy,
  Terminal,
  AlertCircle
} from "lucide-react";
import { Order, OrderHistoryItem } from "@/types";
import { formatCurrency, parseJsonSafe } from "@/lib/utils";
import { SupportNotice } from "@/components/SupportNotice";
import { orderAmounts } from "@/lib/orderAmounts";

interface OrdersTrackerViewProps {
  orders: Order[];
  onRefreshOrders: () => void;
  onAdvanceOrderStatus: (orderId: number, nextStatus: string) => void;
}

export function OrdersTrackerView({
  orders,
  onRefreshOrders,
  onAdvanceOrderStatus,
}: OrdersTrackerViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Synchronize selected order if list updates
  React.useEffect(() => {
    if (orders.length > 0) {
      if (!selectedOrder) {
        setSelectedOrder(orders[0]);
      } else {
        const found = orders.find((o) => o.id === selectedOrder.id);
        if (found) setSelectedOrder(found);
      }
    }
  }, [orders]);

  const copyTrackingToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const dropshipStages = [
    { key: "payment_received", label: "Payment Confirmed", icon: Receipt },
    { key: "retailer_order_placed", label: "Order Preparing", icon: Sparkles },
    { key: "shipped", label: "Shipped & In Transit", icon: Truck },
    { key: "out_for_delivery", label: "Out For Delivery", icon: Package },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case "payment_received": return 0;
      case "retailer_order_placed":
      case "retailer_processing": return 1;
      case "shipped": return 2;
      case "out_for_delivery": return 3;
      case "delivered": return 4;
      default: return 0;
    }
  };

  const getStatusLabel = (status: string) => ({
    payment_received: "Payment confirmed",
    retailer_order_placed: "Order preparing",
    retailer_processing: "Order preparing",
    shipped: "Shipped",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }[status] || "Processing");

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Package className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">My Orders & Delivery Tracker</h2>
          </div>
          <p className="text-xs text-slate-400">
            Follow every order from payment confirmation through tracked delivery to your door.
          </p>
        </div>

        <button
          onClick={onRefreshOrders}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition self-start sm:self-center"
        >
          Sync Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Orders Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our Top 50 Deals and select Order Now to purchase your first deal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Orders List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Orders ({orders.length})
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const shippingAddr = parseJsonSafe<any>(order.shippingAddress, {});

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-850 border-amber-500/50 shadow-xl shadow-amber-500/5"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-amber-400 font-bold text-xs">{order.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                            {getStatusLabel(order.dropshipStatus)}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate mt-1">{order.productTitle}</h4>
                        <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                          <span>Order total</span>
                          <span className="font-bold text-white">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Order Detail & Live Dropship Stepper */}
          {selectedOrder && (
            <div className="lg:col-span-8 space-y-6">
              
              {/* Order Overview Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Reference</span>
                    <h3 className="text-xl font-mono font-black text-white">{selectedOrder.orderNumber}</h3>
                    <div className="text-xs text-slate-400">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${selectedOrder.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Printable Invoice</span>
                    </a>
                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Invoice Receipt</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Dropship Milestone Stepper */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Order & Delivery Progress
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {dropshipStages.map((stage, idx) => {
                      const currentIdx = getStageIndex(selectedOrder.dropshipStatus);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      const Icon = stage.icon;

                      return (
                        <div key={stage.key} className="space-y-1.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all ${
                              isComplete
                                ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                                : "bg-slate-800 text-slate-500 border border-slate-700"
                            } ${isCurrent ? "ring-2 ring-amber-400 animate-pulse" : ""}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div
                            className={`text-[10px] font-semibold leading-tight ${
                              isComplete ? "text-white" : "text-slate-500"
                            }`}
                          >
                            {stage.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advance Milestone Simulator (for interactive preview) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">
                      <strong>Demo tracking:</strong> Advance this order to preview delivery updates
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {selectedOrder.dropshipStatus !== "shipped" && (
                      <button
                        onClick={() => onAdvanceOrderStatus(selectedOrder.id, "shipped")}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-semibold"
                      >
                        Advance to Shipped
                      </button>
                    )}
                    {selectedOrder.dropshipStatus === "shipped" && (
                      <button
                        onClick={() => onAdvanceOrderStatus(selectedOrder.id, "out_for_delivery")}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-semibold"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {selectedOrder.dropshipStatus === "out_for_delivery" && (
                      <button
                        onClick={() => onAdvanceOrderStatus(selectedOrder.id, "delivered")}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">Tracking Details</div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Order number:</span>
                      <span className="font-mono text-amber-400 font-semibold">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Carrier:</span>
                      <span className="font-semibold text-white">{selectedOrder.trackingCarrier || "UPS"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Tracking code:</span>
                      <button onClick={() => copyTrackingToClipboard(selectedOrder.trackingNumber || "1Z999AA10123456784")} className="font-mono text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                        <span>{selectedOrder.trackingNumber || "1Z999AA10123456784"}</span><Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                    {copiedTracking && <div className="text-[10px] text-emerald-400 text-right">Copied to clipboard!</div>}
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">Payment Summary</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Item price:</span>
                      <span className="text-white font-semibold">{formatCurrency(orderAmounts(selectedOrder).itemPrice)}</span>
                    </div>
                    {orderAmounts(selectedOrder).requiredProductFee > 0 && <div className="flex justify-between text-slate-400"><span>Required product fee:</span><span>{formatCurrency(orderAmounts(selectedOrder).requiredProductFee)}</span></div>}
                    <div className="flex justify-between text-slate-400">
                      <span>Tax:</span><span>+{formatCurrency(selectedOrder.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery:</span><span className="text-emerald-400 font-semibold">{Number(selectedOrder.shippingFee) === 0 ? "FREE" : formatCurrency(selectedOrder.shippingFee)}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-white">
                      <span>Total paid:</span><span className="text-amber-400">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="text-right text-[11px] font-bold text-emerald-400">You saved {formatCurrency(selectedOrder.customerSavings)}</div>
                  </div>
                </div>

                <SupportNotice />

                {/* Timeline History Stepper */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Carrier Tracking Milestones
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    {(selectedOrder.history && selectedOrder.history.length > 0) ? (
                      selectedOrder.history.map((h, i) => (
                        <div key={h.id || i} className="flex items-start gap-3 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{h.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{h.description}</p>
                            {h.location && (
                              <span className="text-[10px] text-slate-500 italic block mt-0.5">Location: {h.location}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400">Awaiting carrier first scan...</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Invoice Receipt Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">Opportunity Deals Concierge Invoice</h4>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs space-y-3 font-mono">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span>Invoice Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                <span className="text-amber-400 font-bold">{selectedOrder.orderNumber}</span>
              </div>

              <div>
                <div className="text-slate-400 text-[10px] uppercase">Billed & Shipped To:</div>
                <div className="text-white font-semibold">{selectedOrder.userName}</div>
                <div className="text-slate-300">
                  {parseJsonSafe<any>(selectedOrder.shippingAddress, {}).street}, {parseJsonSafe<any>(selectedOrder.shippingAddress, {}).city}, {parseJsonSafe<any>(selectedOrder.shippingAddress, {}).state} {parseJsonSafe<any>(selectedOrder.shippingAddress, {}).zipCode}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex justify-between text-white font-bold">
                  <span>Item: {selectedOrder.productTitle}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Regular price:</span>
                  <span className="line-through">{formatCurrency(selectedOrder.originalMsrp)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Item price:</span>
                  <span>{formatCurrency(orderAmounts(selectedOrder).itemPrice)}</span>
                </div>
                {orderAmounts(selectedOrder).requiredProductFee > 0 && <div className="flex justify-between text-slate-400"><span>Required product fee:</span><span>{formatCurrency(orderAmounts(selectedOrder).requiredProductFee)}</span></div>}
                <div className="flex justify-between text-slate-400">
                  <span>Tax:</span>
                  <span>+{formatCurrency(selectedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery:</span>
                  <span className="text-emerald-400">{Number(selectedOrder.shippingFee) === 0 ? "FREE" : formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-amber-400">
                  <span>Total Amount Paid:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="text-right text-emerald-400 font-bold text-[11px]">
                  Net Customer Savings: {formatCurrency(selectedOrder.customerSavings)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
