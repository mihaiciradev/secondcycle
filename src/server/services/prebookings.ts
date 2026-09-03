import { count, desc, eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, prebookings } from "@/server/db/schema";
import { Conflict, NotFound } from "@/server/errors";

/**
 * Record interest in a bike. Does NOT reserve or hold it. The bike must exist
 * and be a listed one (available) so we don't collect leads for sold/draft bikes.
 */
export async function createPrebooking(
  db: DB,
  input: {
    bikeId: string;
    userId: string | null;
    name: string;
    email: string;
    phone?: string | null;
    note?: string | null;
  }
) {
  const [bike] = await db
    .select({ id: bikes.id, status: bikes.status })
    .from(bikes)
    .where(eq(bikes.id, input.bikeId))
    .limit(1);
  if (!bike) throw NotFound("Bicicleta nu există");
  if (bike.status === "sold") throw Conflict("Bicicleta este deja vândută");
  if (bike.status === "draft" || bike.status === "withdrawn") {
    throw Conflict("Bicicleta nu este disponibilă");
  }

  const [row] = await db
    .insert(prebookings)
    .values({
      bikeId: input.bikeId,
      userId: input.userId,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      note: input.note?.trim() || null,
    })
    .returning();
  return row;
}

export type PrebookingWithBike = typeof prebookings.$inferSelect & {
  bikeBrand: string;
  bikeModel: string;
  bikeSku: string;
  bikeStatus: string;
};

/** Prebookings joined with their bike, newest first (for the admin panel). */
export async function listPrebookings(
  db: DB,
  status?: "pending" | "contacted"
): Promise<PrebookingWithBike[]> {
  const rows = await db
    .select({
      p: prebookings,
      bikeBrand: bikes.brand,
      bikeModel: bikes.model,
      bikeSku: bikes.sku,
      bikeStatus: bikes.status,
    })
    .from(prebookings)
    .innerJoin(bikes, eq(bikes.id, prebookings.bikeId))
    .orderBy(desc(prebookings.createdAt));

  return rows
    .filter((r) => (status ? r.p.status === status : true))
    .map((r) => ({
      ...r.p,
      bikeBrand: r.bikeBrand,
      bikeModel: r.bikeModel,
      bikeSku: r.bikeSku,
      bikeStatus: r.bikeStatus,
    }));
}

/** How many prebookings still need a follow-up (drives the admin task badge). */
export async function countPendingPrebookings(db: DB): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(prebookings)
    .where(eq(prebookings.status, "pending"));
  return Number(row?.n ?? 0);
}

export async function markPrebookingContacted(db: DB, id: string) {
  const [row] = await db
    .update(prebookings)
    .set({ status: "contacted", handledAt: new Date() })
    .where(eq(prebookings.id, id))
    .returning();
  if (!row) throw NotFound("Prebooking-ul nu există");
  return row;
}
