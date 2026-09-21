export interface Deal {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  originalPrice: string; // MSRP
  dealPrice: string; // Scraped price
  serviceFee: string; // Internal combined price adjustment (markup and processing recovery)
  finalPrice: string; // dealPrice + serviceFee
  discountPercent: string; // % off
  retailer: string;
  retailerUrl: string;
  imageUrl: string;
  additionalImages: string; // JSON string
  features: string; // JSON string
  specs: string; // JSON string
  stockStatus: "in_stock" | "low_stock" | "sold_out" | "expired";
  stockQuantity: number;
  dealRank: number;
  isTop50: boolean;
  isHot: boolean;
  isActive: boolean;
  lastScrapedAt: string;
  lastVerifiedAt: string;
  verificationStatus: "verified_active" | "price_changed" | "out_of_stock" | "pending_check";
  verificationNotes: string | null;
  opportunityScore: number;
  dealExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryItem {
  id: number;
  orderId: number;
  status: string;
  title: string;
  description: string;
  location?: string | null;
  timestamp: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  dealId: number;
  productTitle: string;
  productImage: string;
  retailer: string;
  dealPrice: string;
  serviceFee: string;
  quotedSellPrice?: string | null;
  requiredProductFee?: string | null;
  pricingVersion?: string;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  originalMsrp: string;
  customerSavings: string;
  paymentStatus: "pending" | "paid" | "processing" | "partially_refunded" | "refunded" | "failed";
  paymentMethod: string;
  paymentCardLast4?: string | null;
  paymentTransactionId: string;
  dropshipStatus: "payment_received" | "retailer_order_placed" | "retailer_processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  retailerOrderId?: string | null;
  retailerBotLog?: string | null;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  shippingAddress: string; // JSON string
  estimatedDelivery?: string | null;
  paidAmountFrozen?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  refundAmount?: string | null;
  disputeStatus?: string | null;
  earlyFraudWarning?: boolean;
  fulfillmentHold?: boolean;
  holdReason?: string | null;
  partnerPurchased?: boolean;
  partnerPurchasePrice?: string | null;
  partnerPurchasedAt?: string | null;
  marginUsd?: string | null;
  cogsUsd?: string | null;
  stripeFeeUsd?: string | null;
  humanOverride?: boolean;
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
  invoiceNumber?: string | null;
  blindShippingRequestedAt?: string | null;
  blindShippingAcknowledged?: boolean;
  createdAt: string;
  updatedAt: string;
  history?: OrderHistoryItem[];
}

export interface CrawlerLog {
  id: number;
  runType: "midnight_crawl" | "hourly_verification" | "manual_crawl" | "manual_verify";
  status: string;
  dealsScanned: number;
  dealsUpdated: number;
  dealsExpired: number;
  topDiscountFound?: string | null;
  logOutput: string; // JSON array string
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface UserAddress {
  id: number;
  userId: string;
  fullName: string;
  street: string;
  apt?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

export interface WatchlistItem {
  watchlistId: number;
  targetDiscount?: string | null;
  createdAt: string;
  deal: Deal;
}

export interface NotificationItem {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface PlatformStats {
  top50Count: number;
  totalDeals: number;
  activeDealCount?: number;
  averageCustomerDiscount?: number;
  avgDiscount: string;
  maxDiscount: string;
  totalPotentialSavings: string;
  totalOrders: number;
  totalCustomerSavingsPaid: string;
  totalServiceFeesEarned: string;
  totalGrossVolume: string;
  hourlyUptime: string;
  lastMidnightCrawl: string;
  lastHourlyHealthcheck: string;
  categoryDistribution: Record<string, number>;
  retailerDistribution: Record<string, number>;
}
