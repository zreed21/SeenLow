import { pool, db } from "@/db";
import { deals, sources, policies, monetizationSettings, fulfillmentSettings, affiliatePrograms, users, priceObservations, crawlerLogs } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { SMALL_US_CATALOG } from "./smallCatalog";
import { catalogPriceFields } from "./pricing";
import { refreshCatalogPricing } from "./catalogPricing";
import { hashPassword } from "./auth";
import { normalizeDomain, rootDomain, scanSourcePage, sourceCanPublish, upsertSourceFromScan } from "./sourceCertification";

export const REQUIRED_TABLES = [
  "users",
  "sources",
  "deals",
  "crawler_logs",
  "orders",
  "order_history",
  "watchlists",
  "notifications",
  "email_subscribers",
  "email_logs",
  "policies",
  "fulfillment_settings",
  "agent_actions",
  "user_addresses",
  "price_observations",
  "sku_outcomes",
  "affiliate_programs",
  "affiliate_clicks",
  "sponsored_slots",
  "monetization_settings",
];

export const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "name" text NOT NULL,
    "password_hash" text NOT NULL,
    "role" text DEFAULT 'user' NOT NULL,
    "balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "avatar_url" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
  );`,

  `CREATE TABLE IF NOT EXISTS "sources" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "domain" text NOT NULL,
    "first_seen_at" timestamp DEFAULT now() NOT NULL,
    "last_scanned_at" timestamp,
    "score" integer DEFAULT 0 NOT NULL,
    "status" text DEFAULT 'hold' NOT NULL,
    "approval_method" text,
    "approved_by" text,
    "approved_at" timestamp,
    "approval_expires_at" timestamp,
    "test_order_id" text,
    "test_buy_passed" boolean DEFAULT false NOT NULL,
    "known_chain" boolean DEFAULT false NOT NULL,
    "domain_age_days" integer,
    "https_valid" boolean DEFAULT false NOT NULL,
    "has_contact" boolean DEFAULT false NOT NULL,
    "has_policies" boolean DEFAULT false NOT NULL,
    "has_normal_card_checkout" boolean DEFAULT false NOT NULL,
    "has_real_imprint" boolean DEFAULT false NOT NULL,
    "reputation_summary" text,
    "complaint_signals" text DEFAULT '[]' NOT NULL,
    "evidence_json" text DEFAULT '{}' NOT NULL,
    "block_reason" text,
    "paid_orders" integer DEFAULT 0 NOT NULL,
    "delivered_orders" integer DEFAULT 0 NOT NULL,
    "cancel_after_pay_count" integer DEFAULT 0 NOT NULL,
    "return_count" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "sources_domain_unique" UNIQUE("domain")
  );`,

  `CREATE TABLE IF NOT EXISTS "deals" (
    "id" serial PRIMARY KEY NOT NULL,
    "source_id" integer,
    "title" text NOT NULL,
    "slug" text NOT NULL,
    "description" text NOT NULL,
    "category" text NOT NULL,
    "brand" text NOT NULL,
    "original_price" numeric(10, 2) NOT NULL,
    "deal_price" numeric(10, 2) NOT NULL,
    "service_fee" numeric(10, 2) NOT NULL,
    "final_price" numeric(10, 2) NOT NULL,
    "discount_percent" numeric(5, 2) NOT NULL,
    "retailer" text NOT NULL,
    "retailer_url" text NOT NULL,
    "image_url" text NOT NULL,
    "additional_images" text DEFAULT '[]' NOT NULL,
    "features" text DEFAULT '[]' NOT NULL,
    "specs" text DEFAULT '{}' NOT NULL,
    "stock_status" text DEFAULT 'in_stock' NOT NULL,
    "stock_quantity" integer DEFAULT 10 NOT NULL,
    "deal_rank" integer DEFAULT 1 NOT NULL,
    "is_top_50" boolean DEFAULT true NOT NULL,
    "is_hot" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_scraped_at" timestamp DEFAULT now() NOT NULL,
    "last_verified_at" timestamp DEFAULT now() NOT NULL,
    "verification_status" text DEFAULT 'verified_active' NOT NULL,
    "verification_notes" text,
    "opportunity_score" integer DEFAULT 95 NOT NULL,
    "deal_expires_at" timestamp,
    "cta_type" text DEFAULT 'reseller' NOT NULL,
    "affiliate_network" text,
    "advertiser_id" text,
    "tracking_url" text,
    "commission_estimate" numeric(5, 2),
    "affiliate_status" text DEFAULT 'none' NOT NULL,
    "reseller_allowed" boolean DEFAULT true NOT NULL,
    "ok_to_sell" boolean DEFAULT false NOT NULL,
    "paid_orders" integer DEFAULT 0 NOT NULL,
    "delivered_orders" integer DEFAULT 0 NOT NULL,
    "partner_cancel_count" integer DEFAULT 0 NOT NULL,
    "change_of_mind_returns" integer DEFAULT 0 NOT NULL,
    "defect_returns" integer DEFAULT 0 NOT NULL,
    "wrong_item_returns" integer DEFAULT 0 NOT NULL,
    "damaged_returns" integer DEFAULT 0 NOT NULL,
    "not_as_described_returns" integer DEFAULT 0 NOT NULL,
    "outcome_revenue" numeric(12, 2) DEFAULT '0.00' NOT NULL,
    "outcome_losses" numeric(12, 2) DEFAULT '0.00' NOT NULL,
    "kill_status" text DEFAULT 'active' NOT NULL,
    "killed_at" timestamp,
    "kill_reason" text,
    "relist_blocked_until" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "crawler_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "run_type" text NOT NULL,
    "status" text DEFAULT 'completed' NOT NULL,
    "deals_scanned" integer DEFAULT 0 NOT NULL,
    "deals_updated" integer DEFAULT 0 NOT NULL,
    "deals_expired" integer DEFAULT 0 NOT NULL,
    "top_discount_found" numeric(5, 2) DEFAULT '0.00',
    "log_output" text DEFAULT '[]' NOT NULL,
    "started_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "orders" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_number" text NOT NULL,
    "user_id" text DEFAULT 'demo-user-1' NOT NULL,
    "user_name" text NOT NULL,
    "user_email" text NOT NULL,
    "deal_id" integer NOT NULL,
    "product_title" text NOT NULL,
    "product_image" text NOT NULL,
    "retailer" text NOT NULL,
    "deal_price" numeric(10, 2) NOT NULL,
    "service_fee" numeric(10, 2) NOT NULL,
    "required_product_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "pricing_version" text DEFAULT 'legacy-10-percent' NOT NULL,
    "shipping_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "tax_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "total_amount" numeric(10, 2) NOT NULL,
    "original_msrp" numeric(10, 2) NOT NULL,
    "customer_savings" numeric(10, 2) NOT NULL,
    "payment_status" text DEFAULT 'paid' NOT NULL,
    "payment_method" text DEFAULT 'credit_card' NOT NULL,
    "payment_card_last4" text DEFAULT '4242',
    "payment_transaction_id" text NOT NULL,
    "dropship_status" text DEFAULT 'retailer_order_placed' NOT NULL,
    "retailer_order_id" text,
    "retailer_bot_log" text,
    "tracking_carrier" text DEFAULT 'UPS',
    "tracking_number" text,
    "shipping_address" text NOT NULL,
    "estimated_delivery" timestamp,
    "payment_provider" text DEFAULT 'simulation' NOT NULL,
    "stripe_payment_intent_id" text,
    "stripe_checkout_session_id" text,
    "statement_descriptor" text,
    "paid_amount_frozen" numeric(10, 2),
    "paid_at" timestamp,
    "refunded_at" timestamp,
    "refund_amount" numeric(10, 2),
    "dispute_status" text,
    "early_fraud_warning" boolean DEFAULT false NOT NULL,
    "fulfillment_hold" boolean DEFAULT false NOT NULL,
    "hold_reason" text,
    "partner_purchased" boolean DEFAULT false NOT NULL,
    "partner_purchase_price" numeric(10, 2),
    "partner_purchased_at" timestamp,
    "partner_purchase_auth" text,
    "margin_usd" numeric(10, 2),
    "cogs_usd" numeric(10, 2),
    "stripe_fee_usd" numeric(10, 2),
    "human_override" boolean DEFAULT false NOT NULL,
    "customer_ref" text,
    "line_skus" text,
    "quoted_sell_price" numeric(10, 2),
    "source_name" text,
    "source_last_seen_price" numeric(10, 2),
    "fulfillment_model" text DEFAULT 'partner_retailer' NOT NULL,
    "ship_to_hash" text,
    "address_id" text,
    "invoice_number" text,
    "blind_shipping_requested_at" timestamp,
    "blind_shipping_acknowledged" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
  );`,

  `CREATE TABLE IF NOT EXISTS "order_history" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_id" integer NOT NULL,
    "status" text NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "location" text,
    "timestamp" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "watchlists" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" text DEFAULT 'demo-user-1' NOT NULL,
    "deal_id" integer NOT NULL,
    "target_discount" numeric(5, 2),
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" text DEFAULT 'demo-user-1' NOT NULL,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text DEFAULT 'info' NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "link" text,
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "email_subscribers" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "source" text DEFAULT 'website' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "unsubscribe_token" text NOT NULL,
    "last_sent_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "email_subscribers_email_unique" UNIQUE("email")
  );`,

  `CREATE TABLE IF NOT EXISTS "email_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject" text NOT NULL,
    "recipient_count" integer DEFAULT 0 NOT NULL,
    "delivery_mode" text DEFAULT 'outbox' NOT NULL,
    "html_preview" text NOT NULL,
    "status" text DEFAULT 'sent' NOT NULL,
    "sent_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "policies" (
    "id" serial PRIMARY KEY NOT NULL,
    "company_name" text DEFAULT 'SeenLow' NOT NULL,
    "support_email" text DEFAULT 'support@seenlow.com' NOT NULL,
    "change_of_mind_days" integer DEFAULT 30 NOT NULL,
    "return_shipping_cost" text DEFAULT 'customer pays return shipping' NOT NULL,
    "restocking_fee" text DEFAULT 'None' NOT NULL,
    "refund_method" text DEFAULT 'Original payment method' NOT NULL,
    "governing_state" text DEFAULT 'Delaware' NOT NULL,
    "blind_shipping_required" boolean DEFAULT true NOT NULL,
    "partner_fulfillment_disclosed" boolean DEFAULT true NOT NULL,
    "title_transfer" text DEFAULT 'You own the item when it is delivered to the address you provided.' NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "fulfillment_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "max_partner_buy_usd" numeric(10, 2) DEFAULT '2000.00' NOT NULL,
    "daily_spend_cap_usd" numeric(10, 2) DEFAULT '10000.00' NOT NULL,
    "monthly_spend_cap_usd" numeric(10, 2) DEFAULT '200000.00' NOT NULL,
    "min_margin_usd" numeric(10, 2) DEFAULT '3.00' NOT NULL,
    "min_margin_percent" numeric(5, 2) DEFAULT '5.00' NOT NULL,
    "allow_loss_purchases" boolean DEFAULT false NOT NULL,
    "card_nickname" text DEFAULT 'Partner Buy Card' NOT NULL,
    "card_last4" text DEFAULT '0000' NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "agent_actions" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_id" integer,
    "action" text NOT NULL,
    "allowed" boolean NOT NULL,
    "amount_usd" numeric(10, 2),
    "rules_checked" text DEFAULT '{}' NOT NULL,
    "decision_reason" text NOT NULL,
    "actor" text DEFAULT 'agent' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "user_addresses" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" text DEFAULT 'demo-user-1' NOT NULL,
    "full_name" text NOT NULL,
    "street" text NOT NULL,
    "apt" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "zip_code" text NOT NULL,
    "country" text DEFAULT 'United States' NOT NULL,
    "phone" text NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "price_observations" (
    "id" serial PRIMARY KEY NOT NULL,
    "deal_id" integer NOT NULL,
    "order_id" integer,
    "checkpoint" text NOT NULL,
    "source_price" numeric(10, 2) NOT NULL,
    "full_partner_cost" numeric(10, 2) NOT NULL,
    "sale_price" numeric(10, 2) NOT NULL,
    "total_quoted" numeric(10, 2),
    "available" boolean NOT NULL,
    "source_domain" text,
    "evidence" text DEFAULT '{}' NOT NULL,
    "observed_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "sku_outcomes" (
    "id" serial PRIMARY KEY NOT NULL,
    "deal_id" integer NOT NULL,
    "order_id" integer,
    "source_id" integer,
    "outcome_type" text NOT NULL,
    "amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "postage_loss" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "affiliate_programs" (
    "id" serial PRIMARY KEY NOT NULL,
    "network" text NOT NULL,
    "display_name" text NOT NULL,
    "signup_url" text NOT NULL,
    "status" text DEFAULT 'not_applied' NOT NULL,
    "publisher_id" text,
    "notes" text,
    "applied_at" timestamp,
    "approved_at" timestamp,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "affiliate_programs_network_unique" UNIQUE("network")
  );`,

  `CREATE TABLE IF NOT EXISTS "affiliate_clicks" (
    "id" serial PRIMARY KEY NOT NULL,
    "deal_id" integer NOT NULL,
    "user_id" text,
    "network" text,
    "tracking_url" text NOT NULL,
    "price_at_click" numeric(10, 2),
    "revalidated" boolean DEFAULT false NOT NULL,
    "blocked_reason" text,
    "clicked_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "sponsored_slots" (
    "id" serial PRIMARY KEY NOT NULL,
    "brand_name" text NOT NULL,
    "deal_id" integer,
    "headline" text NOT NULL,
    "destination_url" text NOT NULL,
    "image_url" text,
    "weekly_fee_usd" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "active" boolean DEFAULT false NOT NULL,
    "starts_at" timestamp,
    "ends_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "monetization_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "default_rail" text DEFAULT 'affiliate' NOT NULL,
    "reseller_frozen" boolean DEFAULT false NOT NULL,
    "cashback_enabled" boolean DEFAULT false NOT NULL,
    "cashback_share_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
    "first_commission_paid_at" timestamp,
    "best_deal_min_score" numeric(6, 4) DEFAULT '0.1000' NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,
];

export interface DatabaseStatus {
  connected: boolean;
  databaseHost: string;
  existingTablesCount: number;
  missingTables: string[];
  dealsCount: number;
  sourcesCount: number;
  certifiedSellableCount: number;
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const host = process.env.DATABASE_URL
    ? (process.env.DATABASE_URL.split("@")[1]?.split("/")[0] || "configured")
    : "not_set";

  try {
    const res = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const existing = new Set(res.rows.map((r) => r.table_name));
    const missing = REQUIRED_TABLES.filter((t) => !existing.has(t));

    let dealsCount = 0;
    let sourcesCount = 0;
    let certifiedSellableCount = 0;

    if (existing.has("deals")) {
      const d = await pool.query(`SELECT count(*)::int AS count FROM "deals"`);
      dealsCount = Number(d.rows[0]?.count || 0);

      const s = await pool.query(
        `SELECT count(*)::int AS count FROM "deals" WHERE "ok_to_sell" = true AND "is_active" = true`
      );
      certifiedSellableCount = Number(s.rows[0]?.count || 0);
    }

    if (existing.has("sources")) {
      const s = await pool.query(`SELECT count(*)::int AS count FROM "sources"`);
      sourcesCount = Number(s.rows[0]?.count || 0);
    }

    return {
      connected: true,
      databaseHost: host,
      existingTablesCount: existing.size,
      missingTables: missing,
      dealsCount,
      sourcesCount,
      certifiedSellableCount,
    };
  } catch (err: any) {
    return {
      connected: false,
      databaseHost: host,
      existingTablesCount: 0,
      missingTables: REQUIRED_TABLES,
      dealsCount: 0,
      sourcesCount: 0,
      certifiedSellableCount: 0,
    };
  }
}

let bootstrapPromise: Promise<{ schemaPushed: boolean; catalogLoaded: boolean; dealsCount: number; sourcesCount: number }> | null = null;

export async function ensureDatabaseReady() {
  if (!bootstrapPromise) {
    bootstrapPromise = runDatabaseBootstrap().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

export async function runDatabaseBootstrap() {
  // 1. Check existing tables
  const status = await getDatabaseStatus();
  let schemaPushed = false;

  // 2. Schema push only if tables are missing
  if (status.missingTables.length > 0) {
    console.log(`[db-bootstrap] Missing ${status.missingTables.length} tables: ${status.missingTables.join(", ")}. Pushing DDL...`);
    for (const stmt of DDL_STATEMENTS) {
      await pool.query(stmt);
    }
    schemaPushed = true;
    console.log("[db-bootstrap] DDL schema pushed successfully.");
  }

  // Re-check deals and sources counts
  const dRes = await pool.query(`SELECT count(*)::int AS count FROM "deals"`);
  const dealsCount = Number(dRes.rows[0]?.count || 0);

  const sRes = await pool.query(`SELECT count(*)::int AS count FROM "sources"`);
  let sourcesCount = Number(sRes.rows[0]?.count || 0);

  let catalogLoaded = false;

  // 3 & 4. If deals is empty: Load pristine small US-only catalog and run live source scans.
  // DO NOT run old demo reseed that wipes scans or invents affiliate URLs.
  if (dealsCount === 0) {
    console.log("[db-bootstrap] Deals table is empty. Loading clean small US-only catalog with live source certifications...");

    // Seed default settings and policies if missing
    const polCount = await pool.query(`SELECT count(*)::int AS count FROM "policies"`);
    if (Number(polCount.rows[0]?.count || 0) === 0) {
      await pool.query(
        `INSERT INTO "policies" ("company_name", "support_email") VALUES ('SeenLow', 'support@seenlow.com') ON CONFLICT DO NOTHING;`
      );
    }

    const monCount = await pool.query(`SELECT count(*)::int AS count FROM "monetization_settings"`);
    if (Number(monCount.rows[0]?.count || 0) === 0) {
      await pool.query(
        `INSERT INTO "monetization_settings" ("default_rail", "reseller_frozen", "cashback_enabled") VALUES ('affiliate', false, false) ON CONFLICT DO NOTHING;`
      );
    }

    const fulCount = await pool.query(`SELECT count(*)::int AS count FROM "fulfillment_settings"`);
    if (Number(fulCount.rows[0]?.count || 0) === 0) {
      await pool.query(
        `INSERT INTO "fulfillment_settings" ("enabled", "card_nickname", "card_last4") VALUES (true, 'Partner Buy Card', '0000') ON CONFLICT DO NOTHING;`
      );
    }

    const affCount = await pool.query(`SELECT count(*)::int AS count FROM "affiliate_programs"`);
    if (Number(affCount.rows[0]?.count || 0) === 0) {
      const programs = [
        ["amazon", "Amazon Associates", "https://affiliate-program.amazon.com", "~1-10% by category. 3 sales in 180 days."],
        ["cj", "CJ Affiliate", "https://signup.cj.com", "Walmart and US big box retail."],
        ["awin", "Awin (incl. ShareASale)", "https://ui.awin.com/publisher-signup", "US mid-market retail."],
        ["impact", "impact.com", "https://impact.com", "Modern brand contracts."],
        ["rakuten", "Rakuten Advertising", "https://rakutenadvertising.com", "Department stores and specialty."],
        ["flexoffers", "FlexOffers", "https://www.flexoffers.com", "Secondary network fallback."],
        ["ebay", "eBay Partner Network", "https://partnernetwork.ebay.com", "Marketplace catalog."]
      ];
      for (const [net, name, url, notes] of programs) {
        await pool.query(
          `INSERT INTO "affiliate_programs" ("network", "display_name", "signup_url", "notes", "status")
           VALUES ($1, $2, $3, $4, 'not_applied') ON CONFLICT ("network") DO NOTHING;`,
          [net, name, url, notes]
        );
      }
    }

    // Seed admin user if users empty
    const usrCount = await pool.query(`SELECT count(*)::int AS count FROM "users"`);
    if (Number(usrCount.rows[0]?.count || 0) === 0) {
      await pool.query(
        `INSERT INTO "users" ("email", "name", "password_hash", "role", "balance")
         VALUES ('concierge@seenlow.com', 'SeenLow Admin', $1, 'admin', '5000.00')
         ON CONFLICT ("email") DO NOTHING;`,
        [hashPassword("seenlow2026")]
      );
    }

    // Run the REAL source scanner on each unique product domain. Never stamp
    // httpsValid/score/status. A 403, timeout, unreadable page, or bad signal is
    // stored as hold and every linked SKU stays inactive until an authenticated
    // test-buy approval is recorded through /api/sources.
    const sourceItems = new Map<string, (typeof SMALL_US_CATALOG)[number]>();
    for (const item of SMALL_US_CATALOG) {
      sourceItems.set(rootDomain(normalizeDomain(item.retailerUrl)), item);
    }

    const domainToSource = new Map<string, typeof sources.$inferSelect>();
    await Promise.all(
      [...sourceItems.entries()].map(async ([domain, item]) => {
        try {
          const scan = await scanSourcePage(item.retailerUrl);
          const source = await upsertSourceFromScan(item.retailer, scan);
          domainToSource.set(domain, source);
          console.log(
            `[db-bootstrap] Scan ${domain}: score=${source.score}, status=${source.status}, ` +
              `publishable=${sourceCanPublish(source)}`
          );
        } catch (error: any) {
          const evidence = JSON.stringify({
            bootstrap: true,
            scanAttempted: true,
            sourceUrl: item.retailerUrl,
            scanError: String(error?.message || error),
            scannedAt: new Date().toISOString(),
          });
          const result = await pool.query(
            `INSERT INTO "sources"
              ("name", "domain", "status", "score", "https_valid", "last_scanned_at",
               "reputation_summary", "evidence_json", "block_reason", "updated_at")
             VALUES ($1, $2, 'hold', 0, false, now(), $3, $4, $3, now())
             ON CONFLICT ("domain") DO UPDATE SET
               "status" = 'hold',
               "score" = 0,
               "https_valid" = false,
               "last_scanned_at" = now(),
               "reputation_summary" = EXCLUDED."reputation_summary",
               "evidence_json" = EXCLUDED."evidence_json",
               "block_reason" = EXCLUDED."block_reason",
               "updated_at" = now()
             RETURNING *;`,
            [item.retailer, domain, `Bootstrap live scan failed: ${String(error?.message || error)}`, evidence]
          );
          domainToSource.set(domain, result.rows[0]);
          console.warn(`[db-bootstrap] Scan ${domain}: HOLD (${String(error?.message || error)})`);
        }
      })
    );

    // Insert deals only after each source has real scan evidence. Products are
    // always inserted so ops can review them, but only scan-approved sources get
    // okToSell/isActive. No affiliate URLs are invented.
    for (let i = 0; i < SMALL_US_CATALOG.length; i++) {
      const item = SMALL_US_CATALOG[i];
      const domain = rootDomain(normalizeDomain(item.retailerUrl));
      const source = domainToSource.get(domain);
      const canSell = sourceCanPublish(source);
      const priced = catalogPriceFields(item.dealPrice, item.originalPrice);
      const verificationStatus = canSell ? "verified_active" : "pending_check";
      const verificationNotes = canSell
        ? "Real live source scan passed; price and availability snapshot recorded."
        : "Source held after real live scan; requires review or audited test-buy approval.";

      const dealRes = await pool.query(
        `INSERT INTO "deals"
          ("source_id", "title", "slug", "description", "category", "brand",
           "original_price", "deal_price", "service_fee", "final_price", "discount_percent",
           "retailer", "retailer_url", "image_url", "features", "specs",
           "stock_quantity", "stock_status", "deal_rank", "is_top_50", "is_hot",
           "is_active", "ok_to_sell", "kill_status", "verification_status", "verification_notes",
           "cta_type", "affiliate_status", "tracking_url", "reseller_allowed", "opportunity_score")
         VALUES
          ($1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13, $14, $15, $16,
           $17, 'in_stock', $18, false, $19,
           $20, $20, 'active', $21, $22,
           'reseller', 'none', NULL, true, 92)
         RETURNING "id", "deal_price", "final_price";`,
        [
          source?.id || null,
          item.title,
          `${item.slug}-${Date.now().toString().slice(-4)}-${i}`,
          item.description,
          item.category,
          item.brand,
          item.originalPrice.toFixed(2),
          item.dealPrice.toFixed(2),
          priced.serviceFee,
          priced.finalPrice,
          priced.discountPercent,
          item.retailer,
          item.retailerUrl,
          item.imageUrl,
          JSON.stringify(item.features),
          JSON.stringify(item.specs),
          item.stockQuantity,
          i + 1,
          canSell && i < 4,
          canSell,
          verificationStatus,
          verificationNotes,
        ]
      );

      const createdDeal = dealRes.rows[0];
      await pool.query(
        `INSERT INTO "price_observations"
          ("deal_id", "checkpoint", "source_price", "full_partner_cost", "sale_price", "total_quoted", "available", "source_domain", "evidence")
         VALUES
          ($1, 'midnight', $2, $2, $3, $3, $4, $5, $6)`,
        [
          createdDeal.id,
          createdDeal.deal_price,
          createdDeal.final_price,
          canSell,
          domain,
          JSON.stringify({
            bootstrap: true,
            trigger: "production_catalog_init",
            liveScan: true,
            sourceStatus: source?.status || "hold",
            sourceScore: source?.score || 0,
          }),
        ]
      );
    }

    await refreshCatalogPricing();
    catalogLoaded = true;
    const sellableCount = [...domainToSource.values()].filter(sourceCanPublish).length;
    console.log(
      `[db-bootstrap] Clean US-only catalog inserted: ${SMALL_US_CATALOG.length} SKUs; ` +
        `${sellableCount}/${domainToSource.size} source domains passed real scans.`
    );
  }

  const finalStatus = await getDatabaseStatus();
  return {
    schemaPushed,
    catalogLoaded,
    dealsCount: finalStatus.dealsCount,
    sourcesCount: finalStatus.sourcesCount,
    certifiedSellableCount: finalStatus.certifiedSellableCount,
  };
}
