"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import {
  adminTransitionBikeStatus,
  createBike,
  deleteDraftBike,
} from "@/server/services/bikes";
import { createBikeSchema } from "@/server/validation/bikes";
import { AppError } from "@/server/errors";
import type { BikeStatus } from "@/server/constants/statuses";

type Result = { ok: true } | { ok: false; error: string };

function fail(e: unknown): Result {
  return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
}

export async function createBikeAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = createBikeSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    await createBike(db, parsed.data);
    revalidatePath("/admin/bikes");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function transitionBikeStatusAction(id: string, to: BikeStatus): Promise<Result> {
  try {
    await requireAdmin();
    await adminTransitionBikeStatus(db, id, to);
    revalidatePath("/admin/bikes");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteBikeAction(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await deleteDraftBike(db, id);
    revalidatePath("/admin/bikes");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
