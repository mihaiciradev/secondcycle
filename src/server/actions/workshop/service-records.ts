"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireWorkshop } from "@/server/auth/guards";
import { getBikeForWorkshop } from "@/server/services/workshops";
import { createServiceRecord, updateServiceRecord } from "@/server/services/service-records";
import { serviceRecordSchema, updateServiceRecordSchema } from "@/server/validation/workshops";
import { AppError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

export async function createServiceRecordAction(input: unknown): Promise<Result> {
  try {
    const ws = await requireWorkshop();
    const parsed = serviceRecordSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    // Object-level authorization: the bike must be assigned to this workshop.
    const bike = await getBikeForWorkshop(db, parsed.data.bikeId, ws.workshopId);
    if (!bike) return { ok: false, error: "Bicicleta nu e alocată atelierului tău" };

    await createServiceRecord(db, { ...parsed.data, workshopId: ws.workshopId, createdBy: ws.id });
    revalidatePath(`/workshop/bikes/${parsed.data.bikeId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}

export async function updateServiceRecordAction(input: unknown): Promise<Result> {
  try {
    const ws = await requireWorkshop();
    const parsed = updateServiceRecordSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    const bike = await getBikeForWorkshop(db, parsed.data.bikeId, ws.workshopId);
    if (!bike) return { ok: false, error: "Bicicleta nu e alocată atelierului tău" };
    await updateServiceRecord(db, { ...parsed.data, workshopId: ws.workshopId });
    revalidatePath(`/workshop/bikes/${parsed.data.bikeId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
