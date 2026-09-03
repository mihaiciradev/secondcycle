"use server";

import { headers } from "next/headers";
import { db } from "@/server/db/client";
import { requireUser } from "@/server/auth/guards";
import { cancelPendingOrder, createOrder } from "@/server/services/orders";
import { startCheckout } from "@/server/services/payments";
import {
  getPaymentProvider,
  getPrebookEnabled,
  PAYMENTS_OFF_MESSAGE,
  PREBOOK_MESSAGE,
} from "@/server/services/settings";
import { createOrderSchema } from "@/server/validation/orders";
import { AppError } from "@/server/errors";

type CreateResult =
  | { ok: true; orderId: string; checkoutUrl?: string; unavailable: { bikeId: string; label?: string }[] }
  | { ok: false; error: string };

function originFrom(h: Headers): string {
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = h.get("host") ?? "localhost:3082";
  return `${proto}://${host}`;
}

/** User-facing error. Logs everything; reveals the real message outside prod. */
function errMsg(e: unknown): string {
  if (e instanceof AppError) return e.message;
  console.error("[checkout]", e);
  return process.env.VERCEL_ENV === "production"
    ? "A apărut o eroare"
    : `Eroare: ${e instanceof Error ? e.message : String(e)}`;
}

export async function createOrderAction(input: unknown): Promise<CreateResult> {
  try {
    const user = await requireUser();
    // Prebook mode: buying is off; visitors prebook instead.
    if (await getPrebookEnabled(db)) return { ok: false, error: PREBOOK_MESSAGE };
    // Ordering is gated on the admin flag + the active provider being configured.
    const provider = await getPaymentProvider(db);
    if (!provider) return { ok: false, error: PAYMENTS_OFF_MESSAGE };

    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
    const { order, unavailable } = await createOrder(db, {
      ...parsed.data,
      userId: user.id,
      termsIp: ip,
    });

    const checkoutUrl = await startCheckout(
      db,
      { orderId: order.id, userId: user.id, origin: originFrom(h) },
      provider
    );
    return { ok: true, orderId: order.id, checkoutUrl, unavailable };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/** Resume payment for an existing pending order (from the order page). */
export async function createCheckoutAction(
  orderId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const user = await requireUser();
    if (await getPrebookEnabled(db)) return { ok: false, error: PREBOOK_MESSAGE };
    const provider = await getPaymentProvider(db);
    if (!provider) return { ok: false, error: PAYMENTS_OFF_MESSAGE };
    const h = await headers();
    const url = await startCheckout(db, { orderId, userId: user.id, origin: originFrom(h) }, provider);
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/** Buyer cancels a pending order, releasing the bike(s) back into stock. */
export async function cancelOrderAction(
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireUser();
    await cancelPendingOrder(db, orderId, user.id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
