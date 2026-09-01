import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Revolut Pay via the Merchant API (Hosted Checkout Page). Mirrors the Stripe
 * redirect flow: create an order server-side, redirect the buyer to its
 * `checkout_url`, confirm with the ORDER_COMPLETED webhook.
 *
 * Sandbox vs production is NOT encoded in the key (unlike Stripe), so the host
 * is chosen by REVOLUT_ENV.
 */

// Pinned Merchant API version (YYYY-MM-DD). Required on every request.
const API_VERSION = "2024-09-01";

export function isRevolutConfigured(): boolean {
  return Boolean(process.env.REVOLUT_SECRET_KEY);
}

export function revolutMode(): "sandbox" | "production" {
  return process.env.REVOLUT_ENV === "production" ? "production" : "sandbox";
}

function baseUrl(): string {
  return revolutMode() === "production"
    ? "https://merchant.revolut.com"
    : "https://sandbox-merchant.revolut.com";
}

async function api<T>(path: string, init: { method: string; body?: unknown }): Promise<T> {
  const key = process.env.REVOLUT_SECRET_KEY;
  if (!key) throw new Error("REVOLUT_SECRET_KEY is not set");
  const res = await fetch(`${baseUrl()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Revolut-Api-Version": API_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Revolut API ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export type RevolutOrder = {
  id: string;
  token?: string;
  state: string; // pending | processing | authorised | completed | cancelled | failed
  checkout_url?: string;
  amount?: number;
  currency?: string;
};

/** Create a Merchant order. Amount is in minor units (bani). */
export async function createRevolutOrder(input: {
  amountMinor: number;
  currency: string;
  extRef: string; // our order id, for cross-reference
  redirectUrl: string;
  email?: string;
}): Promise<RevolutOrder> {
  return api<RevolutOrder>("/api/orders", {
    method: "POST",
    body: {
      amount: input.amountMinor,
      currency: input.currency,
      merchant_order_ext_ref: input.extRef,
      redirect_url: input.redirectUrl,
      ...(input.email ? { customer: { email: input.email } } : {}),
    },
  });
}

export async function retrieveRevolutOrder(id: string): Promise<RevolutOrder> {
  return api<RevolutOrder>(`/api/orders/${id}`, { method: "GET" });
}

/**
 * Verify a Revolut webhook signature. Revolut signs `v1.{timestamp}.{rawBody}`
 * with the endpoint's signing secret (HMAC-SHA256, hex) and sends it in the
 * `Revolut-Signature` header as `v1=<hex>`, plus a `Revolut-Request-Timestamp`.
 */
export function verifyRevolutWebhook(input: {
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  secret: string;
}): boolean {
  const { rawBody, signatureHeader, timestampHeader, secret } = input;
  if (!signatureHeader || !timestampHeader) return false;

  // Reject if the timestamp is outside a 5-minute tolerance.
  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) return false;

  const expected = createHmac("sha256", secret)
    .update(`v1.${timestampHeader}.${rawBody}`)
    .digest("hex");

  // The header may carry several space/comma-separated signatures; accept any match.
  const candidates = signatureHeader.split(/[,\s]+/).map((s) => s.replace(/^v1=/, "").trim());
  const exp = Buffer.from(expected);
  return candidates.some((c) => {
    const got = Buffer.from(c);
    return got.length === exp.length && timingSafeEqual(got, exp);
  });
}
