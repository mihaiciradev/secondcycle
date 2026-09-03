"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { markPrebookingContacted } from "@/server/services/prebookings";
import { AppError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

export async function markPrebookingContactedAction(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await markPrebookingContacted(db, id);
    revalidatePath("/admin/prebookings");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
