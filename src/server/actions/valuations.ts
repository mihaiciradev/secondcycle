"use server";

import { db } from "@/server/db/client";
import { submitValuation } from "@/server/services/valuations";
import { submitValuationSchema } from "@/server/validation/valuations";
import { actionError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

/** Public (no auth): a mechanic submits their price opinion via the token
 *  link. The token is the only credential; there is no account required. */
export async function submitValuationAction(input: unknown): Promise<Result> {
  try {
    const parsed = submitValuationSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    }
    const v = parsed.data;
    await submitValuation(db, v.token, {
      respondentName: v.respondentName,
      marketValueCents: v.marketValueCents ?? null,
      suggestedSpendCents: v.suggestedSpendCents ?? null,
      notWorth: v.notWorth ?? false,
      notes: v.notes?.trim() || null,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
