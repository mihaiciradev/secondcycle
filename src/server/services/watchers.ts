import { and, eq, isNull, sql } from "drizzle-orm";
import type { DB, DbOrTx } from "@/server/db/client";
import { bikeWatchers, bikes } from "@/server/db/schema";
import { sendEmail } from "@/server/email/send";
import { bikeAvailableTemplate } from "@/server/email/templates";
import { bikeTitle } from "@/lib/bike-name";
import { Conflict, NotFound } from "@/server/errors";

function baseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3082";
}

/**
 * Subscribe an email to be notified when a currently-reserved bike frees up.
 * No-op-ish if the bike is already available (caller can just buy it). One
 * pending watch per (bike, email) - the partial unique index dedupes.
 */
export async function watchBike(
  db: DB,
  input: { bikeId: string; email: string; userId?: string }
): Promise<{ status: "watching" | "available" }> {
  const [bike] = await db.select().from(bikes).where(eq(bikes.id, input.bikeId)).limit(1);
  if (!bike) throw NotFound("Bicicleta nu există");
  if (bike.status === "available") return { status: "available" };
  if (bike.status === "sold" || bike.status === "withdrawn" || bike.status === "draft") {
    throw Conflict("Bicicleta nu mai este disponibilă");
  }

  await db
    .insert(bikeWatchers)
    .values({ bikeId: input.bikeId, email: input.email.toLowerCase(), userId: input.userId ?? null })
    .onConflictDoNothing();
  return { status: "watching" };
}

/**
 * Email everyone with a pending watch on a bike that just became available and
 * mark them notified. Best-effort: called from the reservation-release path.
 * Accepts a tx so it can run inside the release transaction.
 */
export async function notifyBikeAvailable(db: DbOrTx, bikeId: string): Promise<void> {
  const watchers = await db
    .select()
    .from(bikeWatchers)
    .where(and(eq(bikeWatchers.bikeId, bikeId), isNull(bikeWatchers.notifiedAt)));
  if (watchers.length === 0) return;

  const [bike] = await db.select().from(bikes).where(eq(bikes.id, bikeId)).limit(1);
  if (!bike) return;

  const label = bikeTitle(bike);
  const link = `${baseUrl()}/bikes/${bike.sku}`;
  const { subject, html } = bikeAvailableTemplate({ bikeLabel: label, link });

  for (const w of watchers) {
    // sendEmail needs the pooled DB; it self-logs and never throws.
    await sendEmail(db as DB, { to: w.email, subject, html, template: "bike_available" });
  }

  await db
    .update(bikeWatchers)
    .set({ notifiedAt: sql`now()` })
    .where(and(eq(bikeWatchers.bikeId, bikeId), isNull(bikeWatchers.notifiedAt)));
}
