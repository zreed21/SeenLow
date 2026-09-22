import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getSessionUser } from "@/lib/auth";

const AMAZON_TAG = "seenlow-20";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "deal_inbox" (
      "id" serial PRIMARY KEY,
      "url" text NOT NULL UNIQUE,
      "title" text,
      "asin" text,
      "domain" text,
      "listed_price" numeric(10, 2),
      "sale_price" numeric(10, 2),
      "ends_at" timestamp,
      "last_checked_at" timestamp,
      "check_status" text NOT NULL DEFAULT 'queued',
      "check_notes" text,
      "deal_id" integer,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    )
  `);
}

function normalizeAmazonUrl(raw: string): { url: string; asin: string | null; domain: string } {
  let url = raw.trim();
  let domain = "";
  let asin: string | null = null;
  try {
    const u = new URL(url);
    domain = u.hostname.replace(/^www\./, "");
    const asinMatch = u.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (asinMatch) asin = asinMatch[1].toUpperCase();
    if (domain === "amazon.com" || domain.endsWith(".amazon.com") || domain === "amzn.to") {
      if (asin && domain !== "amzn.to") {
        u.hostname = "www.amazon.com";
        u.pathname = `/dp/${asin}`;
        u.search = "";
        u.searchParams.set("tag", AMAZON_TAG);
        url = u.toString();
        domain = "amazon.com";
      }
    }
  } catch {
    domain = "";
  }
  return { url, asin, domain };
}

function parseEndsAt(value: unknown): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const hours = raw.match(/^(\d+(?:\.\d+)?)\s*h/i);
  if (hours) return new Date(Date.now() + Number(hours[1]) * 3600 * 1000);
  const mins = raw.match(/^(\d+)\s*m/i);
  if (mins) return new Date(Date.now() + Number(mins[1]) * 60 * 1000);
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function requireAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return null;
  return user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureTable();
  const rows = await db.execute(sql`
    SELECT id, url, title, asin, domain, listed_price, sale_price, ends_at,
           last_checked_at, check_status, check_notes, deal_id, created_at
    FROM deal_inbox
    ORDER BY id DESC
    LIMIT 200
  `);
  return NextResponse.json({ success: true, links: (rows as { rows?: unknown }).rows || rows });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureTable();
  const body = await request.json();
  const lines = String(body.urls || body.url || "")
    .split(/\r?\n|,/)
    .map((s: string) => s.trim())
    .filter((s: string) => /^https?:\/\//i.test(s));
  if (!lines.length) {
    return NextResponse.json({ success: false, error: "Paste one or more https URLs" }, { status: 400 });
  }
  const title = body.title ? String(body.title) : null;
  const listed = body.listedPrice != null && body.listedPrice !== "" ? Number(body.listedPrice) : null;
  const sale = body.salePrice != null && body.salePrice !== "" ? Number(body.salePrice) : null;
  const endsAt = parseEndsAt(body.endsAt);
  const saved = [];
  for (const line of lines) {
    const n = normalizeAmazonUrl(line);
    await db.execute(sql`
      INSERT INTO deal_inbox (url, title, asin, domain, listed_price, sale_price, ends_at, check_status, check_notes, updated_at)
      VALUES (
        ${n.url},
        ${title},
        ${n.asin},
        ${n.domain || null},
        ${listed},
        ${sale},
        ${endsAt},
        ${sale ? "priced" : "queued"},
        ${sale ? "Manual price saved. Amazon pages often block live fetch." : "Queued. Add sale price if the live check cannot read the page."},
        now()
      )
      ON CONFLICT (url) DO UPDATE SET
        title = COALESCE(EXCLUDED.title, deal_inbox.title),
        listed_price = COALESCE(EXCLUDED.listed_price, deal_inbox.listed_price),
        sale_price = COALESCE(EXCLUDED.sale_price, deal_inbox.sale_price),
        ends_at = COALESCE(EXCLUDED.ends_at, deal_inbox.ends_at),
        updated_at = now()
    `);
    saved.push(n);
  }
  const rows = await db.execute(sql`SELECT * FROM deal_inbox ORDER BY id DESC LIMIT 200`);
  return NextResponse.json({ success: true, added: saved.length, links: (rows as { rows?: unknown }).rows || rows });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureTable();
  const body = await request.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  await db.execute(sql`DELETE FROM deal_inbox WHERE id = ${id}`);
  return NextResponse.json({ success: true });
}
