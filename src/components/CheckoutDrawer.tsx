"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  Truck,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  PackageCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { Deal, Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { SupportNotice } from "@/components/SupportNotice";
import { FulfillmentDisclosure } from "@/components/FulfillmentDisclosure";
import { OrderAcknowledgment } from "@/components/OrderAcknowledgment";
import type { Policy } from "@/lib/policies";
import { StripePaymentSection } from "@/components/StripePaymentSection";

interface CheckoutDrawerProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  currentUser: { id: number; name: string; email: string } | null;
  guestEmail: string;
  onGuestEmail: (email: string) => void;
  onRequestSignIn: () => void;
  userId: string;
}

export function CheckoutDrawer({
  deal,
  isOpen,
  onClose,
  onOrderSuccess,
  currentUser,
  guestEmail,
  onGuestEmail,
  onRequestSignIn,
  userId,
}: CheckoutDrawerProps) {
  const [checkoutEmail, setCheckoutEmail] = useState(guestEmail);
  const [joinList, setJoinList] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: currentUser?.name || "",
    street: "742 Evergreen Terrace",
    apt: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    country: "United States",
    phone: "(415) 555-0198",
  });

  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "apple_pay" | "google_pay">("credit_card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardZip, setCardZip] = useState("94107");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveQuote, setLiveQuote] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [priceIncreaseAccepted, setPriceIncreaseAccepted] = useState(false);
  const [ackAccepted, setAckAccepted] = useState(false);
  const [policies, setPolicies] = useState<Policy | null>(null);
  const [payCfg, setPayCfg] = useState<{ provider: string; publishableKey: string } | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const checkoutForm = useRef<HTMLFormElement>(null);
  const approvedTotal = useRef<number | null>(null);
  const displayedItemPrice = useRef(0);
  const paymentTotal = useRef<number | null>(null);
  const verificationSequence = useRef(0);
  const submitting = useRef(false);
  const addressKey = JSON.stringify(shippingAddress);
  const isStripe = payCfg?.provider === "stripe" && Boolean(payCfg?.publishableKey);

  const verifyNow = async () => {
    if (!deal) return null;
    const sequence = ++verificationSequence.current;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/deals/${deal.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayedPrice: displayedItemPrice.current || Number(deal.finalPrice), state: shippingAddress.state, checkpoint: "before_sale" }),
      });
      const data = await res.json();
      if (sequence !== verificationSequence.current) return { success: false, error: "Delivery details changed. Please check the updated quote." };
      if (data.success) {
        setLiveQuote(data);
        if (approvedTotal.current !== data.total) {
          setPriceIncreaseAccepted(false);
          approvedTotal.current = null;
        }
      }
      return data;
    } catch {
      setErrorMsg("Unable to check the current total. Please try again before paying.");
      return { success: false, error: "Quote verification failed." };
    } finally {
      if (sequence === verificationSequence.current) setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCompletedOrder(null);
      setIsProcessing(false);
      setErrorMsg(null);
      setLiveQuote(null);
      setPriceIncreaseAccepted(false);
      setAckAccepted(false);
      setClientSecret("");
      setPendingOrderId(null);
      approvedTotal.current = null;
      paymentTotal.current = null;
      displayedItemPrice.current = Number(deal?.finalPrice || 0);
      fetch("/api/policies").then((r) => r.json()).then((d) => { if (d.success) setPolicies(d.policies); }).catch(() => {});
      fetch("/api/payments/config").then((r) => r.json()).then((d) => { if (d.success) setPayCfg({ provider: d.provider, publishableKey: d.publishableKey }); }).catch(() => {});
      setCheckoutEmail(currentUser?.email || guestEmail || "");
      setShippingAddress((prev) => ({
        ...prev,
        fullName: currentUser?.name || prev.fullName,
      }));
    }
  }, [isOpen, deal?.id, currentUser?.id]);

  useEffect(() => {
    if (!isOpen || !deal) return;
    setLiveQuote(null);
    setClientSecret("");
    setPendingOrderId(null);
    setPriceIncreaseAccepted(false);
    approvedTotal.current = null;
    paymentTotal.current = null;
    displayedItemPrice.current = Number(deal.finalPrice);
    const timer = setTimeout(() => { void verifyNow(); }, 250);
    return () => { clearTimeout(timer); verificationSequence.current++; };
  }, [isOpen, deal?.id, addressKey]);

  if (!isOpen || !deal) return null;

  const origPrice = Number(deal.originalPrice);
  const itemPrice = Number(liveQuote?.checkoutItemPrice ?? deal.finalPrice);
  const shippingFee = Number(liveQuote?.shippingFee ?? 0);
  const requiredProductFee = Number(liveQuote?.requiredProductFee ?? 0);
  const taxAmount = Number(liveQuote?.taxAmount ?? 0);
  const finalTotal = Number(liveQuote?.total ?? (itemPrice + shippingFee + requiredProductFee + taxAmount).toFixed(2));
  const totalSavings = origPrice - itemPrice;

  // Only the exact total reviewed by the customer can proceed to payment.
  const preflightChecks = async (): Promise<boolean> => {
    if (!checkoutForm.current?.reportValidity()) return false;
    if (!ackAccepted) { setErrorMsg("Please read and accept the fulfillment disclosure to continue."); return false; }
    const email = (currentUser?.email || checkoutEmail).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrorMsg("Please enter a valid email for your order confirmation."); return false; }
    const reviewedTotal = liveQuote?.total;
    const approved = approvedTotal.current;
    const verified = await verifyNow();
    if (!verified?.success) { setErrorMsg(verified?.error || "Unable to verify this product right now."); return false; }
    if (!verified.available) { setErrorMsg("This product is out of stock. No payment was taken."); return false; }
    if ((verified.priceStatus === "increased" && approved !== verified.total) || reviewedTotal !== verified.total) {
      setPriceIncreaseAccepted(false);
      approvedTotal.current = null;
      setLiveQuote({ ...verified, priceStatus: "increased" });
      setErrorMsg("Please review and approve the updated quote. No payment has been taken.");
      return false;
    }
    approvedTotal.current = verified.total;
    displayedItemPrice.current = verified.checkoutItemPrice;
    return true;
  };

  const reviewChangedQuote = (data: any) => {
    const amounts = data.breakdown || data.totals;
    setClientSecret("");
    if (data.restartRequired) setPendingOrderId(null);
    approvedTotal.current = null;
    paymentTotal.current = null;
    setPriceIncreaseAccepted(false);
    if (amounts) setLiveQuote({ ...amounts, success: true, available: true, priceStatus: "increased",
      checkoutItemPrice: amounts.itemPrice, livePrice: data.livePrice ?? amounts.itemPrice,
      displayedPrice: data.displayedPrice ?? itemPrice });
    setErrorMsg(data.error || "Review the updated total before continuing.");
  };

  /** Step 1: create the PENDING order so we own order_id before any payment object. */
  const initOrder = async (): Promise<number | null> => {
    if (pendingOrderId) return pendingOrderId;
    const res = await fetch("/api/orders/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dealId: deal.id,
        userId: currentUser ? `user-${currentUser.id}` : `guest-${checkoutEmail.trim().toLowerCase()}`,
        userName: shippingAddress.fullName,
        userEmail: currentUser?.email || checkoutEmail.trim().toLowerCase(),
        shippingAddress,
        displayedPrice: displayedItemPrice.current,
        acceptedPriceIncrease: priceIncreaseAccepted,
        acceptedTotal: approvedTotal.current,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      if (data.code === "PRICE_INCREASED") {
        reviewChangedQuote(data);
        return null;
      }
      throw new Error(data.error || "Unable to start checkout");
    }
    setPendingOrderId(data.orderId);
    return data.orderId as number;
  };

  /** Step 3: finalize (idempotent; the Stripe webhook is the source of truth). */
  const finalizeOrder = async (orderId: number, method: string) => {
    const res = await fetch(`/api/orders/${orderId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to finalize your order");
    setCompletedOrder(data.order);
    if (!currentUser) {
      const email = checkoutEmail.trim().toLowerCase();
      onGuestEmail(email);
      if (joinList) fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: shippingAddress.fullName, source: "checkout_guest" }) }).catch(() => {});
    }
    setIsProcessing(false);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#f97316", "#ef4444", "#facc15", "#10b981"] });
    } catch {}
    onOrderSuccess(data.order);
  };

  // Same fee-inclusive quote is used by the app and website payment endpoint.
  const startStripePayment = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      if (!(await preflightChecks())) return;
      const orderId = await initOrder();
      if (!orderId) return;
      const res = await fetch("/api/payments/create-intent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, acceptedTotal: approvedTotal.current }),
      });
      const data = await res.json();
      if (!data.success) {
        if (["PRICE_INCREASED", "CHECKOUT_CHANGED"].includes(data.code)) { reviewChangedQuote(data); return; }
        throw new Error(data.error || "Unable to start payment.");
      }
      paymentTotal.current = data.breakdown.total;
      setLiveQuote({ ...liveQuote, ...data.breakdown, checkoutItemPrice: data.breakdown.itemPrice, priceStatus: "unchanged" });
      setClientSecret(data.clientSecret);
    } catch (err: any) { setErrorMsg(err.message || "Unable to start payment."); }
    finally { setIsProcessing(false); submitting.current = false; }
  };

  // Check once more immediately before Stripe.confirmPayment, not just when it mounts.
  const beforeStripeConfirm = async () => {
    if (!(await preflightChecks()) || !pendingOrderId) return false;
    if (approvedTotal.current !== paymentTotal.current) {
      setClientSecret(""); setPendingOrderId(null);
      setErrorMsg("Your total changed. Review the quote and restart payment.");
      return false;
    }
    try {
      const data = await fetch("/api/payments/create-intent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: pendingOrderId, acceptedTotal: approvedTotal.current }),
      }).then((res) => res.json());
      if (!data.success) { reviewChangedQuote(data); return false; }
      return data.breakdown.total === paymentTotal.current;
    } catch { setErrorMsg("Unable to verify your payment total. Please try again."); return false; }
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStripe) { await startStripePayment(); return; }
    if (submitting.current) return;
    submitting.current = true;
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      if (!(await preflightChecks())) return;
      setProcessingStage("Confirming your order…");
      const orderId = await initOrder();
      if (!orderId) return;
      await finalizeOrder(orderId, paymentMethod);
    } catch (err: any) { setErrorMsg(err.message || "Checkout failed. Please try again."); }
    finally { setIsProcessing(false); submitting.current = false; }
  };

  const fillTestVisa = () => {
    setPaymentMethod("credit_card");
    setCardNumber("4242 4242 4242 4242");
    setCardExpiry("08/29");
    setCardCvc("424");
    setCardZip("94107");
  };

  const fillApplePay = () => {
    setPaymentMethod("apple_pay");
    setCardNumber("•••• •••• •••• 8891 (Apple Pay)");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {completedOrder ? "Order Confirmed" : "Secure Checkout"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {completedOrder ? `Order #${completedOrder.orderNumber}` : "Fast, secure ordering and tracked delivery"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          {/* Order Completed View */}
          {completedOrder ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">Your Order Is Confirmed!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Payment was successful. We&apos;re preparing your item and will keep you updated through delivery.
                </p>
              </div>

              {/* Bot Confirmation Receipt Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 font-semibold">
                  <span className="text-slate-400">Order Reference:</span>
                  <span className="text-amber-400 font-mono text-sm">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Order Status:</span>
                  <span className="font-semibold text-emerald-400">Confirmed & Preparing</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Assigned Carrier & Tracking:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {completedOrder.trackingCarrier}: {completedOrder.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Delivery Address:</span>
                  <span className="text-slate-200">{shippingAddress.fullName}, {shippingAddress.city}, {shippingAddress.state}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold">
                  <span className="text-white">Amount Paid (All-In):</span>
                  <span className="text-amber-400 text-sm">{formatCurrency(completedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20"
                >
                  Track Order
                </button>
              </div>
            </div>
          ) : (
            <form ref={checkoutForm} onSubmit={handleProcessCheckout} className="space-y-5">

              {currentUser ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs">
                  <div><span className="text-slate-400">Checking out as</span> <strong className="text-white">{currentUser.name}</strong> <span className="text-slate-500">({currentUser.email})</span></div>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Signed in</span>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Guest checkout</span>
                    <button type="button" onClick={onRequestSignIn} className="text-amber-400 font-semibold hover:underline">Sign in or create account</button>
                  </div>
                  <input type="email" required value={checkoutEmail} onChange={(e) => setCheckoutEmail(e.target.value)} placeholder="Email for order confirmation & tracking"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white outline-none" />
                  <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={joinList} onChange={(e) => setJoinList(e.target.checked)} className="accent-orange-500" /> Also email me the 50 deals every night at 12:15 AM</label>
                </div>
              )}

              {/* Product Brief Box */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{deal.brand}</span>
                  <h4 className="text-xs font-bold text-white truncate">{deal.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-amber-400">{formatCurrency(finalTotal)}</span>
                    <span className="text-[10px] text-slate-400 line-through">{formatCurrency(origPrice)}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Save {deal.discountPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-100 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Prices and availability are subject to change without notice. We check again before payment. If the price increases, you must approve the new price or cancel. If it decreases, you will be charged the price shown when you started checkout.</span>
              </div>

              {liveQuote?.priceStatus === "increased" && !priceIncreaseAccepted && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs space-y-3">
                  <div className="font-bold text-rose-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Quote changed before payment</div>
                  <p className="text-slate-300">Your current item price changed from <span className="line-through">{formatCurrency(liveQuote.displayedPrice)}</span> to <strong className="text-white">{formatCurrency(liveQuote.livePrice)}</strong>. No payment has been taken.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => {
                      approvedTotal.current = liveQuote.total;
                      displayedItemPrice.current = liveQuote.checkoutItemPrice;
                      setPriceIncreaseAccepted(true);
                      setErrorMsg(null);
                    }} className="rounded-lg bg-amber-500 px-3 py-2 font-bold text-slate-950">Approve updated quote</button>
                    <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-2 font-semibold text-white">Cancel order</button>
                  </div>
                </div>
              )}

              {liveQuote && !liveQuote.available && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">This product is currently out of stock. No payment will be taken.</div>
              )}

              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1"><span>Order Summary</span><span className="text-emerald-400 normal-case">{isVerifying || !liveQuote ? "Checking quote…" : "Quote ready"}</span></div>
                <div className="flex justify-between text-slate-300">
                  <span>Item price:</span>
                  <span className="font-semibold text-white">{formatCurrency(itemPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tracked delivery:</span>
                  <span className="font-semibold text-emerald-400">{shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}</span>
                </div>
                {requiredProductFee > 0 && (
                  <div className="flex justify-between text-slate-400"><span>Required product fee:</span><span>+{formatCurrency(requiredProductFee)}</span></div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Estimated {shippingAddress.state} tax ({((liveQuote?.taxRate ?? 0.0825) * 100).toFixed(2)}%):</span>
                  <span>+{formatCurrency(taxAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total due</span>
                    <span className="text-xl font-black text-amber-400">{formatCurrency(finalTotal)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 block">You save</span>
                    <span className="text-xs font-bold text-emerald-400">{formatCurrency(totalSavings)}</span>
                  </div>
                </div>
                <div className="pt-2 mt-1 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  Stripe charges us a processing fee on each card or wallet transaction. Our estimated processing cost is included in the product price — it is not added as a separate checkout surcharge.
                  {isStripe && <> Pay with <strong className="text-slate-200">card</strong>, <strong className="text-slate-200">Apple&nbsp;Pay</strong>, or <strong className="text-slate-200">Google&nbsp;Pay</strong>.</>}
                </div>
              </div>

              {/* Shipping Address Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    Delivery Address
                  </label>
                  <span className="text-[10px] text-slate-400">US only · Lower-48 street address (no AK/HI/PO boxes)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <input
                      type="text"
                      placeholder="Apt, Suite, Unit"
                      value={shippingAddress.apt || ""}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apt: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="State (CA)"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Zip"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method & Test Fillers (simulation mode only) */}
              {!isStripe && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    Payment Method
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={fillTestVisa}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                    >
                      Fill Test Visa
                    </button>
                    <button
                      type="button"
                      onClick={fillApplePay}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      Apple Pay
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Card Number (4242 4242 4242 4242)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <FulfillmentDisclosure p={policies} />
              <OrderAcknowledgment accepted={ackAccepted} onAccept={setAckAccepted} policies={policies} />

              {isStripe ? (
                clientSecret ? (
                  <StripePaymentSection
                    publishableKey={payCfg!.publishableKey}
                    clientSecret={clientSecret}
                    totalLabel={formatCurrency(finalTotal)}
                    disabled={!ackAccepted || isVerifying || !liveQuote?.available}
                    beforeConfirm={beforeStripeConfirm}
                    onPaid={async () => { setIsProcessing(true); try { await finalizeOrder(pendingOrderId!, "stripe"); } catch (e: any) { setErrorMsg(e.message); setIsProcessing(false); } }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startStripePayment}
                    disabled={isProcessing || isVerifying || !liveQuote || !ackAccepted || liveQuote?.available === false || (liveQuote?.priceStatus === "increased" && !priceIncreaseAccepted)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isProcessing ? "Preparing secure payment…" : `Continue to payment • ${formatCurrency(finalTotal)}`}</span>
                  </button>
                )
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing || isVerifying || !liveQuote || !ackAccepted || liveQuote?.available === false || (liveQuote?.priceStatus === "increased" && !priceIncreaseAccepted)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{processingStage || "Processing Your Order..."}</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{liveQuote ? `Place demo order • ${formatCurrency(finalTotal)}` : "Calculating total…"}</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isStripe ? "Secured by Stripe • Apple Pay & Google Pay supported" : "Secure payment and tracked delivery (demo mode)"}</span>
              </div>
              <SupportNotice compact />

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
