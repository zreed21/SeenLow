import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Ops review / monitoring state for deal_inbox rows. */
export type DealReviewStatus =
  | "awaiting_verification"
  | "monitoring"
  | "stopped_needs_review"
  | "rejected"
  | "held";

export async function ensureDealInboxTable() {
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
  // Additive columns for deal-scout / owner review / 30-min monitoring.
  await db.execute(sql`ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'awaiting_verification'`);
  await db.execute(sql`ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS ops_notes text`);
  await db.execute(sql`ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS monitor_started_at timestamp`);
  await db.execute(sql`ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS last_monitored_at timestamp`);
  await db.execute(sql`ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS image_url text`);
}

export function inboxRows(result: unknown): Record<string, unknown>[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  const rows = (result as { rows?: unknown[] }).rows;
  return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
}

export function firstInboxRow(result: unknown): Record<string, unknown> | null {
  return inboxRows(result)[0] || null;
}
