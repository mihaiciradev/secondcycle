"use server";

import { headers } from "next/headers";
import { db } from "@/server/db/client";
import { requireUser } from "@/server/auth/guards";
import { createOrder } from "@/server/services/orders";
import { createOrderSchema } from "@/server/validation/orders";
import { AppError } from "@/server/errors";

type Result = { ok: true; orderId: string } | { ok: false; error: string };

export async function createOrderAction(input: unknown): Promise<Result> {
  try {
    const user = await requireUser();
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";

    const order = await createOrder(db, { ...parsed.data, userId: user.id, termsIp: ip });
    return { ok: true, orderId: order.id };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
