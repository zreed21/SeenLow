"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export function NewsletterSignup({
  compact = false,
  source = "website",
  defaultEmail = "",
}: {
  compact?: boolean;
  source?: string;
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStatus("done");
      setMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Unable to subscribe.");
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
        <CheckCircle2 className="w-4 h-4" /> {message}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "flex gap-2" : "space-y-2"}>
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
          <span>Get tonight&apos;s lowest-tracked deals by email at 12:15 AM</span>
        </div>
      )}
      <div className="flex gap-2 w-full">
        <div className="relative flex-1">
          <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@seenlow.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#B91C1C] text-xs text-white outline-none"
          />
        </div>
        <button
          disabled={status === "busy"}
          className="px-4 py-2.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-black whitespace-nowrap shadow-md shadow-red-950/30 disabled:opacity-50"
        >
          {status === "busy" ? "Joining..." : "Join list"}
        </button>
      </div>
      {status === "error" && <p className="text-[11px] text-red-400">{message}</p>}
      {!compact && (
        <p className="text-[10px] text-slate-500">
          Seen low. Tap through. No spam, 1-click unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
