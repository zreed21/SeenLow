import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'admin' | 'concierge'
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastScannedAt: timestamp("last_scanned_at"),
  score: integer("score").notNull().default(0),
  status: text("status").notNull().default("hold"), // hold | approved | blocked | allowlisted
  approvalMethod: text("approval_method"), // test_buy | allowlist | human
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  approvalExpiresAt: timestamp("approval_expires_at"),
  testOrderId: text("test_order_id"),
  testBuyPassed: boolean("test_buy_passed").notNull().default(false),
  knownChain: boolean("known_chain").notNull().default(false),
  domainAgeDays: integer("domain_age_days"),
  httpsValid: boolean("https_valid").notNull().default(false),
  hasContact: boolean("has_contact").notNull().default(false),
  hasPolicies: boolean("has_policies").notNull().default(false),
  hasNormalCardCheckout: boolean("has_normal_card_checkout").notNull().default(false),
  hasRealImprint: boolean("has_real_imprint").notNull().default(false),
  reputationSummary: text("reputation_summary"),
  complaintSignals: text("complaint_signals").notNull().default("[]"),
  evidenceJson: text("evidence_json").notNull().default("{}"),
  blockReason: text("block_reason"),
  paidOrders: integer("paid_orders").notNull().default(0),
  deliveredOrders: integer("delivered_orders").notNull().default(0),
  cancelAfterPayCount: integer("cancel_after_pay_count").notNull().default(0),
  returnCount: integer("return_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id"),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }).notNull(), // MSRP
  dealPrice: numeric("deal_price", { precision: 10, scale: 2 }).notNull(), // Crawler deal price
  serviceFee: numeric("service_fee", { precision: 10, scale: 2 }).notNull(), // Internal adjustment: markup plus estimated processing recovery
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(), // Single customer sale price, processing already included
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull(), // % off normal price
  retailer: text("retailer").notNull(), // Amazon, Best Buy, Walmart, Target, etc.
  retailerUrl: text("retailer_url").notNull(),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").notNull().default("[]"), // JSON array
  features: text("features").notNull().default("[]"), // JSON array
  specs: text("specs").notNull().default("{}"), // JSON object
  stockStatus: text("stock_status").notNull().default("in_stock"), // in_stock, low_stock, sold_out, expired
  stockQuantity: integer("stock_quantity").notNull().default(10),
  dealRank: integer("deal_rank").notNull().default(1), // 1 to 50
  isTop50: boolean("is_top_50").notNull().default(true),
  isHot: boolean("is_hot").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  lastScrapedAt: timestamp("last_scraped_at").defaultNow().notNull(),
  lastVerifiedAt: timestamp("last_verified_at").defaultNow().notNull(),
  verificationStatus: text("verification_status").notNull().default("verified_active"), // verified_active, price_changed, out_of_stock, pending_check
  verificationNotes: text("verification_notes"),
  opportunityScore: integer("opportunity_score").notNull().default(95), // 1 - 100 heat score
  dealExpiresAt: timestamp("deal_expires_at"), // Next midnight or retailer expiry
  // --- Monetization rail -------------------------------------------------
  ctaType: text("cta_type").notNull().default("reseller"), // affiliate | reseller | sponsored
  affiliateNetwork: text("affiliate_network"), // amazon | cj | awin | impact | rakuten | flexoffers | ebay | direct
  advertiserId: text("advertiser_id"),
  trackingUrl: text("tracking_url"),
  commissionEstimate: numeric("commission_estimate", { precision: 5, scale: 2 }), // percent of sale
  affiliateStatus: text("affiliate_status").notNull().default("none"), // none | applied | approved | rejected
  resellerAllowed: boolean("reseller_allowed").notNull().default(true), // "Have us buy it" vetted allowlist
  okToSell: boolean("ok_to_sell").notNull().default(false),
  paidOrders: integer("paid_orders").notNull().default(0),
  deliveredOrders: integer("delivered_orders").notNull().default(0),
  partnerCancelCount: integer("partner_cancel_count").notNull().default(0),
  changeOfMindReturns: integer("change_of_mind_returns").notNull().default(0),
  defectReturns: integer("defect_returns").notNull().default(0),
  wrongItemReturns: integer("wrong_item_returns").notNull().default(0),
  damagedReturns: integer("damaged_returns").notNull().default(0),
  notAsDescribedReturns: integer("not_as_described_returns").notNull().default(0),
  outcomeRevenue: numeric("outcome_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"),
  outcomeLosses: numeric("outcome_losses", { precision: 12, scale: 2 }).notNull().default("0.00"),
  killStatus: text("kill_status").notNull().default("active"), // active | review | hidden | killed
  killedAt: timestamp("killed_at"),
  killReason: text("kill_reason"),
  relistBlockedUntil: timestamp("relist_blocked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceObservations = pgTable("price_observations", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  orderId: integer("order_id"),
  checkpoint: text("checkpoint").notNull(), // midnight | viewed | before_sale | after_sale
  sourcePrice: numeric("source_price", { precision: 10, scale: 2 }).notNull(),
  fullPartnerCost: numeric("full_partner_cost", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }).notNull(),
  totalQuoted: numeric("total_quoted", { precision: 10, scale: 2 }),
  available: boolean("available").notNull(),
  sourceDomain: text("source_domain"),
  evidence: text("evidence").notNull().default("{}"),
  observedAt: timestamp("observed_at").defaultNow().notNull(),
});

export const skuOutcomes = pgTable("sku_outcomes", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  orderId: integer("order_id"),
  sourceId: integer("source_id"),
  outcomeType: text("outcome_type").notNull(), // paid | delivered | partner_cancel | change_of_mind | defect | wrong_item | damaged | not_as_described
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  postageLoss: numeric("postage_loss", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crawlerLogs = pgTable("crawler_logs", {
  id: serial("id").primaryKey(),
  runType: text("run_type").notNull(), // 'midnight_crawl' | 'hourly_verification' | 'manual_crawl' | 'manual_verify'
  status: text("status").notNull().default("completed"), // 'in_progress' | 'completed' | 'failed'
  dealsScanned: integer("deals_scanned").notNull().default(0),
  dealsUpdated: integer("deals_updated").notNull().default(0),
  dealsExpired: integer("deals_expired").notNull().default(0),
  topDiscountFound: numeric("top_discount_found", { precision: 5, scale: 2 }).default("0.00"),
  logOutput: text("log_output").notNull().default("[]"), // JSON stringified array of logs
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").notNull().default("demo-user-1"),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  dealId: integer("deal_id").notNull(),
  productTitle: text("product_title").notNull(),
  productImage: text("product_image").notNull(),
  retailer: text("retailer").notNull(),
  dealPrice: numeric("deal_price", { precision: 10, scale: 2 }).notNull(),
  serviceFee: numeric("service_fee", { precision: 10, scale: 2 }).notNull(), // Internal included adjustment, not a customer fee line
  requiredProductFee: numeric("required_product_fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  pricingVersion: text("pricing_version").notNull().default("legacy-10-percent"),
  shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  originalMsrp: numeric("original_msrp", { precision: 10, scale: 2 }).notNull(),
  customerSavings: numeric("customer_savings", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("paid"), // paid, processing, refunded, failed
  paymentMethod: text("payment_method").notNull().default("credit_card"),
  paymentCardLast4: text("payment_card_last4").default("4242"),
  paymentTransactionId: text("payment_transaction_id").notNull(),
  dropshipStatus: text("dropship_status").notNull().default("retailer_order_placed"), // payment_received, retailer_order_placed, retailer_processing, shipped, out_for_delivery, delivered, cancelled
  retailerOrderId: text("retailer_order_id"),
  retailerBotLog: text("retailer_bot_log"), // automated ordering step details
  trackingCarrier: text("tracking_carrier").default("UPS"),
  trackingNumber: text("tracking_number"),
  shippingAddress: text("shipping_address").notNull(), // JSON string
  estimatedDelivery: timestamp("estimated_delivery"),
  // --- Payment rail (Stripe) --------------------------------------------
  paymentProvider: text("payment_provider").notNull().default("simulation"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  statementDescriptor: text("statement_descriptor"),
  paidAmountFrozen: numeric("paid_amount_frozen", { precision: 10, scale: 2 }),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  refundAmount: numeric("refund_amount", { precision: 10, scale: 2 }),
  // --- Dispute / fraud controls ------------------------------------------
  disputeStatus: text("dispute_status"),
  earlyFraudWarning: boolean("early_fraud_warning").notNull().default(false),
  fulfillmentHold: boolean("fulfillment_hold").notNull().default(false),
  holdReason: text("hold_reason"),
  partnerPurchased: boolean("partner_purchased").notNull().default(false),
  // --- Partner buy economics (you → retailer, on your own card) -----------
  partnerPurchasePrice: numeric("partner_purchase_price", { precision: 10, scale: 2 }),
  partnerPurchasedAt: timestamp("partner_purchased_at"),
  partnerPurchaseAuth: text("partner_purchase_auth"),
  marginUsd: numeric("margin_usd", { precision: 10, scale: 2 }),
  cogsUsd: numeric("cogs_usd", { precision: 10, scale: 2 }),
  stripeFeeUsd: numeric("stripe_fee_usd", { precision: 10, scale: 2 }),
  humanOverride: boolean("human_override").notNull().default(false),
  // --- Dispute evidence metadata (mirrors Stripe metadata) ---------------
  customerRef: text("customer_ref"),
  lineSkus: text("line_skus"),
  quotedSellPrice: numeric("quoted_sell_price", { precision: 10, scale: 2 }),
  sourceName: text("source_name"),
  sourceLastSeenPrice: numeric("source_last_seen_price", { precision: 10, scale: 2 }),
  fulfillmentModel: text("fulfillment_model").notNull().default("partner_retailer"),
  shipToHash: text("ship_to_hash"),
  addressId: text("address_id"),
  invoiceNumber: text("invoice_number"),
  blindShippingRequestedAt: timestamp("blind_shipping_requested_at"),
  blindShippingAcknowledged: boolean("blind_shipping_acknowledged").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderHistory = pgTable("order_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: text("status").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("demo-user-1"),
  dealId: integer("deal_id").notNull(),
  targetDiscount: numeric("target_discount", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("demo-user-1"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // 'price_drop' | 'order_shipped' | 'deal_expiring' | 'hourly_check_alert' | 'system'
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailSubscribers = pgTable("email_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  source: text("source").notNull().default("website"), // website | checkout_guest | account
  isActive: boolean("is_active").notNull().default(true),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  recipientCount: integer("recipient_count").notNull().default(0),
  deliveryMode: text("delivery_mode").notNull().default("outbox"), // smtp | outbox
  htmlPreview: text("html_preview").notNull(),
  status: text("status").notNull().default("sent"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("SeenLow"),
  supportEmail: text("support_email").notNull().default("support@seenlow.com"),
  changeOfMindDays: integer("change_of_mind_days").notNull().default(30),
  returnShippingCost: text("return_shipping_cost").notNull().default("customer pays return shipping"),
  restockingFee: text("restocking_fee").notNull().default("None"),
  refundMethod: text("refund_method").notNull().default("Original payment method"),
  governingState: text("governing_state").notNull().default("Delaware"),
  blindShippingRequired: boolean("blind_shipping_required").notNull().default(true),
  partnerFulfillmentDisclosed: boolean("partner_fulfillment_disclosed").notNull().default(true),
  titleTransfer: text("title_transfer").notNull().default("You own the item when it is delivered to the address you provided."),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Spend caps and rules for the fulfillment agent. The agent may NEVER create a
 * Stripe charge — it can only buy from a partner with the company card, and only
 * when every rule here passes.
 */
export const fulfillmentSettings = pgTable("fulfillment_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  maxPartnerBuyUsd: numeric("max_partner_buy_usd", { precision: 10, scale: 2 }).notNull().default("2000.00"),
  dailySpendCapUsd: numeric("daily_spend_cap_usd", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  monthlySpendCapUsd: numeric("monthly_spend_cap_usd", { precision: 10, scale: 2 }).notNull().default("200000.00"),
  minMarginUsd: numeric("min_margin_usd", { precision: 10, scale: 2 }).notNull().default("3.00"),
  minMarginPercent: numeric("min_margin_percent", { precision: 5, scale: 2 }).notNull().default("5.00"),
  allowLossPurchases: boolean("allow_loss_purchases").notNull().default(false),
  cardNickname: text("card_nickname").notNull().default("Partner Buy Card"),
  cardLast4: text("card_last4").notNull().default("0000"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Immutable audit log of every agent decision — approved or denied. If a
 * partner buy mis-fires, this is the record of what rule let it through.
 */
export const agentActions = pgTable("agent_actions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id"),
  action: text("action").notNull(), // partner_buy_approved | partner_buy_denied | refund | hold | release
  allowed: boolean("allowed").notNull(),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }),
  rulesChecked: text("rules_checked").notNull().default("{}"),
  decisionReason: text("decision_reason").notNull(),
  actor: text("actor").notNull().default("agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Publisher-side network applications: live URL, status, and account notes. */
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: serial("id").primaryKey(),
  network: text("network").notNull().unique(), // amazon | cj | awin | impact | rakuten | flexoffers | ebay
  displayName: text("display_name").notNull(),
  signupUrl: text("signup_url").notNull(),
  status: text("status").notNull().default("not_applied"), // not_applied | applied | approved | rejected
  publisherId: text("publisher_id"),
  notes: text("notes"),
  appliedAt: timestamp("applied_at"),
  approvedAt: timestamp("approved_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Every outbound tap: revalidation result + price shown, for commission reconciliation. */
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  userId: text("user_id"),
  network: text("network"),
  trackingUrl: text("tracking_url").notNull(),
  priceAtClick: numeric("price_at_click", { precision: 10, scale: 2 }),
  revalidated: boolean("revalidated").notNull().default(false),
  blockedReason: text("blocked_reason"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

/** Paid placement: one promoted card per screen, always labeled Sponsored. */
export const sponsoredSlots = pgTable("sponsored_slots", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  dealId: integer("deal_id"),
  headline: text("headline").notNull(),
  destinationUrl: text("destination_url").notNull(),
  imageUrl: text("image_url"),
  weeklyFeeUsd: numeric("weekly_fee_usd", { precision: 10, scale: 2 }).notNull().default("0.00"),
  active: boolean("active").notNull().default(false),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Cutover switches. Cashback stays OFF until commissions have actually paid. */
export const monetizationSettings = pgTable("monetization_settings", {
  id: serial("id").primaryKey(),
  defaultRail: text("default_rail").notNull().default("affiliate"), // new traffic defaults to redirect
  resellerFrozen: boolean("reseller_frozen").notNull().default(false), // day-22+: allowlist only
  cashbackEnabled: boolean("cashback_enabled").notNull().default(false),
  cashbackSharePercent: numeric("cashback_share_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  firstCommissionPaidAt: timestamp("first_commission_paid_at"),
  bestDealMinScore: numeric("best_deal_min_score", { precision: 6, scale: 4 }).notNull().default("0.1000"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userAddresses = pgTable("user_addresses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("demo-user-1"),
  fullName: text("full_name").notNull(),
  street: text("street").notNull(),
  apt: text("apt"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("United States"),
  phone: text("phone").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
