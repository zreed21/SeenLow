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
  last_checked_at: string | null;
  check_status: string;
  check_notes: string | null;
  deal_id: number | null;
};

function remaining(endsAt: string | null) {
  if (!endsAt) return "No timer set";
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return "—";
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 48) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  return `${h}h ${m}m ${s}s left`;
}

export default function DealInboxPage() {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [urls, setUrls] = useState("");
  const [title, setTitle] = useState("");
  const [listedPrice, setListedPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);
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
    const data = await fetch("/api/deal-inbox", { credentials: "include" }).then((r) => r.json());
    setLinks(data.links || []);
    setReady(true);
  };

  useEffect(() => {
    load();
    const t = setInterval(() => setLinks((rows) => [...rows]), 1000);
    return () => clearInterval(t);
  }, []);

  const live = useMemo(() => links, [links]);

  const submit = async () => {
    setBusy(true);
    setMessage("");
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
      }),
    }).then((r) => r.json());
    setBusy(false);
    if (!data.success) {
      setMessage(data.error || "Save failed");
      return;
    }
    setLinks(data.links || []);
    setUrls("");
    setMessage(`Saved ${data.added} URL(s). Amazon links get tag=seenlow-20.`);
  };

  const remove = async (id: number) => {
    await fetch("/api/deal-inbox", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  if (!ready) return <div style={{ padding: 24, color: "#F0E6D8" }}>Loading…</div>;
  if (!allowed) {
    return (
      <div style={{ padding: 24, color: "#F0E6D8" }}>
        Admin sign-in required. Open <a href="/?auth=signin" style={{ color: "#B91C1C" }}>seenlow.com</a> and sign in first.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px", color: "#F0E6D8", minHeight: "100vh", background: "#0A0A0A" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Deal URL inbox</h1>
      <p style={{ color: "#A1A1AA", fontSize: 14, marginBottom: 20 }}>
        Paste Amazon or other HTTPS product URLs. They stay in this list. Add the sale price and how long the markdown lasts.
        Live Amazon fetches from Vercel often time out, so the price you type is the source of truth until a later checker works.
      </p>

      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder={"https://www.amazon.com/dp/B09YTXJM43\nhttps://amzn.to/...."}
        rows={6}
        style={{ width: "100%", background: "#121212", color: "#F0E6D8", border: "1px solid #262626", borderRadius: 12, padding: 12 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" style={inputStyle} />
        <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} placeholder="Time left: 4h or 2026-09-21T23:00" style={inputStyle} />
        <input value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} placeholder="List price e.g. 39.99" style={inputStyle} />
        <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Sale price e.g. 9.99" style={inputStyle} />
      </div>

      <button onClick={submit} disabled={busy} style={buttonStyle}>
        {busy ? "Saving…" : "Save URLs"}
      </button>
      {message ? <p style={{ marginTop: 10, color: "#FBBF24" }}>{message}</p> : null}

      <h2 style={{ marginTop: 32, fontSize: 18, fontWeight: 800 }}>Saved links</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {live.map((row) => (
          <div key={row.id} style={{ background: "#121212", border: "1px solid #262626", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 700 }}>{row.title || row.asin || row.domain || "Untitled"}</div>
            <div style={{ fontSize: 12, color: "#A1A1AA", wordBreak: "break-all" }}>{row.url}</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              Sale {row.sale_price ? `$${row.sale_price}` : "—"} · List {row.listed_price ? `$${row.listed_price}` : "—"} · {remaining(row.ends_at)}
            </div>
            <div style={{ fontSize: 12, color: "#737373" }}>{row.check_notes}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <a href={row.url} target="_blank" rel="noreferrer" style={{ color: "#B91C1C" }}>Open</a>
              <button onClick={() => remove(row.id)} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        ))}
        {live.length === 0 ? <p style={{ color: "#737373" }}>No URLs yet.</p> : null}
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#121212",
  color: "#F0E6D8",
  border: "1px solid #262626",
  borderRadius: 10,
  padding: "10px 12px",
} as const;

const buttonStyle = {
  marginTop: 12,
  background: "#B91C1C",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 800,
  cursor: "pointer",
} as const;
