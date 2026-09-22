"use client";

import { useEffect, useMemo, useState } from "react";

type LinkRow = {
  id: number;
  url: string;
  title: string | null;
  asin: string | null;
  domain: string | null;
  listed_price: string | null;
  sale_price: string | null;
  ends_at: string | null;
  check_status: string;
  check_notes: string | null;
  deal_id: number | null;
  review_status: string | null;
  ops_notes: string | null;
  monitor_started_at: string | null;
  last_monitored_at: string | null;
  image_url: string | null;
};

type EditDraft = {
  title?: string;
  url?: string;
  listedPrice?: string;
  salePrice?: string;
  endsAt?: string;
  opsNotes?: string;
};

const inputStyle = {
  background: "#121212",
  color: "#F0E6D8",
  border: "1px solid #262626",
  borderRadius: 10,
  padding: "10px 12px",
  width: "100%",
} as const;

const buttonStyle = {
  background: "#B91C1C",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 800,
  cursor: "pointer",
} as const;

const ghost = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  fontWeight: 700,
} as const;

function remaining(endsAt: string | null) {
  if (!endsAt) return "No timer";
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return "-";
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s left`;
}

function statusOf(row: LinkRow) {
  return row.review_status || "awaiting_verification";
}

export default function DealReviewPage() {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [urls, setUrls] = useState("");
  const [title, setTitle] = useState("");
  const [listedPrice, setListedPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [opsNotes, setOpsNotes] = useState("");
  const [edit, setEdit] = useState<Record<number, EditDraft>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const me = await fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json());
    if (!me.success || me.user?.role !== "admin") {
      setAllowed(false);
      setReady(true);
      return;
    }
    setAllowed(true);
    const inbox = await fetch("/api/deal-inbox", { credentials: "include" }).then((r) => r.json());
    setLinks(inbox.links || []);
    setReady(true);
  };

  useEffect(() => {
    load();
  }, []);

  const sections = useMemo(() => {
    const needs = links.filter((r) => ["awaiting_verification", "held"].includes(statusOf(r)));
    const live = links.filter((r) => statusOf(r) === "monitoring");
    const stopped = links.filter((r) => ["stopped_needs_review", "rejected"].includes(statusOf(r)));
    return { needs, live, stopped };
  }, [links]);

  const stage = async () => {
    setBusy(true);
    const data = await fetch("/api/deal-inbox", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls,
        title: title || undefined,
        listedPrice: listedPrice || undefined,
        salePrice: salePrice || undefined,
        endsAt: endsAt || undefined,
        opsNotes: opsNotes || undefined,
      }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.success ? `Staged ${data.added} link(s) for owner verification.` : data.error || "Save failed");
    if (data.success) {
      setUrls("");
      setTitle("");
      setListedPrice("");
      setSalePrice("");
      setEndsAt("");
      setOpsNotes("");
      load();
    }
  };

  const saveInfo = async (id: number) => {
    const patch = edit[id] || {};
    setBusy(true);
    const data = await fetch("/api/deal-inbox", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: patch.title,
        url: patch.url,
        listedPrice: patch.listedPrice,
        salePrice: patch.salePrice,
        endsAt: patch.endsAt,
        opsNotes: patch.opsNotes,
      }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.success ? `Updated draft #${id}` : data.error || "Update failed");
    setEdit((e) => ({ ...e, [id]: {} }));
    load();
  };

  const act = async (id: number, action: string) => {
    setBusy(true);
    const data = await fetch("/api/deal-inbox/review", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.message || data.error || `${action} done`);
    load();
  };

  const runMonitorNow = async () => {
    setBusy(true);
    const data = await fetch("/api/deal-monitor/run", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(
      data.success
        ? `Monitor run: checked ${data.checked}, still live ${data.stillMonitoring}, stopped ${data.stopped}.`
        : data.error || "Monitor failed",
    );
    load();
  };

  // PARTIAL FILE - continued in next commit
  return <div style={{ padding: 24, color: "#F0E6D8" }}>Loading deal review UI…</div>;
}
