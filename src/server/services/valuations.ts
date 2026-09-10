import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikeValuations, bikes } from "@/server/db/schema";
import { NotFound } from "@/server/errors";

export type ValuationRow = typeof bikeValuations.$inferSelect;

/** Create a valuation slot for a bike and return its capability token.
 *  The token is long and unguessable; it is the whole access control. */
export async function createValuationRequest(
  db: DB,
  input: { bikeId: string; suggestedName?: string | null }
): Promise<{ token: string }> {
  const token = randomBytes(24).toString("hex"); // 48 hex chars
  await db.insert(bikeValuations).values({
    bikeId: input.bikeId,
    token,
    suggestedName: input.suggestedName?.trim() || null,
  });
  return { token };
}

/** Delete a valuation slot. Returns its bikeId (for cache revalidation). */
export async function deleteValuation(db: DB, id: string): Promise<string | null> {
  const [row] = await db
    .delete(bikeValuations)
    .where(eq(bikeValuations.id, id))
    .returning({ bikeId: bikeValuations.bikeId });
  return row?.bikeId ?? null;
}

/** All valuation slots for a bike, newest first (for the admin page). */
export async function listValuationsForBike(db: DB, bikeId: string): Promise<ValuationRow[]> {
  return db
    .select()
    .from(bikeValuations)
    .where(eq(bikeValuations.bikeId, bikeId))
    .orderBy(desc(bikeValuations.createdAt));
}

/** Load a valuation by its token, together with the bike being valued. */
export async function getValuationByToken(db: DB, token: string) {
  const [row] = await db
    .select()
    .from(bikeValuations)
    .where(eq(bikeValuations.token, token))
    .limit(1);
  if (!row) return null;

  const [bike] = await db.select().from(bikes).where(eq(bikes.id, row.bikeId)).limit(1);
  if (!bike) return null;

  return { valuation: row, bike };
}

/** Record (or update) a mechanic's opinion. Idempotent per token: reopening
 *  the link and submitting again overwrites the previous answer. */
export async function submitValuation(
  db: DB,
  token: string,
  input: {
    respondentName: string;
    marketValueCents: number | null;
    suggestedSpendCents: number | null;
    notWorth: boolean;
    notes: string | null;
  }
): Promise<void> {
  const [updated] = await db
    .update(bikeValuations)
    .set({
      respondentName: input.respondentName,
      marketValueCents: input.notWorth ? null : input.marketValueCents,
      suggestedSpendCents: input.notWorth ? null : input.suggestedSpendCents,
      notWorth: input.notWorth,
      notes: input.notes,
      submittedAt: new Date(),
    })
    .where(eq(bikeValuations.token, token))
    .returning({ id: bikeValuations.id });

  if (!updated) throw NotFound("Link de evaluare inexistent");
}
