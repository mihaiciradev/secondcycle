import { and, eq, isNull, lt, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orders, reservations } from "@/server/db/schema";
import { notifyBikeAvailable } from "@/server/services/watchers";

/**
 * Reservation model (v2): a bike is NOT locked while browsing or sitting in a
 * basket. It is locked only when the buyer starts checkout - `createOrder`
 * inserts an active hold per basket item (see services/orders.ts), all sharing
 * one 30-minute expiry and the order id. If the order isn't paid in time, the
 * holds expire, the bikes are released, the pending order is cancelled, and any
 * notify-me watchers are emailed.
 */

/**
 * Expire overdue active holds in bulk: release their bikes, cancel the abandoned
 * pending orders, and notify watchers of freed bikes. Idempotent and race-safe
 * (guarded UPDATE ... WHERE status='active' AND expires_at < now()). Called by
 * the cron and lazily by services that read bikes. Returns freed-bike count.
 */
export async function expireOverdueReservations(db: DB): Promise<number> {
  const freed = await db.transaction(async (tx) => {
    const expired = await tx
      .update(reservations)
      .set({ status: "expired" })
      .where(and(eq(reservations.status, "active"), lt(reservations.expiresAt, sql`now()`)))
      .returning({ bikeId: reservations.bikeId, orderId: reservations.orderId });

    const freedBikeIds: string[] = [];
    for (const r of expired) {
      const [released] = await tx
        .update(bikes)
        .set({ status: "available" })
        .where(and(eq(bikes.id, r.bikeId), eq(bikes.status, "reserved")))
        .returning({ id: bikes.id });
      if (released) freedBikeIds.push(r.bikeId);
    }

    // Cancel the abandoned orders (still pending + unpaid) whose holds lapsed.
    const orderIds = [...new Set(expired.map((e) => e.orderId).filter((x): x is string => !!x))];
    for (const orderId of orderIds) {
      await tx
        .update(orders)
        .set({ status: "cancelled" })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending"), isNull(orders.paidAt)));
    }
    return freedBikeIds;
  });

  // Email notify-me watchers outside the transaction (network I/O).
  for (const bikeId of freed) await notifyBikeAvailable(db, bikeId);
  return freed.length;
}

/**
 * Release every active hold attached to an order (used when an admin cancels a
 * pending order): mark holds cancelled, return bikes to available, notify
 * watchers. Returns the freed bike ids.
 */
export async function releaseOrderHolds(db: DB, orderId: string): Promise<string[]> {
  const freed = await db.transaction(async (tx) => {
    const rows = await tx
      .update(reservations)
      .set({ status: "cancelled" })
      .where(and(eq(reservations.orderId, orderId), eq(reservations.status, "active")))
      .returning({ bikeId: reservations.bikeId });

    const freedBikeIds: string[] = [];
    for (const r of rows) {
      const [released] = await tx
        .update(bikes)
        .set({ status: "available" })
        .where(and(eq(bikes.id, r.bikeId), eq(bikes.status, "reserved")))
        .returning({ id: bikes.id });
      if (released) freedBikeIds.push(r.bikeId);
    }
    return freedBikeIds;
  });

  for (const bikeId of freed) await notifyBikeAvailable(db, bikeId);
  return freed;
}
