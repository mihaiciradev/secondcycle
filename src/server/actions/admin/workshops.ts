"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import {
  createWorkshopAccount,
  demoteWorkshopToCustomer,
  promoteUserToWorkshop,
} from "@/server/services/workshops";
import { assignBikeToWorkshop } from "@/server/services/bikes";
import { createWorkshopSchema, promoteWorkshopSchema } from "@/server/validation/workshops";
import { actionError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

function fail(e: unknown): Result {
  return { ok: false, error: actionError(e) };
}

export async function createWorkshopAccountAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = createWorkshopSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    await createWorkshopAccount(db, parsed.data);
    revalidatePath("/admin/workshops");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function promoteUserToWorkshopAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = promoteWorkshopSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    await promoteUserToWorkshop(db, parsed.data);
    revalidatePath("/admin/workshops");
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function demoteWorkshopToCustomerAction(workshopId: string): Promise<Result> {
  try {
    await requireAdmin();
    await demoteWorkshopToCustomer(db, workshopId);
    revalidatePath("/admin/workshops");
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function assignBikeToWorkshopAction(
  bikeId: string,
  workshopId: string | null
): Promise<Result> {
  try {
    await requireAdmin();
    await assignBikeToWorkshop(db, bikeId, workshopId);
    revalidatePath("/admin/bikes");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
