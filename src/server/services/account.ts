import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { accounts, bikes, orders, reservations, tokens, users } from "@/server/db/schema";

/**
 * Delete a user's account. Releases any bikes they were holding, removes their
 * reservations, logins and tokens. If they have orders, those are kept for
 * legal (accounting) retention and the account is anonymized instead of
 * hard-deleted, so the login is gone but the invoice records remain.
 */
export async function deleteUserAccount(db: DB, userId: string): Promise<{ anonymized: boolean }> {
  return db.transaction(async (tx) => {
    // Release bikes held by this user's active reservations.
    const active = await tx
      .select({ bikeId: reservations.bikeId })
      .from(reservations)
      .where(and(eq(reservations.userId, userId), eq(reservations.status, "active")));
    for (const r of active) {
      await tx
        .update(bikes)
        .set({ status: "available" })
        .where(and(eq(bikes.id, r.bikeId), eq(bikes.status, "reserved")));
    }
    await tx.delete(reservations).where(eq(reservations.userId, userId));

    const hasOrders = (
      await tx.select({ id: orders.id }).from(orders).where(eq(orders.userId, userId)).limit(1)
    ).length > 0;

    // Logins and tokens go in either case.
    await tx.delete(accounts).where(eq(accounts.userId, userId));
    await tx.delete(tokens).where(eq(tokens.userId, userId));

    if (hasOrders) {
      await tx
        .update(users)
        .set({
          email: `deleted+${randomUUID()}@deleted.invalid`,
          passwordHash: null,
          emailVerifiedAt: null,
          marketingOptIn: false,
          marketingOptInAt: null,
          sessionVersion: sql`${users.sessionVersion} + 1`,
        })
        .where(eq(users.id, userId));
      return { anonymized: true };
    }

    await tx.delete(users).where(eq(users.id, userId));
    return { anonymized: false };
  });
}
