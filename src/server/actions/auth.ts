"use server";

import { headers } from "next/headers";
import { db } from "@/server/db/client";
import { rateLimit } from "@/server/services/rate-limit";
import {
  registerUser,
  requestPasswordReset,
  resetPassword,
  setMarketingOptIn,
} from "@/server/services/auth";
import { deleteUserAccount } from "@/server/services/account";
import { AppError } from "@/server/errors";
import { requireUser } from "@/server/auth/guards";
import { forgotSchema, registerSchema, resetSchema } from "@/server/validation/auth";

type Result = { ok: true } | { ok: false; error: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** Register. Uniform 200 response (no account enumeration). Rate limit 3/min/IP. */
export async function registerAction(input: { email: string; password: string }): Promise<Result> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
  if (!(await rateLimit(db, `register:${await clientIp()}`, 3, 60))) {
    return { ok: false, error: "Prea multe încercări. Încearcă mai târziu." };
  }
  await registerUser(db, parsed.data);
  return { ok: true };
}

/** Forgot password. Uniform response. Rate limit 3/min/IP. */
export async function forgotPasswordAction(input: { email: string }): Promise<Result> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: true }; // stay uniform even on bad input
  if (!(await rateLimit(db, `forgot:${await clientIp()}`, 3, 60))) {
    return { ok: false, error: "Prea multe încercări. Încearcă mai târziu." };
  }
  await requestPasswordReset(db, parsed.data.email);
  return { ok: true };
}

/** Reset password with a token; invalidates existing sessions on success. */
export async function resetPasswordAction(input: { token: string; password: string }): Promise<Result> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
  const ok = await resetPassword(db, parsed.data.token, parsed.data.password);
  return ok ? { ok: true } : { ok: false, error: "Link invalid sau expirat." };
}

/** Toggle the caller's marketing opt-in. Auth enforced inside. */
export async function toggleMarketingAction(optIn: boolean): Promise<Result> {
  const user = await requireUser();
  await setMarketingOptIn(db, user.id, optIn);
  return { ok: true };
}

/** Delete (or anonymize, if orders exist) the caller's own account. */
export async function deleteAccountAction(): Promise<Result> {
  try {
    const user = await requireUser();
    await deleteUserAccount(db, user.id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
