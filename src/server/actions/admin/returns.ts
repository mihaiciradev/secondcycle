"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { markReturnHandled } from "@/server/services/returns";
import { AppError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

export async function markReturnHandledAction(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await markReturnHandled(db, id);
    revalidatePath("/admin/returns");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
