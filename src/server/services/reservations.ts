import { and, desc, eq, lt, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, reservations } from "@/server/db/schema";
import { RESERVATION_TTL_MINUTES } from "@/server/constants/app";
import { Conflict, NotFound } from "@/server/errors";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
}

/**
 * Expire overdue active holds in bulk and release their bikes. Idempotent and
 * race-safe (guarded UPDATE ... WHERE status='active' AND expires_at < now()).
 * Called by the cron and lazily by services that read reservations/bikes.
 */
export async function expireOverdueReservations(db: DB): Promise<number> {
  return db.transaction(async (tx) => {
    const expired = await tx
      .update(reservations)
      .set({ status: "expired" })
      .where(and(eq(reservations.status, "active"), lt(reservations.expiresAt, sql`now()`)))
      .returning({ bikeId: reservations.bikeId });

    for (const r of expired) {
      await tx
        .update(bikes)
        .set({ status: "available" })
        .where(and(eq(bikes.id, r.bikeId), eq(bikes.status, "reserved")));
    }
    return expired.length;
  });
}

/**
 * Reserve a bike for a user. One transaction: lock the bike row, clear its own
 * overdue hold, require it be available, insert the hold, mark it reserved.
 * The partial unique indexes (one active hold per bike, one per user) are the
 * last line of defense against races.
 */
export async function reserveBike(db: DB, bikeId: string, userId: string) {
  return db.transaction(async (tx) => {
    const [bike] = await tx.select().from(bikes).where(eq(bikes.id, bikeId)).for("update").limit(1);
    if (!bike) throw NotFound("Bicicleta nu există");

    let status = bike.status;
    if (status === "reserved") {
      const cleared = await tx
        .update(reservations)
        .set({ status: "expired" })
        .where(
          and(
            eq(reservations.bikeId, bikeId),
            eq(reservations.status, "active"),
            lt(reservations.expiresAt, sql`now()`)
          )
        )
        .returning({ id: reservations.id });
      if (cleared.length) {
        await tx.update(bikes).set({ status: "available" }).where(eq(bikes.id, bikeId));
        status = "available";
      }
    }

    if (status !== "available") throw Conflict("Bicicleta nu mai este disponibilă");

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
    let reservation;
    try {
      [reservation] = await tx
        .insert(reservations)
        .values({ bikeId, userId, status: "active", expiresAt })
        .returning();
    } catch (e) {
      if (isUniqueViolation(e)) throw Conflict("Ai deja o rezervare activă");
      throw e;
    }
    await tx.update(bikes).set({ status: "reserved" }).where(eq(bikes.id, bikeId));
    return reservation;
  });
}

/** Cancel the caller's own active reservation and release the bike. */
export async function cancelReservation(db: DB, reservationId: string, userId: string) {
  return db.transaction(async (tx) => {
    const [res] = await tx
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .for("update")
      .limit(1);
    if (!res || res.userId !== userId) throw NotFound("Rezervarea nu există"); // object-level auth
    if (res.status !== "active") throw Conflict("Rezervarea nu este activă");

    await tx.update(reservations).set({ status: "cancelled" }).where(eq(reservations.id, reservationId));
    await tx
      .update(bikes)
      .set({ status: "available" })
      .where(and(eq(bikes.id, res.bikeId), eq(bikes.status, "reserved")));
  });
}

/** The caller's current active hold (with its bike), after expiring overdue ones. */
export async function getActiveReservationForUser(db: DB, userId: string) {
  await expireOverdueReservations(db);
  const [row] = await db
    .select({ reservation: reservations, bike: bikes })
    .from(reservations)
    .innerJoin(bikes, eq(bikes.id, reservations.bikeId))
    .where(and(eq(reservations.userId, userId), eq(reservations.status, "active")))
    .orderBy(desc(reservations.createdAt))
    .limit(1);
  return row ?? null;
}
