"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { SETTING, TEXT_SETTING, setFlag, setSetting } from "@/server/services/settings";
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

export async function setPrebookEnabledAction(enabled: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await setFlag(db, SETTING.prebookEnabled, Boolean(enabled));
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}

export async function setReturnsNotifyEmailAction(email: string): Promise<Result> {
  try {
    await requireAdmin();
    const clean = String(email ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      return { ok: false, error: "Adresă de e-mail invalidă" };
    }
    await setSetting(db, TEXT_SETTING.returnsNotifyEmail, clean);
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
