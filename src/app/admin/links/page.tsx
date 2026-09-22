"use client";

import { useEffect, useState } from "react";

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
};

type CardRow = {
  id: number;
  title: string;
  retailer: string;
  retailerUrl: string;
  trackingUrl: string | null;
  originalPrice: string;
  dealPrice: string;
  isActive: boolean;
  okToSell: boolean;
  affiliateStatus: string;
  ctaType: string;
  dealExpiresAt: string | null;
};

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

const inputStyle = { background: "#121212", color: "#F0E6D8", border: "1px solid #262626", borderRadius: 10, padding: "10px 12px", width: "100%" } as const;
const buttonStyle = { marginTop: 12, background: "#B91C1C", color: "white", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" } as const;

export default function DealInboxPage() {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [urls, setUrls] = useState("");
  const [title, setTitle] = useState("");
  const [listedPrice, setListedPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [edit, setEdit] = useState<Record<number, Partial<CardRow> & { timer?: string }>>({});
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
    const [inbox, live] = await Promise.all([
      fetch("/api/deal-inbox", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/cards", { credentials: "include" }).then((r) => r.json()),
    ]);
    setLinks(inbox.links || []);
    setCards(live.cards || []);
    setReady(true);
  };

  useEffect(() => {
    load();
    const t = setInterval(() => setCards((rows) => [...rows]), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async () => {
    setBusy(true);
    const data = await fetch("/api/deal-inbox", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls, title: title || undefined, listedPrice: listedPrice || undefined, salePrice: salePrice || undefined, endsAt: endsAt || undefined }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.success ? `Saved ${data.added}. Timer ${data.endsAt ? "set" : "not parsed — use 01:22:25"}.` : (data.error || "Save failed"));
    if (data.success) { setUrls(""); load(); }
  };

  const publishInbox = async (id: number) => {
    setBusy(true);
    const data = await fetch("/api/deal-inbox/publish", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.message || data.error || "Publish failed");
    load();
  };

  const saveCard = async (id: number) => {
    const patch = edit[id] || {};
    setBusy(true);
    const data = await fetch("/api/admin/cards", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: patch.title,
        retailerUrl: patch.retailerUrl,
        originalPrice: patch.originalPrice,
        dealPrice: patch.dealPrice,
        dealExpiresAt: patch.timer,
      }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.success ? `Updated card #${id}` : (data.error || "Update failed"));
    setEdit((e) => ({ ...e, [id]: {} }));
    load();
  };

  const setLive = async (id: number, on: boolean) => {
    setBusy(true);
    const data = await fetch("/api/admin/cards", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: on }),
    }).then((r) => r.json());
    setBusy(false);
    setMessage(data.success ? (on ? `Published #${id}` : `Removed #${id} from homepage`) : (data.error || "Failed"));
    load();
  };

  const removeInbox = async (id: number) => {
    await fetch("/api/deal-inbox", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  if (!ready) return <div style={{ padding: 24, color: "#F0E6D8" }}>Loading...</div>;
  if (!allowed) {
    return <div style={{ padding: 24, color: "#F0E6D8" }}>Admin sign-in required. Open <a href="/?auth=signin" style={{ color: "#B91C1C" }}>seenlow.com</a> first.</div>;
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px", color: "#F0E6D8", minHeight: "100vh", background: "#0A0A0A" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Amazon cards</h1>
      <p style={{ color: "#A1A1AA", fontSize: 14 }}>
        Live homepage cards first. Draft URLs below. Timer format 01:22:25.{" "}
        <a href="/admin/deal-review" style={{ color: "#B91C1C", fontWeight: 700 }}>Deal review / scout flow →</a>
      </p>
      {message ? <p style={{ color: "#FBBF24" }}>{message}</p> : null}

      <h2 style={{ marginTop: 28, fontSize: 18, fontWeight: 800 }}>On the site</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {cards.map((card) => {
          const draft = edit[card.id] || {};
          return (
            <div key={card.id} style={{ background: "#121212", border: "1px solid #262626", borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 700 }}>{card.title} · #{card.id} · {card.isActive && card.okToSell ? "LIVE" : "HIDDEN"}</div>
              <div style={{ fontSize: 12, color: "#A1A1AA" }}>{remaining(card.dealExpiresAt)} · {card.ctaType} · {card.affiliateStatus}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                <input defaultValue={card.title} onChange={(e) => setEdit((s) => ({ ...s, [card.id]: { ...draft, title: e.target.value } }))} style={inputStyle} />
                <input defaultValue={card.retailerUrl} onChange={(e) => setEdit((s) => ({ ...s, [card.id]: { ...draft, retailerUrl: e.target.value } }))} style={inputStyle} />
                <input defaultValue={card.originalPrice} onChange={(e) => setEdit((s) => ({ ...s, [card.id]: { ...draft, originalPrice: e.target.value } }))} placeholder="List" style={inputStyle} />
                <input defaultValue={card.dealPrice} onChange={(e) => setEdit((s) => ({ ...s, [card.id]: { ...draft, dealPrice: e.target.value } }))} placeholder="Sale" style={inputStyle} />
                <input placeholder="New time left 01:22:25" onChange={(e) => setEdit((s) => ({ ...s, [card.id]: { ...draft, timer: e.target.value } }))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <a href={card.trackingUrl || card.retailerUrl} target="_blank" rel="noreferrer" style={{ color: "#B91C1C" }}>Open Amazon</a>
                <button onClick={() => saveCard(card.id)} style={{ background: "none", border: "none", color: "#FBBF24", cursor: "pointer" }}>Save edits</button>
                {card.isActive ? (
                  <button onClick={() => setLive(card.id, false)} style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}>Remove from site</button>
                ) : (
                  <button onClick={() => setLive(card.id, true)} style={{ background: "none", border: "none", color: "#34D399", cursor: "pointer" }}>Publish</button>
                )}
              </div>
            </div>
          );
        })}
        {cards.length === 0 ? <p style={{ color: "#737373" }}>No Amazon catalog cards yet.</p> : null}
      </div>

      <h2 style={{ marginTop: 36, fontSize: 18, fontWeight: 800 }}>Add / draft URLs</h2>
      <textarea value={urls} onChange={(e) => setUrls(e.target.value)} placeholder="https://www.amazon.com/dp/..." rows={4} style={{ width: "100%", background: "#121212", color: "#F0E6D8", border: "1px solid #262626", borderRadius: 12, padding: 12, marginTop: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inputStyle} />
        <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} placeholder="Time left 01:22:25" style={inputStyle} />
        <input value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} placeholder="List price" style={inputStyle} />
        <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Sale price" style={inputStyle} />
      </div>
      <button onClick={submit} disabled={busy} style={buttonStyle}>{busy ? "Working" : "Save to drafts"}</button>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {links.map((row) => (
          <div key={row.id} style={{ background: "#121212", border: "1px solid #262626", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 700 }}>{row.title || row.asin || "Draft"}{row.deal_id ? ` · published #${row.deal_id}` : ""}</div>
            <div style={{ fontSize: 12, color: "#A1A1AA", wordBreak: "break-all" }}>{row.url}</div>
            <div style={{ marginTop: 6 }}>Sale {row.sale_price ? `$${row.sale_price}` : "-"} · {remaining(row.ends_at)}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => publishInbox(row.id)} style={{ background: "none", border: "none", color: "#34D399", cursor: "pointer" }}>Publish to site</button>
              <button onClick={() => removeInbox(row.id)} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer" }}>Delete draft</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
