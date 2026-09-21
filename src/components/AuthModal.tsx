"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, AlertCircle } from "lucide-react";
import { SeenLowLogo } from "@/components/SeenLowLogo";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  balance: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: SessionUser) => void;
  initialMode?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscribe, setSubscribe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, subscribe }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Authentication failed");
      onAuthenticated(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SeenLowLogo variant="icon" size="sm" />
            <div>
              <h3 className="font-black text-white text-base">
                {mode === "login" ? "Sign in to SeenLow" : "Create your SeenLow account"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Lowest we&apos;ve seen. Checked again before you tap.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 text-slate-400 hover:text-white border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "login" ? "bg-[#B91C1C] text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "register" ? "bg-[#B91C1C] text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 text-xs">
          {mode === "register" && (
            <label className="block">
              <span className="text-slate-400">Name</span>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-[#B91C1C] text-white outline-none"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-slate-400">Email</span>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@seenlow.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-[#B91C1C] text-white outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-slate-400">Password</span>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-[#B91C1C] text-white outline-none"
              />
            </div>
          </label>

          {mode === "register" && (
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="accent-red-600"
              />
              Email me the 50 deals every night at 12:15 AM
            </label>
          )}

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-black flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-red-950/40"
          >
            {busy ? "Please wait..." : mode === "login" ? "Sign in to SeenLow" : "Create SeenLow account"}
          </button>

          {mode === "login" && (
            <p className="text-[11px] text-slate-500 text-center">
              Demo: sarah.connor@opportunitydeals.com / fire2024
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
