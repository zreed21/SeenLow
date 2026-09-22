import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { parseEndsAt } from "@/lib/dealInboxTime";
import { ensureDealInboxTable, inboxRows } from "@/lib/dealInboxSchema";

const AMAZON_TAG = "seenlow-20";

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

async function requireAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return null;
  return user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureDealInboxTable();
  const rows = await db.execute(sql`
    SELECT id, url, title, asin, domain, listed_price, sale_price, ends_at,
           last_checked_at, check_status, check_notes, deal_id, created_at,
           review_status, ops_notes, monitor_started_at, last_monitored_at, image_url, updated_at
    FROM deal_inbox
    ORDER BY id DESC
    LIMIT 200
  `);
  return NextResponse.json({ success: true, links: inboxRows(rows) });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureDealInboxTable();
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
  const opsNotes = body.opsNotes != null ? String(body.opsNotes) : null;
  const saved = [];
  for (const line of lines) {
    const n = normalizeAmazonUrl(line);
    await db.execute(sql`
      INSERT INTO deal_inbox (
        url, title, asin, domain, listed_price, sale_price, ends_at,
        check_status, check_notes, review_status, ops_notes, updated_at
      )
      VALUES (
        ${n.url},
        ${title},
        ${n.asin},
        ${n.domain || null},
        ${listed},
        ${sale},
        ${endsAt},
        ${sale ? "priced" : "queued"},
        ${endsAt ? "Timer saved as time remaining." : (sale ? "Manual price saved." : "Queued. Add sale price for owner verification.")},
        'awaiting_verification',
        ${opsNotes},
        now()
      )
      ON CONFLICT (url) DO UPDATE SET
        title = COALESCE(EXCLUDED.title, deal_inbox.title),
        listed_price = COALESCE(EXCLUDED.listed_price, deal_inbox.listed_price),
        sale_price = COALESCE(EXCLUDED.sale_price, deal_inbox.sale_price),
        ends_at = COALESCE(EXCLUDED.ends_at, deal_inbox.ends_at),
        ops_notes = COALESCE(EXCLUDED.ops_notes, deal_inbox.ops_notes),
        review_status = CASE
          WHEN deal_inbox.review_status IN ('monitoring', 'stopped_needs_review') THEN deal_inbox.review_status
          ELSE 'awaiting_verification'
        END,
        updated_at = now()
    `);
    saved.push(n);
  }
  const rows = await db.execute(sql`SELECT * FROM deal_inbox ORDER BY id DESC LIMIT 200`);
  return NextResponse.json({ success: true, added: saved.length, endsAt, links: inboxRows(rows) });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureDealInboxTable();
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const existing = inboxRows(await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`))[0];
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  let nextUrl = String(existing.url);
  let nextAsin = existing.asin == null ? null : String(existing.asin);
  let nextDomain = existing.domain == null ? null : String(existing.domain);
  if (body.url !== undefined) {
    const n = normalizeAmazonUrl(String(body.url));
    nextUrl = n.url;
    nextAsin = n.asin;
    nextDomain = n.domain || null;
  }

  const nextTitle = body.title !== undefined ? (body.title ? String(body.title) : null) : (existing.title == null ? null : String(existing.title));
  const nextListed = body.listedPrice !== undefined
    ? (body.listedPrice === "" || body.listedPrice == null ? null : Number(body.listedPrice))
    : (existing.listed_price == null ? null : Number(existing.listed_price));
  const nextSale = body.salePrice !== undefined
    ? (body.salePrice === "" || body.salePrice == null ? null : Number(body.salePrice))
    : (existing.sale_price == null ? null : Number(existing.sale_price));
  const nextEnds = body.endsAt !== undefined ? parseEndsAt(body.endsAt) : (existing.ends_at ? new Date(String(existing.ends_at)) : null);
  const nextNotes = body.opsNotes !== undefined
    ? (body.opsNotes == null ? null : String(body.opsNotes))
    : (existing.ops_notes == null ? null : String(existing.ops_notes));
  const nextImage = body.imageUrl !== undefined
    ? (body.imageUrl ? String(body.imageUrl) : null)
    : (existing.image_url == null ? null : String(existing.image_url));

  if (nextListed != null && (!Number.isFinite(nextListed) || nextListed <= 0)) {
    return NextResponse.json({ success: false, error: "listedPrice must be positive" }, { status: 400 });
  }
  if (nextSale != null && (!Number.isFinite(nextSale) || nextSale <= 0)) {
    return NextResponse.json({ success: false, error: "salePrice must be positive" }, { status: 400 });
  }

  await db.execute(sql`
    UPDATE deal_inbox SET
      url = ${nextUrl},
      asin = ${nextAsin},
      domain = ${nextDomain},
      title = ${nextTitle},
      listed_price = ${nextListed},
      sale_price = ${nextSale},
      ends_at = ${nextEnds},
      ops_notes = ${nextNotes},
      image_url = ${nextImage},
      check_status = ${nextSale != null ? "priced" : "queued"},
      check_notes = ${"Product info updated for owner review."},
      updated_at = now()
    WHERE id = ${id}
  `);

  const link = inboxRows(await db.execute(sql`SELECT * FROM deal_inbox WHERE id = ${id} LIMIT 1`))[0];
  return NextResponse.json({ success: true, link });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  await ensureDealInboxTable();
  const body = await request.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  await db.execute(sql`DELETE FROM deal_inbox WHERE id = ${id}`);
  return NextResponse.json({ success: true });
}
