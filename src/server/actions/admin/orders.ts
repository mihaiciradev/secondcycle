"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { adminTransitionOrderStatus } from "@/server/services/orders";
import { AppError } from "@/server/errors";
import type { OrderStatus } from "@/server/constants/statuses";

type Result = { ok: true } | { ok: false; error: string };

export async function transitionOrderStatusAction(
  id: string,
  to: OrderStatus,
  adminNote?: string
): Promise<Result> {
  try {
    await requireAdmin();
    await adminTransitionOrderStatus(db, id, to, adminNote);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
