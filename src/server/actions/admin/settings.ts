"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { SETTING, setFlag } from "@/server/services/settings";
import { AppError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

export async function setPaymentsEnabledAction(enabled: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await setFlag(db, SETTING.paymentsEnabled, Boolean(enabled));
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}

export async function setRevolutEnabledAction(enabled: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await setFlag(db, SETTING.revolutEnabled, Boolean(enabled));
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
