import Stripe from "stripe";
import { createHash } from "crypto";

/**
 * Provider-agnostic payment layer for SeenLow.
 *
 * Rules:
 *  - Amounts are ALWAYS computed server-side in cents.
 *  - Every Session/Intent carries dispute-grade metadata keyed on OUR order_id.
 *  - Every create call is idempotency-keyed on our order_id.
 *  - Statement descriptor is "SEENLOW" (<= 22 chars) — matches merchant of record.
 */

export type PaymentProvider = "stripe" | "simulation";

/** Short, recognizable, card-statement-safe descriptor */
export const STATEMENT_DESCRIPTOR = (process.env.STRIPE_STATEMENT_DESCRIPTOR || "SEENLOW")
  .toUpperCase()
  .replace(/[^A-Z0-9 .\-]/g, "")
  .slice(0, 22);

export const CAPTURE_METHOD: "automatic" | "manual" =
  process.env.STRIPE_CAPTURE_METHOD === "manual" ? "manual" : "automatic";

export interface PaymentMetadata {
  order_id: string;              // OUR id, not Stripe's
  order_number: string;
  customer_id: string;
  line_skus: string;
  quoted_sell_price: string;
  source_last_seen_price: string;
  source_name: string;
  fulfillment_model: "partner_retailer";
  ship_to_hash: string;
  address_id: string;
}

export interface CreateIntentInput {
  amountCents: number;
  currency?: string;
  metadata: PaymentMetadata;
  customerEmail?: string;
  customerId?: string;
  description?: string;
}

export interface CreateIntentResult {
  provider: PaymentProvider;
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
  currency: string;
  captureMethod: string;
  statementDescriptor: string;
  publishableKey?: string;
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: "2026-08-26.dahlia", typescript: true });
  }
  return stripeClient;
}

export function paymentProvider(): PaymentProvider {
  return getStripe() ? "stripe" : "simulation";
}

export function hashShipTo(address: Record<string, unknown>): string {
  const norm = [address.fullName, address.street, address.apt, address.city, address.state, address.zipCode, address.country]
    .map((v) => String(v ?? "").trim().toLowerCase())
    .join("|");
  return createHash("sha256").update(norm).digest("hex").slice(0, 32);
}

export function paymentConfig() {
  const provider = paymentProvider();
  return {
    provider,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    wallets: { applePay: provider === "stripe", googlePay: provider === "stripe" },
    currency: "usd",
    captureMethod: CAPTURE_METHOD,
    statementDescriptor: STATEMENT_DESCRIPTOR,
    merchantDisplayName: process.env.NEXT_PUBLIC_MERCHANT_NAME || "SeenLow",
    simulation: provider === "simulation",
  };
}

function toStripeMetadata(m: PaymentMetadata): Record<string, string> {
  return Object.fromEntries(Object.entries(m).map(([k, v]) => [k, String(v).slice(0, 500)]));
}

export async function createPaymentIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
  const currency = "usd";
  const stripe = getStripe();

  if (stripe) {
    const intent = await stripe.paymentIntents.create(
      {
        amount: input.amountCents,
        currency,
        description: input.description,
        receipt_email: input.customerEmail,
        ...(input.customerId ? { customer: input.customerId } : {}),
        metadata: toStripeMetadata(input.metadata),
        capture_method: CAPTURE_METHOD,
        statement_descriptor_suffix: STATEMENT_DESCRIPTOR.slice(0, 22),
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `pi_${input.metadata.order_id}` }
    );
    return {
      provider: "stripe",
      clientSecret: intent.client_secret || "",
      paymentIntentId: intent.id,
      amountCents: input.amountCents,
      currency,
      captureMethod: CAPTURE_METHOD,
      statementDescriptor: STATEMENT_DESCRIPTOR,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    };
  }

  const id = `sim_pi_${input.metadata.order_id}`;
  return {
    provider: "simulation",
    clientSecret: `${id}_secret_${createHash("sha256").update(id).digest("hex").slice(0, 16)}`,
    paymentIntentId: id,
    amountCents: input.amountCents,
    currency,
    captureMethod: CAPTURE_METHOD,
    statementDescriptor: STATEMENT_DESCRIPTOR,
  };
}

export async function createCheckoutSession(params: {
  amountCents: number;
  productName: string;
  metadata: PaymentMetadata;
  customerEmail?: string;
  uiMode?: "hosted" | "embedded";
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  const uiMode = params.uiMode || "hosted";

  if (!stripe) {
    return {
      provider: "simulation" as const,
      id: `sim_cs_${params.metadata.order_id}`,
      url: `${params.successUrl}?simulated=1`,
      clientSecret: null,
    };
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: params.amountCents,
          product_data: { name: params.productName.slice(0, 120) },
        },
      }],
      shipping_address_collection: { allowed_countries: ["US"] },
      customer_email: params.customerEmail,
      ...(process.env.STRIPE_TAX_ENABLED === "1" ? { automatic_tax: { enabled: true } } : {}),
      metadata: toStripeMetadata(params.metadata),
      payment_intent_data: {
        metadata: toStripeMetadata(params.metadata),
        capture_method: CAPTURE_METHOD,
        statement_descriptor_suffix: STATEMENT_DESCRIPTOR.slice(0, 22),
      },
      ...(uiMode === "embedded"
        ? { ui_mode: "embedded" as const, return_url: params.successUrl }
        : { ui_mode: "hosted" as const, success_url: params.successUrl, cancel_url: params.cancelUrl }),
    },
    { idempotencyKey: `cs_${params.metadata.order_id}` }
  );

  return {
    provider: "stripe" as const,
    id: session.id,
    url: session.url,
    clientSecret: session.client_secret ?? null,
  };
}

export async function capturePaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  if (!stripe || paymentIntentId.startsWith("sim_")) return { captured: true, simulated: true };
  const intent = await stripe.paymentIntents.capture(paymentIntentId);
  return { captured: intent.status === "succeeded", status: intent.status };
}

export async function refundPaymentIntent(
  paymentIntentId: string,
  options: { amountCents?: number; reason?: string } = {}
) {
  const stripe = getStripe();
  const reason = (options.reason || "requested_by_customer") as Stripe.RefundCreateParams.Reason;
  if (!stripe || paymentIntentId.startsWith("sim_")) {
    return { refunded: true, simulated: true, amountCents: options.amountCents ?? null };
  }
  const refund = await stripe.refunds.create(
    {
      payment_intent: paymentIntentId,
      ...(options.amountCents ? { amount: options.amountCents } : {}),
      reason,
    },
    { idempotencyKey: `re_${paymentIntentId}${options.amountCents ? `_${options.amountCents}` : ""}` }
  );
  return {
    refunded: refund.status === "succeeded" || refund.status === "pending",
    status: refund.status,
    amountCents: refund.amount,
  };
}

export async function ensureStripeCustomer(email: string, name?: string) {
  const stripe = getStripe();
  if (!stripe || !email) return null;
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;
  const created = await stripe.customers.create({ email, name, metadata: { source: "seenlow" } });
  return created.id;
}

export async function retrievePaymentIntentStatus(paymentIntentId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe || paymentIntentId.startsWith("sim_")) return "succeeded";
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status;
}
