"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { createValuationRequest, deleteValuation } from "@/server/services/valuations";
import { createValuationLinkSchema } from "@/server/validation/valuations";
import { SITE_URL } from "@/lib/content/site";
import { actionError } from "@/server/errors";

type Result =
  | { ok: true; token: string; url: string }
  | { ok: false; error: string };

/** Admin: create a private valuation link for a bike. If a mechanic name is
 *  known it is carried in the URL (?nume=) and pre-filled when opened. */
export async function createValuationLinkAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = createValuationLinkSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    }

    const { token } = await createValuationRequest(db, parsed.data);

    const name = parsed.data.suggestedName?.trim();
    const url = name
      ? `${SITE_URL}/evaluare/${token}?nume=${encodeURIComponent(name)}`
      : `${SITE_URL}/evaluare/${token}`;

    revalidatePath(`/admin/bikes/${parsed.data.bikeId}`);
    return { ok: true, token, url };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

type SimpleResult = { ok: true } | { ok: false; error: string };

/** Admin: delete a valuation slot (a sent link or a submitted opinion). */
export async function deleteValuationAction(id: string): Promise<SimpleResult> {
  try {
    await requireAdmin();
    if (typeof id !== "string" || !id) return { ok: false, error: "Id invalid" };
    const bikeId = await deleteValuation(db, id);
    if (bikeId) revalidatePath(`/admin/bikes/${bikeId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
