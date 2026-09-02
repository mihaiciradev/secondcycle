"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { issueInvoiceForOrder } from "@/server/accounting/softpro";
import { AppError } from "@/server/errors";

export async function retryInvoiceAction(
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    await issueInvoiceForOrder(db, orderId);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
