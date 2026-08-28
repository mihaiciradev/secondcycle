"use server";

import { headers } from "next/headers";
import { db } from "@/server/db/client";
import { requireUser } from "@/server/auth/guards";
import { createOrder } from "@/server/services/orders";
import { createCheckoutSession } from "@/server/services/payments";
import { isPaymentEnabled } from "@/server/payments/stripe";
import { createOrderSchema } from "@/server/validation/orders";
import { AppError } from "@/server/errors";

type CreateResult =
  | { ok: true; orderId: string; checkoutUrl?: string }
  | { ok: false; error: string };

function originFrom(h: Headers): string {
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = h.get("host") ?? "localhost:3082";
  return `${proto}://${host}`;
}

export async function createOrderAction(input: unknown): Promise<CreateResult> {
  try {
    const user = await requireUser();
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
    const order = await createOrder(db, { ...parsed.data, userId: user.id, termsIp: ip });

    // If Stripe is configured for this environment, hand off to hosted checkout.
    let checkoutUrl: string | undefined;
    if (isPaymentEnabled()) {
      checkoutUrl = await createCheckoutSession(db, {
        orderId: order.id,
        userId: user.id,
        origin: originFrom(h),
      });
    }
    return { ok: true, orderId: order.id, checkoutUrl };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}

/** Resume payment for an existing pending order (from the order page). */
export async function createCheckoutAction(
  orderId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const user = await requireUser();
    if (!isPaymentEnabled()) return { ok: false, error: "Plata nu este disponibilă." };
    const h = await headers();
    const url = await createCheckoutSession(db, { orderId, userId: user.id, origin: originFrom(h) });
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
