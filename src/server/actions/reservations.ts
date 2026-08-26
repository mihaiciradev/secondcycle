"use server";

import { db } from "@/server/db/client";
import { requireUser } from "@/server/auth/guards";
import { rateLimit } from "@/server/services/rate-limit";
import { cancelReservation, reserveBike } from "@/server/services/reservations";
import { AppError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

function fail(e: unknown): Result {
  return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
}

/** Reserve a bike for the caller (30-minute hold). Rate limit 10/min/user. */
export async function reserveBikeAction(bikeId: string): Promise<Result> {
  try {
    const user = await requireUser();
    if (!(await rateLimit(db, `reserve:${user.id}`, 10, 60))) {
      return { ok: false, error: "Prea multe încercări. Încearcă din nou într-un minut." };
    }
    await reserveBike(db, bikeId, user.id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelReservationAction(id: string): Promise<Result> {
  try {
    const user = await requireUser();
    await cancelReservation(db, id, user.id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
