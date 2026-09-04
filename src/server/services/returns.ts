import { and, count, desc, eq, isNotNull } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { orderItems, orders, returnRequests, type ReturnItem } from "@/server/db/schema";
import { Invalid, NotFound } from "@/server/errors";

export type PurchasedBike = {
  orderId: string;
  orderNumber: string;
  bikeId: string;
  sku: string;
  brand: string;
  model: string;
  priceCents: number;
  paidAt: Date | null;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
};

/**
 * Every bike a user has actually bought, flattened across all their paid
 * orders (newest first). This is the set they may request a return for.
 */
export async function getPurchasedBikesForUser(db: DB, userId: string): Promise<PurchasedBike[]> {
  return db
    .select({
      orderId: orders.id,
      orderNumber: orders.orderNumber,
      bikeId: orderItems.bikeId,
      sku: orderItems.sku,
      brand: orderItems.brand,
      model: orderItems.model,
      priceCents: orderItems.priceCents,
      paidAt: orders.paidAt,
      billingName: orders.billingName,
      billingEmail: orders.billingEmail,
      billingPhone: orders.billingPhone,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.userId, userId), isNotNull(orders.paidAt)))
    .orderBy(desc(orders.paidAt));
}

/**
 * Record a return request. The item list is re-derived server-side from the
 * user's paid orders, so a tampered client can't invent bikes, prices or labels.
 * Per the EU/RO right of withdrawal, a reason is optional.
 */
export async function createReturnRequest(
  db: DB,
  input: {
    userId: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string | null;
    bikeIds: string[];
    reason?: string | null;
  }
): Promise<{ request: typeof returnRequests.$inferSelect; items: ReturnItem[] }> {
  const purchased = await getPurchasedBikesForUser(db, input.userId);
  const wanted = new Set(input.bikeIds);
  const chosen = purchased.filter((p) => wanted.has(p.bikeId));
  if (chosen.length === 0) {
    throw Invalid("Selectează cel puțin o bicicletă cumpărată.");
  }

  const items: ReturnItem[] = chosen.map((c) => ({
    orderId: c.orderId,
    orderNumber: c.orderNumber,
    bikeId: c.bikeId,
    sku: c.sku,
    brand: c.brand,
    model: c.model,
  }));

  const [request] = await db
    .insert(returnRequests)
    .values({
      userId: input.userId,
      contactName: input.contactName.trim(),
      contactEmail: input.contactEmail.trim(),
      contactPhone: input.contactPhone?.trim() || null,
      items,
      reason: input.reason?.trim() || null,
    })
    .returning();

  return { request, items };
}

/** A user's own return requests, newest first (for their account page). */
export async function getReturnsForUser(
  db: DB,
  userId: string
): Promise<(typeof returnRequests.$inferSelect)[]> {
  return db
    .select()
    .from(returnRequests)
    .where(eq(returnRequests.userId, userId))
    .orderBy(desc(returnRequests.createdAt));
}

export async function listReturnRequests(
  db: DB,
  status?: "pending" | "handled"
): Promise<(typeof returnRequests.$inferSelect)[]> {
  return status
    ? db
        .select()
        .from(returnRequests)
        .where(eq(returnRequests.status, status))
        .orderBy(desc(returnRequests.createdAt))
    : db.select().from(returnRequests).orderBy(desc(returnRequests.createdAt));
}

/** How many return requests still need handling (drives the admin task badge). */
export async function countPendingReturns(db: DB): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(returnRequests)
    .where(eq(returnRequests.status, "pending"));
  return Number(row?.n ?? 0);
}

export async function markReturnHandled(db: DB, id: string) {
  const [row] = await db
    .update(returnRequests)
    .set({ status: "handled", handledAt: new Date() })
    .where(eq(returnRequests.id, id))
    .returning();
  if (!row) throw NotFound("Cererea de retur nu există");
  return row;
}
