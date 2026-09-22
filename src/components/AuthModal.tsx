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

  // Hardcoded hex colors: html.light remaps Tailwind `text-white` / slate-* to dark
  // ink, which made inputs black-on-black inside this always-dark modal.
  const fieldClass =
    "w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#404040] focus:border-[#B91C1C] text-[#FFFFFF] placeholder:text-[#737373] caret-white outline-none [color-scheme:dark] [&:-webkit-autofill]:[-webkit-text-fill-color:#FFFFFF] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0A0A0A]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#121212] border border-[#404040] rounded-3xl p-6 shadow-2xl space-y-5"
        style={{ color: "#E5E5E5", colorScheme: "dark" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SeenLowLogo variant="icon" size="sm" />
            <div>
              <h3 className="font-black text-base" style={{ color: "#FFFFFF" }}>
                {mode === "login" ? "Sign in to SeenLow" : "Create your SeenLow account"}
              </h3>
              <p className="text-[11px]" style={{ color: "#A3A3A3" }}>
                Lowest we&apos;ve seen. Checked again before you tap.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A1A1A] border border-[#404040] hover:opacity-90"
            style={{ color: "#A3A3A3" }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#404040] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "login" ? "bg-[#B91C1C]" : "hover:opacity-90"
            }`}
            style={{ color: mode === "login" ? "#FFFFFF" : "#A3A3A3" }}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "register" ? "bg-[#B91C1C]" : "hover:opacity-90"
            }`}
            style={{ color: mode === "register" ? "#FFFFFF" : "#A3A3A3" }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 text-xs">
          {mode === "register" && (
            <label className="block">
              <span style={{ color: "#A3A3A3" }}>Name</span>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-2.5" style={{ color: "#737373" }} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={fieldClass}
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span style={{ color: "#A3A3A3" }}>Email</span>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3 top-2.5" style={{ color: "#737373" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={fieldClass}
                autoComplete="email"
              />
            </div>
          </label>

          <label className="block">
            <span style={{ color: "#A3A3A3" }}>Password</span>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-2.5" style={{ color: "#737373" }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </label>

          {mode === "register" && (
            <label className="flex items-center gap-2" style={{ color: "#D4D4D4" }}>
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
            <div
              className="flex items-center gap-2 p-2.5 rounded-xl border"
              style={{ background: "rgba(69,10,10,0.4)", borderColor: "rgba(127,29,29,0.6)", color: "#FCA5A5" }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] font-black flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-red-950/40"
            style={{ color: "#FFFFFF" }}
          >
            {busy ? "Please wait..." : mode === "login" ? "Sign in to SeenLow" : "Create SeenLow account"}
          </button>
        </form>
      </div>
    </div>
  );
}
