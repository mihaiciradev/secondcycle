import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, orders, reservations } from "@/server/db/schema";
import { RESERVATION_TTL_MINUTES, TERMS_VERSION } from "@/server/constants/app";
import { canAdminTransitionOrder, type OrderStatus } from "@/server/constants/statuses";
import { normalizeCui } from "@/server/constants/cui";
import { releaseOrderHolds } from "@/server/services/reservations";
import { Conflict, NotFound } from "@/server/errors";
import type { CreateOrderInput } from "@/server/validation/orders";

export type UnavailableItem = { bikeId: string; label?: string };

/**
 * Create ONE pending order from a basket of bike ids. Locks each requested bike
 * FOR UPDATE, clears its own lapsed hold, and takes only the ones still
 * available: each becomes a line item + a fresh 30-minute hold tied to this
 * order, and the bike goes 'reserved'. Bikes already taken are reported back in
 * `unavailable` (the checkout tells the buyer). 'pending' is intent, not payment.
 */
export async function createOrder(
  db: DB,
  params: CreateOrderInput & { userId: string; termsIp: string }
) {
  const bikeIds = [...new Set(params.bikeIds)].sort(); // stable order avoids deadlocks

  return db.transaction(async (tx) => {
    const available: (typeof bikes.$inferSelect)[] = [];
    const unavailable: UnavailableItem[] = [];

    for (const bikeId of bikeIds) {
      const [bike] = await tx.select().from(bikes).where(eq(bikes.id, bikeId)).for("update").limit(1);
      if (!bike) {
        unavailable.push({ bikeId });
        continue;
      }
      // Lazily clear this bike's own expired hold before judging availability.
      if (bike.status === "reserved") {
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
          bike.status = "available";
        }
      }
      if (bike.status !== "available") {
        unavailable.push({ bikeId, label: `${bike.brand} ${bike.model}` });
        continue;
      }
      available.push(bike);
    }

    if (available.length === 0) {
      throw Conflict("Bicicletele din coș nu mai sunt disponibile");
    }

    const totalCents = available.reduce((sum, b) => sum + b.priceCents, 0);
    const isCompany = params.billingType === "company";
    const isCourier = params.deliveryMethod === "courier";

    const [order] = await tx
      .insert(orders)
      .values({
        userId: params.userId,
        status: "pending",
        totalCents,
        billingType: params.billingType,
        billingName: params.billingName,
        billingEmail: params.billingEmail,
        billingPhone: params.billingPhone,
        billingStreet: params.billingStreet,
        billingCity: params.billingCity,
        billingCounty: params.billingCounty,
        billingPostalCode: params.billingPostalCode,
        billingCountry: "RO",
        companyName: isCompany ? (params.companyName ?? null) : null,
        companyCui: isCompany && params.companyCui ? normalizeCui(params.companyCui) : null,
        companyRegCom: isCompany ? (params.companyRegCom ?? null) : null,
        deliveryMethod: params.deliveryMethod,
        deliveryStreet: isCourier ? (params.deliveryStreet ?? null) : null,
        deliveryCity: isCourier ? (params.deliveryCity ?? null) : null,
        deliveryCounty: isCourier ? (params.deliveryCounty ?? null) : null,
        deliveryPostalCode: isCourier ? (params.deliveryPostalCode ?? null) : null,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: new Date(),
        termsAcceptedIp: params.termsIp,
        customerNote: params.customerNote ?? null,
      })
      .returning();

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
    for (const bike of available) {
      await tx.insert(orderItems).values({
        orderId: order.id,
        bikeId: bike.id,
        brand: bike.brand,
        model: bike.model,
        sku: bike.sku,
        priceCents: bike.priceCents,
      });
      await tx.insert(reservations).values({
        bikeId: bike.id,
        userId: params.userId,
        orderId: order.id,
        status: "active",
        expiresAt,
      });
      await tx.update(bikes).set({ status: "reserved" }).where(eq(bikes.id, bike.id));
    }

    return { order, items: available, unavailable, expiresAt };
  });
}

/** Fetch the line items (with live bike status) for a set of orders. */
async function itemsForOrders(db: DB, orderIds: string[]) {
  if (orderIds.length === 0) return new Map<string, (typeof orderItems.$inferSelect)[]>();
  const rows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(orderItems.createdAt);
  const byOrder = new Map<string, (typeof orderItems.$inferSelect)[]>();
  for (const r of rows) {
    const list = byOrder.get(r.orderId) ?? [];
    list.push(r);
    byOrder.set(r.orderId, list);
  }
  return byOrder;
}

export async function getUserOrders(db: DB, userId: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  const items = await itemsForOrders(db, rows.map((o) => o.id));
  return rows.map((order) => ({ order, items: items.get(order.id) ?? [] }));
}

/** Owner-only detail; a wrong owner gets null (caller returns 404, not 403). */
export async function getOrderForUser(db: DB, orderId: string, userId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.userId !== userId) return null;
  const items = await itemsForOrders(db, [orderId]);
  return { order, items: items.get(orderId) ?? [] };
}

/** Earliest active hold expiry for an order (drives the checkout countdown). */
export async function getOrderHoldExpiry(db: DB, orderId: string): Promise<Date | null> {
  const [row] = await db
    .select({ expiresAt: reservations.expiresAt })
    .from(reservations)
    .where(and(eq(reservations.orderId, orderId), eq(reservations.status, "active")))
    .orderBy(reservations.expiresAt)
    .limit(1);
  return row?.expiresAt ?? null;
}

// --- Admin -----------------------------------------------------------------

export async function adminListOrders(db: DB, status?: OrderStatus) {
  const rows = await db
    .select()
    .from(orders)
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt));
  const items = await itemsForOrders(db, rows.map((o) => o.id));
  return rows.map((order) => ({ order, items: items.get(order.id) ?? [] }));
}

/**
 * Admin order transition with bike side effects: confirm → all bikes sold;
 * cancel → release the holds and return bikes to available (+ notify watchers).
 */
export async function adminTransitionOrderStatus(
  db: DB,
  id: string,
  to: OrderStatus,
  adminNote?: string
) {
  if (to === "cancelled") {
    // Release outside/around the status flip so watchers get notified.
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw NotFound("Comanda nu există");
    if (!canAdminTransitionOrder(order.status, to)) throw Conflict("Tranziție de stare nepermisă");
    await releaseOrderHolds(db, id);
    const [updated] = await db
      .update(orders)
      .set({ status: to, ...(adminNote ? { adminNote } : {}) })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update").limit(1);
    if (!order) throw NotFound("Comanda nu există");
    if (!canAdminTransitionOrder(order.status, to)) throw Conflict("Tranziție de stare nepermisă");

    if (to === "confirmed") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const it of items) {
        await tx.update(bikes).set({ status: "sold" }).where(eq(bikes.id, it.bikeId));
      }
      // Consume the holds so expiry never touches a confirmed order's bikes.
      await tx
        .update(reservations)
        .set({ status: "converted" })
        .where(and(eq(reservations.orderId, id), eq(reservations.status, "active")));
    }

    const [updated] = await tx
      .update(orders)
      .set({ status: to, ...(adminNote ? { adminNote } : {}) })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  });
}
