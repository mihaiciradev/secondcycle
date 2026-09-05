"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import {
  adminTransitionBikeStatus,
  assignBikeOwner,
  createBike,
  deleteDraftBike,
  saveBikeSaleDetails,
  updateBikeDetails,
} from "@/server/services/bikes";
import {
  bikeSaleSchema,
  createBikeSchema,
  updateBikeDetailsSchema,
} from "@/server/validation/bikes";
import { actionError } from "@/server/errors";
import type { BikeStatus } from "@/server/constants/statuses";

type Result = { ok: true } | { ok: false; error: string };

function fail(e: unknown): Result {
  return { ok: false, error: actionError(e) };
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

export async function saveBikeSaleAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = bikeSaleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    const { bikeId, publish, priceCents, acquisitionCostCents, description, workDone } = parsed.data;
    await saveBikeSaleDetails(
      db,
      bikeId,
      {
        priceCents,
        acquisitionCostCents: acquisitionCostCents ?? null,
        description: description ?? "",
        workDone: workDone ?? [],
      },
      { publish }
    );
    revalidatePath(`/admin/bikes/${bikeId}`);
    revalidatePath("/admin/bikes");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateBikeDetailsAction(input: unknown): Promise<Result> {
  try {
    await requireAdmin();
    const parsed = updateBikeDetailsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    const { bikeId, ...rest } = parsed.data;
    await updateBikeDetails(db, bikeId, {
      sku: rest.sku,
      frameNumber: rest.frameNumber ?? null,
      brand: rest.brand ?? null,
      model: rest.model ?? null,
      name: rest.name ?? null,
      modelYear: rest.modelYear ?? null,
      category: rest.category,
      frameSize: rest.frameSize ?? null,
      wheelSize: rest.wheelSize ?? null,
      conditionGrade: rest.conditionGrade,
      oldPriceCents: rest.oldPriceCents ?? null,
      adminNotes: rest.adminNotes ?? null,
    });
    revalidatePath(`/admin/bikes/${bikeId}`);
    revalidatePath("/admin/bikes");
    if (rest.sku) revalidatePath(`/bikes/${rest.sku}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function assignBikeOwnerAction(bikeId: string, email: string): Promise<Result> {
  try {
    await requireAdmin();
    await assignBikeOwner(db, bikeId, email);
    revalidatePath(`/admin/bikes/${bikeId}`);
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
