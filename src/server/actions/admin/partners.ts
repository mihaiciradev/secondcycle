"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { createPartnerAccount } from "@/server/services/partners";
import { createPartnerSchema } from "@/server/validation/partners";
import { actionError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

export async function createPartnerAccountAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = createPartnerSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    await createPartnerAccount(db, parsed.data);
    revalidatePath("/admin/collabs");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
