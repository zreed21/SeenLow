"use client";

import React, { useEffect, useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";

/**
 * Real Stripe payment surface: Apple Pay & Google Pay (Express Checkout) plus a
 * card Payment Element. Mounted only when the backend reports provider "stripe".
 * The same component is drop-in reusable by the future website.
 */

let stripePromiseCache: Promise<Stripe | null> | null = null;
function stripePromise(pk: string) {
  if (!stripePromiseCache) stripePromiseCache = loadStripe(pk);
  return stripePromiseCache;
}

function InnerForm({ totalLabel, onPaid, onError, beforeConfirm, disabled }: { totalLabel: string; onPaid: () => void; onError: (m: string) => void; beforeConfirm: () => Promise<boolean>; disabled?: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!stripe || !elements || disabled || busy) return;
    setBusy(true);
    try {
      if (!(await beforeConfirm())) { onError("Review the latest checkout quote before paying."); return; }
      const submission = await elements.submit();
      if (submission.error) { onError(submission.error.message || "Check your payment details."); return; }
      const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
      if (error) { onError(error.message || "Payment failed."); return; }
      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) onPaid();
    } catch { onError("Unable to confirm payment. Please check your order before retrying."); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <ExpressCheckoutElement
        onConfirm={confirm}
        options={{ buttonType: { applePay: "buy", googlePay: "buy" } }}
      />
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span className="h-px flex-1 bg-slate-800" /> or pay with card <span className="h-px flex-1 bg-slate-800" />
      </div>
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="button"
        onClick={confirm}
        disabled={busy || disabled || !stripe}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Lock className="w-4 h-4" /> {busy ? "Processing…" : `Pay ${totalLabel}`}
      </button>
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secured by Stripe · Apple Pay & Google Pay supported
      </div>
    </div>
  );
}

export function StripePaymentSection({
  publishableKey,
  clientSecret,
  totalLabel,
  onPaid,
  beforeConfirm,
  disabled,
}: {
  publishableKey: string;
  clientSecret: string;
  totalLabel: string;
  onPaid: () => void;
  beforeConfirm: () => Promise<boolean>;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const promise = useMemo(() => stripePromise(publishableKey), [publishableKey]);

  if (!clientSecret) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      <Elements stripe={promise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#f97316" } } }}>
        <InnerForm totalLabel={totalLabel} onPaid={onPaid} onError={setError} beforeConfirm={beforeConfirm} disabled={disabled} />
      </Elements>
    </div>
  );
}
