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

  if (!ready) return <div style={{ padding: 24, color: "#F0E6D8", background: "#0A0A0A", minHeight: "100vh" }}>Loading...</div>;
  if (!allowed) {
    return (
      <div style={{ padding: 24, color: "#F0E6D8", background: "#0A0A0A", minHeight: "100vh" }}>
        Admin sign-in required. Open <a href="/?auth=signin" style={{ color: "#B91C1C" }}>seenlow.com</a> first.
      </div>
    );
  }

  const renderCard = (row: LinkRow, mode: "needs" | "live" | "stopped") => {
    const draft = edit[row.id] || {};
    return (
      <div key={row.id} style={{ background: "#121212", border: "1px solid #262626", borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 700 }}>
          {row.title || row.asin || "Untitled"} · inbox #{row.id}
          {row.deal_id ? ` · catalog #${row.deal_id}` : ""}
        </div>
        <div style={{ fontSize: 12, color: "#A1A1AA", wordBreak: "break-all", marginTop: 4 }}>{row.url}</div>
        <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 6 }}>
          Status <strong style={{ color: "#F0E6D8" }}>{statusOf(row)}</strong>
          {" · "}Sale {row.sale_price ? `$${row.sale_price}` : "-"} / List {row.listed_price ? `$${row.listed_price}` : "-"}
          {" · "}{remaining(row.ends_at)}
          {" · "}check: {row.check_status}
        </div>
        {row.check_notes ? <div style={{ fontSize: 12, color: "#FBBF24", marginTop: 4 }}>{row.check_notes}</div> : null}
        {row.ops_notes ? <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 4 }}>Notes: {row.ops_notes}</div> : null}
        {row.last_monitored_at ? (
          <div style={{ fontSize: 11, color: "#737373", marginTop: 4 }}>
            Last monitor: {new Date(row.last_monitored_at).toLocaleString()}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <input
            defaultValue={row.title || ""}
            placeholder="Title"
            onChange={(e) => setEdit((s) => ({ ...s, [row.id]: { ...draft, title: e.target.value } }))}
            style={inputStyle}
          />
          <input
            defaultValue={row.url}
            placeholder="URL"
            onChange={(e) => setEdit((s) => ({ ...s, [row.id]: { ...draft, url: e.target.value } }))}
            style={inputStyle}
          />
          <input
            defaultValue={row.listed_price || ""}
            placeholder="List price"
            onChange={(e) => setEdit((s) => ({ ...s, [row.id]: { ...draft, listedPrice: e.target.value } }))}
            style={inputStyle}
          />
          <input
            defaultValue={row.sale_price || ""}
            placeholder="Sale price"
            onChange={(e) => setEdit((s) => ({ ...s, [row.id]: { ...draft, salePrice: e.target.value } }))}
            style={inputStyle}
          />
          <input
            placeholder="Timer left 01:22:25"
            onChange={(e) => setEdit((s) => ({ ...s, [row.id]: { ...draft, endsAt: e.target.value } }))}
            style={inputStyle}
          />
          <input
            defaultValue={row.ops_notes || ""}
            placeholder="Ops notes for owner"
            onChange={(e) => setEdit((s) => ({ ...s, [row.id]: { ...draft, opsNotes: e.target.value } }))}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          <button type="button" onClick={() => saveInfo(row.id)} style={{ ...ghost, color: "#FBBF24" }} disabled={busy}>
            Update info
          </button>
          <button type="button" onClick={() => act(row.id, "check")} style={{ ...ghost, color: "#60A5FA" }} disabled={busy}>
            Run price check now
          </button>
          {mode === "needs" ? (
            <>
              <button type="button" onClick={() => act(row.id, "approve")} style={{ ...ghost, color: "#34D399" }} disabled={busy}>
                Approve &amp; publish
              </button>
              <button type="button" onClick={() => act(row.id, "hold")} style={{ ...ghost, color: "#A1A1AA" }} disabled={busy}>
                Hold
              </button>
              <button type="button" onClick={() => act(row.id, "reject")} style={{ ...ghost, color: "#F87171" }} disabled={busy}>
                Reject
              </button>
            </>
          ) : null}
          {mode === "live" ? (
            <button type="button" onClick={() => act(row.id, "remove")} style={{ ...ghost, color: "#F87171" }} disabled={busy}>
              Remove from site
            </button>
          ) : null}
          {mode === "stopped" ? (
            <>
              <button type="button" onClick={() => act(row.id, "requeue")} style={{ ...ghost, color: "#FBBF24" }} disabled={busy}>
                Send back for verification
              </button>
              <button type="button" onClick={() => act(row.id, "approve")} style={{ ...ghost, color: "#34D399" }} disabled={busy}>
                Re-approve &amp; publish
              </button>
              <button type="button" onClick={() => act(row.id, "remove")} style={{ ...ghost, color: "#F87171" }} disabled={busy}>
                Keep off site
              </button>
            </>
          ) : null}
          <a href={row.url} target="_blank" rel="noreferrer" style={{ color: "#B91C1C", fontWeight: 700 }}>
            Open Amazon
          </a>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", color: "#F0E6D8", minHeight: "100vh", background: "#0A0A0A" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Deal review</h1>
          <p style={{ color: "#A1A1AA", fontSize: 14, marginTop: 8 }}>
            Scout stages Amazon links here. Owner verifies before go-live. Once approved and in stock, price/stock is
            rechecked every 30 minutes via <code style={{ color: "#FBBF24" }}>POST /api/deal-monitor/run</code> (external
            scheduler; Vercel Hobby is daily-only — a daily safety-net cron is also configured).
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/admin/links" style={{ color: "#A1A1AA" }}>Live Amazon cards →</a>
          <button type="button" onClick={runMonitorNow} disabled={busy} style={buttonStyle}>
            {busy ? "Working…" : "Run monitor now"}
          </button>
        </div>
      </div>

      {message ? <p style={{ color: "#FBBF24" }}>{message}</p> : null}

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Stage Amazon links</h2>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="https://www.amazon.com/dp/..."
          rows={3}
          style={{ width: "100%", background: "#121212", color: "#F0E6D8", border: "1px solid #262626", borderRadius: 12, padding: 12, marginTop: 10 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inputStyle} />
          <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} placeholder="Time left 01:22:25" style={inputStyle} />
          <input value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} placeholder="List price" style={inputStyle} />
          <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Sale price" style={inputStyle} />
          <input value={opsNotes} onChange={(e) => setOpsNotes(e.target.value)} placeholder="Notes for owner" style={{ ...inputStyle, gridColumn: "1 / -1" }} />
        </div>
        <button type="button" onClick={stage} disabled={busy} style={{ ...buttonStyle, marginTop: 12 }}>
          {busy ? "Working…" : "Stage for verification"}
        </button>
      </section>

      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Needs your verification ({sections.needs.length})</h2>
        <p style={{ color: "#A1A1AA", fontSize: 13 }}>Approve only publishes when a price check says the item is in stock.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {sections.needs.map((r) => renderCard(r, "needs"))}
          {sections.needs.length === 0 ? <p style={{ color: "#737373" }}>Nothing waiting.</p> : null}
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Monitoring live ({sections.live.length})</h2>
        <p style={{ color: "#A1A1AA", fontSize: 13 }}>
          Stops automatically when sold out or discount ≤ 50%, then moves to “Stopped — needs review” (never silent delete).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {sections.live.map((r) => renderCard(r, "live"))}
          {sections.live.length === 0 ? <p style={{ color: "#737373" }}>No deals in active monitoring.</p> : null}
        </div>
      </section>

      <section style={{ marginTop: 36, marginBottom: 48 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Stopped — needs review ({sections.stopped.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {sections.stopped.map((r) => renderCard(r, "stopped"))}
          {sections.stopped.length === 0 ? <p style={{ color: "#737373" }}>No stopped deals.</p> : null}
        </div>
      </section>
    </div>
  );
}
