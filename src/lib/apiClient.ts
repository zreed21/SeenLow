/**
 * Shared API client for SeenLow.
 *
 * This file is intentionally dependency-free and framework-agnostic so it can be
 * COPIED VERBATIM into the future website (React, Vue, plain JS, mobile) and talk
 * to the exact same backend the app uses. Point `baseUrl` at the deployed API:
 *
 *   const api = createSeenLowClient({ baseUrl: "https://seenlow.com", apiKey: "..." });
 *   const { deals } = await api.listDeals({ top50: true });
 */

export interface SeenLowClientOptions {
  baseUrl: string;
  apiKey?: string;
  credentials?: RequestCredentials;
}

export function createSeenLowClient(opts: SeenLowClientOptions) {
  const base = opts.baseUrl.replace(/\/$/, "");

  async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      ...init,
      credentials: opts.credentials ?? "include",
      headers: {
        "Content-Type": "application/json",
        ...(opts.apiKey ? { "X-API-Key": opts.apiKey } : {}),
        ...(init.headers || {}),
      },
    });
    return res.json() as Promise<T>;
  }

  return {
    listDeals: (q: Record<string, string | number | boolean> = {}) => {
      const params = new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)]));
      return req<{ success: boolean; deals: unknown[]; count: number }>(`/api/deals?${params}`);
    },
    getDeal: (id: number) => req(`/api/deals/${id}`),
    verifyDeal: (id: number, displayedPrice: number, state: string) =>
      req(`/api/deals/${id}/verify`, { method: "POST", body: JSON.stringify({ displayedPrice, state }) }),

    register: (email: string, password: string, name?: string, subscribe?: boolean) =>
      req(`/api/auth/register`, { method: "POST", body: JSON.stringify({ email, password, name, subscribe }) }),
    login: (email: string, password: string) =>
      req(`/api/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => req(`/api/auth/logout`, { method: "POST" }),
    me: () => req(`/api/auth/me`),

    initOrder: (payload: Record<string, unknown>) =>
      req<{ success: boolean; orderId: number; orderNumber: string; totals: Record<string, number> }>(`/api/orders/init`, { method: "POST", body: JSON.stringify(payload) }),

    paymentConfig: () => req(`/api/payments/config`),
    createPaymentIntent: (orderId: number, acceptedPriceIncrease = false) =>
      req(`/api/payments/create-intent`, { method: "POST", body: JSON.stringify({ orderId, acceptedPriceIncrease }) }),
    createCheckoutSession: (orderId: number, uiMode: "hosted" | "embedded" = "hosted", urls: { successUrl?: string; cancelUrl?: string } = {}) =>
      req(`/api/payments/create-session`, { method: "POST", body: JSON.stringify({ orderId, uiMode, ...urls }) }),
    finalizeOrder: (orderId: number, method = "card") =>
      req(`/api/orders/${orderId}/finalize`, { method: "POST", body: JSON.stringify({ method }) }),
    refundOrder: (orderId: number, reason: string) =>
      req(`/api/orders/${orderId}/finalize`, { method: "POST", body: JSON.stringify({ action: "refund", reason }) }),

    listOrders: (userId: string) => req(`/api/orders?userId=${encodeURIComponent(userId)}`),
    createOrder: (payload: Record<string, unknown>) => req(`/api/orders`, { method: "POST", body: JSON.stringify(payload) }),
    getOrder: (id: number) => req(`/api/orders/${id}`),

    documentUrl: (orderId: number, type: "invoice" | "blind-shipping") => `${base}/api/documents/${orderId}/${type}`,

    watchlist: (userId: string) => req(`/api/watchlist?userId=${encodeURIComponent(userId)}`),
    toggleWatchlist: (dealId: number, userId: string) => req(`/api/watchlist`, { method: "POST", body: JSON.stringify({ dealId, userId }) }),
    subscribe: (email: string, source = "website") => req(`/api/newsletter`, { method: "POST", body: JSON.stringify({ email, source }) }),
    policies: () => req(`/api/policies`),
    stats: () => req(`/api/stats`),
  };
}

export type SeenLowClient = ReturnType<typeof createSeenLowClient>;
export const createFireDealsClient = createSeenLowClient;
