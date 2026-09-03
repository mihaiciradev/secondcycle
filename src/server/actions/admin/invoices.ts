"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { issueInvoiceForOrder } from "@/server/accounting/softpro";
import { actionError } from "@/server/errors";

export async function retryInvoiceAction(
  orderId: string
): Promise<{ ok: boolean; info: string }> {
  try {
    await requireAdmin();
    const result = await issueInvoiceForOrder(db, orderId);
    revalidatePath("/admin/orders");
    return result;
  } catch (e) {
    return { ok: false, info: actionError(e, "admin/invoices:retry") };
  }
}
