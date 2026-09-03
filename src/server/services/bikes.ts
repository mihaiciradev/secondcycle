import { and, desc, eq, gte, inArray, lt, lte, or } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, reservations, serviceRecords, users } from "@/server/db/schema";
import { canAdminTransitionBike, type BikeStatus } from "@/server/constants/statuses";
import { Conflict, NotFound } from "@/server/errors";
import { expireOverdueReservations } from "@/server/services/reservations";
import type { CreateBikeInput } from "@/server/validation/bikes";

const PUBLIC_STATUSES = ["available", "reserved"] as const;
const DETAIL_HIDDEN = ["draft", "withdrawn"] as const;

export type ListFilters = {
  category?: (typeof bikes.category.enumValues)[number];
  grade?: (typeof bikes.conditionGrade.enumValues)[number];
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
  limit?: number;
};

function encodeCursor(d: Date, id: string): string {
  return Buffer.from(`${d.toISOString()}|${id}`).toString("base64url");
}
function decodeCursor(c: string): { createdAt: Date; id: string } | null {
  try {
    const [iso, id] = Buffer.from(c, "base64url").toString("utf8").split("|");
    if (!iso || !id) return null;
    return { createdAt: new Date(iso), id };
  } catch {
    return null;
  }
}

/** Public listing: only available + reserved, keyset pagination, max 50/page. */
export async function listPublicBikes(db: DB, filters: ListFilters = {}) {
  await expireOverdueReservations(db); // lazy expiry: freed bikes reappear on read
  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 50);
  const conds = [inArray(bikes.status, [...PUBLIC_STATUSES])];
  if (filters.category) conds.push(eq(bikes.category, filters.category));
  if (filters.grade) conds.push(eq(bikes.conditionGrade, filters.grade));
  if (typeof filters.minPrice === "number") conds.push(gte(bikes.priceCents, filters.minPrice));
  if (typeof filters.maxPrice === "number") conds.push(lte(bikes.priceCents, filters.maxPrice));
  if (filters.cursor) {
    const cur = decodeCursor(filters.cursor);
    if (cur) {
      conds.push(
        or(
          lt(bikes.createdAt, cur.createdAt),
          and(eq(bikes.createdAt, cur.createdAt), lt(bikes.id, cur.id))
        )!
      );
    }
  }
  const rows = await db
    .select()
    .from(bikes)
    .where(and(...conds))
    .orderBy(desc(bikes.createdAt), desc(bikes.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return { items, nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null };
}

/** Lightweight list of publicly-indexable bike SKUs, for the sitemap. */
export async function listPublicBikeSkus(db: DB) {
  return db
    .select({ sku: bikes.sku, updatedAt: bikes.updatedAt })
    .from(bikes)
    .where(inArray(bikes.status, [...PUBLIC_STATUSES]))
    .orderBy(desc(bikes.updatedAt));
}

/** Public detail: draft/withdrawn are hidden (caller returns 404). */
export async function getPublicBikeBySku(db: DB, sku: string) {
  await expireOverdueReservations(db); // lazy expiry before reading the bike's status
  const [row] = await db.select().from(bikes).where(eq(bikes.sku, sku)).limit(1);
  if (!row) return null;
  if ((DETAIL_HIDDEN as readonly string[]).includes(row.status)) return null;
  return row;
}

// --- Admin -----------------------------------------------------------------

export async function adminListBikes(db: DB, status?: BikeStatus) {
  return db
    .select()
    .from(bikes)
    .where(status ? eq(bikes.status, status) : undefined)
    .orderBy(desc(bikes.createdAt));
}

export async function getBikeById(db: DB, id: string) {
  const [row] = await db.select().from(bikes).where(eq(bikes.id, id)).limit(1);
  return row ?? null;
}

/**
 * Set the sale details of a bike (final price, acquisition cost, description,
 * work done), optionally publishing it. Enforces the intake -> constatare ->
 * publish flow: publishing requires the workshop's constatare paper to exist.
 * Price is locked once the bike is reserved or sold.
 */
export async function saveBikeSaleDetails(
  db: DB,
  id: string,
  input: {
    priceCents: number;
    acquisitionCostCents: number | null;
    description: string;
    workDone: string[];
  },
  opts: { publish: boolean }
) {
  return db.transaction(async (tx) => {
    const [bike] = await tx.select().from(bikes).where(eq(bikes.id, id)).for("update").limit(1);
    if (!bike) throw NotFound("Bicicleta nu există");

    // Reserved/sold: the price is frozen, but the copy (description + work list)
    // stays editable so typos can still be fixed. Ignore any price change.
    if (bike.status === "sold" || bike.status === "reserved") {
      const [updated] = await tx
        .update(bikes)
        .set({ description: input.description, workDone: input.workDone })
        .where(eq(bikes.id, id))
        .returning();
      return updated;
    }

    if (opts.publish) {
      const [intake] = await tx
        .select({ id: serviceRecords.id })
        .from(serviceRecords)
        .where(and(eq(serviceRecords.bikeId, id), eq(serviceRecords.kind, "intake")))
        .limit(1);
      if (!intake) throw Conflict("Poți publica doar după fișa de constatare a atelierului");
    }

    const [updated] = await tx
      .update(bikes)
      .set({
        priceCents: input.priceCents,
        acquisitionCostCents: input.acquisitionCostCents,
        description: input.description,
        workDone: input.workDone,
        ...(opts.publish ? { status: "available" as const } : {}),
      })
      .where(eq(bikes.id, id))
      .returning();
    return updated;
  });
}

/**
 * Set (or clear, with an empty email) the bike's owner by their account email.
 * The owner must be a registered user so they can request withdrawal from their
 * account.
 */
export async function assignBikeOwner(db: DB, bikeId: string, email: string) {
  const clean = email.trim().toLowerCase();
  let ownerUserId: string | null = null;
  if (clean) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, clean)).limit(1);
    if (!u) throw Conflict("Nu există un cont cu acest e-mail. Proprietarul trebuie să aibă cont.");
    ownerUserId = u.id;
  }
  const [row] = await db.update(bikes).set({ ownerUserId }).where(eq(bikes.id, bikeId)).returning();
  if (!row) throw NotFound("Bicicleta nu există");
  return row;
}

/** Bikes a user consigned that are still listed (not sold/withdrawn). */
export async function getListedBikesForOwner(db: DB, userId: string) {
  return db
    .select()
    .from(bikes)
    .where(and(eq(bikes.ownerUserId, userId), inArray(bikes.status, ["draft", "available", "reserved"])))
    .orderBy(desc(bikes.createdAt));
}

/** Replace a bike's ordered photo keys (first key is the cover). */
export async function setBikePhotos(db: DB, id: string, photos: string[]) {
  const [row] = await db.update(bikes).set({ photos }).where(eq(bikes.id, id)).returning();
  return row ?? null;
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
}

export async function createBike(db: DB, input: CreateBikeInput) {
  try {
    const [row] = await db
      .insert(bikes)
      .values({
        sku: input.sku,
        frameNumber: input.frameNumber,
        brand: input.brand,
        model: input.model,
        modelYear: input.modelYear ?? null,
        category: input.category,
        frameSize: input.frameSize,
        wheelSize: input.wheelSize,
        conditionGrade: input.conditionGrade,
        priceCents: input.priceCents,
        oldPriceCents: input.oldPriceCents ?? null,
        provisionalPriceCents: input.provisionalPriceCents ?? null,
        acquisitionCostCents: input.acquisitionCostCents ?? null,
        description: input.description ?? "",
        workDone: input.workDone ?? [],
        status: input.status ?? "draft",
        workshopId: input.workshopId ?? null,
      })
      .returning();
    return row;
  } catch (e) {
    if (isUniqueViolation(e)) throw Conflict("Există deja o bicicletă cu acest SKU");
    throw e;
  }
}

/**
 * Edit a bike's core specs (brand, model, category, sizes, condition, SKU,
 * frame number, year, old price). Allowed in any status. Changing the SKU also
 * changes the public URL (/bikes/<sku>).
 */
export async function updateBikeDetails(
  db: DB,
  id: string,
  input: {
    sku: string;
    frameNumber: string;
    brand: string;
    model: string;
    modelYear: number | null;
    category: (typeof bikes.$inferInsert)["category"];
    frameSize: string;
    wheelSize: string;
    conditionGrade: (typeof bikes.$inferInsert)["conditionGrade"];
    oldPriceCents: number | null;
  }
) {
  try {
    const [row] = await db
      .update(bikes)
      .set({
        sku: input.sku,
        frameNumber: input.frameNumber,
        brand: input.brand,
        model: input.model,
        modelYear: input.modelYear,
        category: input.category,
        frameSize: input.frameSize,
        wheelSize: input.wheelSize,
        conditionGrade: input.conditionGrade,
        oldPriceCents: input.oldPriceCents,
      })
      .where(eq(bikes.id, id))
      .returning();
    if (!row) throw NotFound("Bicicleta nu există");
    return row;
  } catch (e) {
    if (isUniqueViolation(e)) throw Conflict("Există deja o bicicletă cu acest SKU");
    throw e;
  }
}

/** Assign (or clear) the workshop that handles a bike's service papers. */
export async function assignBikeToWorkshop(db: DB, bikeId: string, workshopId: string | null) {
  const [row] = await db
    .update(bikes)
    .set({ workshopId })
    .where(eq(bikes.id, bikeId))
    .returning({ id: bikes.id });
  if (!row) throw NotFound("Bicicleta nu există");
}

/** Admin status transition. reserved→available force-releases the active hold. */
export async function adminTransitionBikeStatus(db: DB, id: string, to: BikeStatus) {
  return db.transaction(async (tx) => {
    const [bike] = await tx.select().from(bikes).where(eq(bikes.id, id)).for("update").limit(1);
    if (!bike) throw NotFound("Bicicleta nu există");
    if (bike.status === to) return bike;
    if (!canAdminTransitionBike(bike.status, to)) throw Conflict("Tranziție de stare nepermisă");

    if (bike.status === "reserved" && to === "available") {
      await tx
        .update(reservations)
        .set({ status: "cancelled" })
        .where(and(eq(reservations.bikeId, id), eq(reservations.status, "active")));
    }

    const [updated] = await tx.update(bikes).set({ status: to }).where(eq(bikes.id, id)).returning();
    return updated;
  });
}

/** Hard-delete only a draft with no orders/service records/reservations. */
export async function deleteDraftBike(db: DB, id: string) {
  const bike = await getBikeById(db, id);
  if (!bike) throw NotFound("Bicicleta nu există");
  if (bike.status !== "draft") throw Conflict("Doar ciornele pot fi șterse");

  const [o] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.bikeId, id))
    .limit(1);
  const [s] = await db
    .select({ id: serviceRecords.id })
    .from(serviceRecords)
    .where(eq(serviceRecords.bikeId, id))
    .limit(1);
  const [r] = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(eq(reservations.bikeId, id))
    .limit(1);
  if (o || s || r) throw Conflict("Bicicleta are relații și nu poate fi ștearsă");

  await db.delete(bikes).where(eq(bikes.id, id));
}
