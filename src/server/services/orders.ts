import { and, desc, eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orders, reservations } from "@/server/db/schema";
import { TERMS_VERSION } from "@/server/constants/app";
import { canAdminTransitionOrder, type OrderStatus } from "@/server/constants/statuses";
import { normalizeCui } from "@/server/constants/cui";
import { Conflict, NotFound } from "@/server/errors";
import type { CreateOrderInput } from "@/server/validation/orders";

/**
 * Create an order from the caller's ACTIVE reservation on the bike (re-validated
 * FOR UPDATE). Snapshots the bike price, converts the reservation, and leaves
 * the bike 'reserved'. 'pending' is intent, not payment; an admin confirms it.
 */
export async function createOrder(
  db: DB,
  params: CreateOrderInput & { userId: string; termsIp: string }
) {
  return db.transaction(async (tx) => {
    const [res] = await tx
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.bikeId, params.bikeId),
          eq(reservations.userId, params.userId),
          eq(reservations.status, "active")
        )
      )
      .for("update")
      .limit(1);
    if (!res) throw Conflict("Nu ai o rezervare activă pentru această bicicletă");
    if (res.expiresAt.getTime() < Date.now()) throw Conflict("Rezervarea a expirat");

    const [bike] = await tx.select().from(bikes).where(eq(bikes.id, params.bikeId)).for("update").limit(1);
    if (!bike) throw NotFound("Bicicleta nu există");

    const bikePriceCents = bike.priceCents; // snapshot
    const isCompany = params.billingType === "company";
    const isCourier = params.deliveryMethod === "courier";

    const [order] = await tx
      .insert(orders)
      .values({
        bikeId: params.bikeId,
        userId: params.userId,
        reservationId: res.id,
        status: "pending",
        bikePriceCents,
        totalCents: bikePriceCents,
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

    await tx.update(reservations).set({ status: "converted" }).where(eq(reservations.id, res.id));
    return order;
  });
}

export async function getUserOrders(db: DB, userId: string) {
  return db
    .select({ order: orders, bike: bikes })
    .from(orders)
    .innerJoin(bikes, eq(bikes.id, orders.bikeId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

/** Owner-only detail; a wrong owner gets null (caller returns 404, not 403). */
export async function getOrderForUser(db: DB, orderId: string, userId: string) {
  const [row] = await db
    .select({ order: orders, bike: bikes })
    .from(orders)
    .innerJoin(bikes, eq(bikes.id, orders.bikeId))
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!row || row.order.userId !== userId) return null;
  return row;
}

// --- Admin -----------------------------------------------------------------

export async function adminListOrders(db: DB, status?: OrderStatus) {
  return db
    .select({ order: orders, bike: bikes })
    .from(orders)
    .innerJoin(bikes, eq(bikes.id, orders.bikeId))
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt));
}

/** Admin order transition with the bike side effects (confirm→sold, cancel→available). */
export async function adminTransitionOrderStatus(
  db: DB,
  id: string,
  to: OrderStatus,
  adminNote?: string
) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update").limit(1);
    if (!order) throw NotFound("Comanda nu există");
    if (!canAdminTransitionOrder(order.status, to)) throw Conflict("Tranziție de stare nepermisă");

    if (to === "confirmed") {
      await tx.update(bikes).set({ status: "sold" }).where(eq(bikes.id, order.bikeId));
    } else if (to === "cancelled") {
      await tx.update(bikes).set({ status: "available" }).where(eq(bikes.id, order.bikeId));
    }

    const [updated] = await tx
      .update(orders)
      .set({ status: to, ...(adminNote ? { adminNote } : {}) })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  });
}
