-- Neon / Postgres: run once before deploy (safe to re-run).
-- Extends deal_inbox for deal-scout staging + owner verification + 30-min monitoring.

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
);

ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'awaiting_verification';
ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS ops_notes text;
ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS monitor_started_at timestamp;
ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS last_monitored_at timestamp;
ALTER TABLE deal_inbox ADD COLUMN IF NOT EXISTS image_url text;

-- review_status values:
--   awaiting_verification  — staged; not live; waiting on owner
--   monitoring             — approved, live, rechecked every ~30 min via POST /api/deal-monitor/run
--   stopped_needs_review   — sold out or discount <= 50%; taken off Top-50; do not delete
--   rejected | held        — owner rejected or parked

COMMENT ON COLUMN deal_inbox.review_status IS 'awaiting_verification | monitoring | stopped_needs_review | rejected | held';
