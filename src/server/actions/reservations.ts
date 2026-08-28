"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { rateLimit } from "@/server/services/rate-limit";
import { watchBike } from "@/server/services/watchers";
import { AppError } from "@/server/errors";

type WatchResult =
  | { ok: true; status: "watching" | "available" }
  | { ok: false; error: string };

const watchSchema = z.object({
  bikeId: z.string().uuid(),
  email: z.string().email().max(255),
});

/**
 * Subscribe an email to be notified when a currently-reserved bike frees up.
 * Open to guests (any email); logged-in users are linked to their account.
 * Rate limited by IP+bike to prevent abuse.
 */
export async function watchBikeAction(input: unknown): Promise<WatchResult> {
  try {
    const parsed = watchSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Date invalide" };

    const session = await auth();
    const key = `watch:${session?.user?.id ?? parsed.data.email}`;
    if (!(await rateLimit(db, key, 10, 60))) {
      return { ok: false, error: "Prea multe încercări. Încearcă din nou într-un minut." };
    }

    const res = await watchBike(db, {
      bikeId: parsed.data.bikeId,
      email: parsed.data.email,
      userId: session?.user?.id,
    });
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
