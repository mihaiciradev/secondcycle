import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, orders, serviceRecords, users, workshops } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";
import { Conflict } from "@/server/errors";
import type { CreateWorkshopInput } from "@/server/validation/workshops";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
}

/** Create a workshop plus its login (role='workshop'), pre-verified so it can log in. */
export async function createWorkshopAccount(db: DB, input: CreateWorkshopInput) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const [workshop] = await tx
      .insert(workshops)
      .values({
        name: input.name,
        location: input.location ?? null,
        workHours: input.workHours ?? null,
        contactName: input.contactName ?? null,
        phone: input.phone ?? null,
        email,
        active: true,
      })
      .returning();
    try {
      const [user] = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          role: "workshop",
          workshopId: workshop.id,
          emailVerifiedAt: new Date(),
        })
        .returning({ id: users.id, email: users.email });
      return { workshop, user };
    } catch (e) {
      if (isUniqueViolation(e)) throw Conflict("Există deja un cont cu acest e-mail");
      throw e;
    }
  });
}

export async function listWorkshops(db: DB) {
  return db
    .select({ workshop: workshops, accountEmail: users.email })
    .from(workshops)
    .leftJoin(users, eq(users.workshopId, workshops.id))
    .orderBy(desc(workshops.createdAt));
}

export async function listActiveWorkshops(db: DB) {
  return db
    .select({ id: workshops.id, name: workshops.name })
    .from(workshops)
    .where(eq(workshops.active, true))
    .orderBy(workshops.name);
}

export async function getWorkshop(db: DB, id: string) {
  const [row] = await db.select().from(workshops).where(eq(workshops.id, id)).limit(1);
  return row ?? null;
}

export async function listBikesForWorkshop(db: DB, workshopId: string) {
  return db.select().from(bikes).where(eq(bikes.workshopId, workshopId)).orderBy(desc(bikes.createdAt));
}

/** A bike, only if it is assigned to this workshop (object-level authorization). */
export async function getBikeForWorkshop(db: DB, bikeId: string, workshopId: string) {
  const [row] = await db
    .select()
    .from(bikes)
    .where(and(eq(bikes.id, bikeId), eq(bikes.workshopId, workshopId)))
    .limit(1);
  return row ?? null;
}

const num = (v: unknown): number => (v == null ? 0 : Number(v));

/**
 * Dashboard metrics for one workshop: the bikes it prepared that went on to
 * sell (count + sale value, all-time / this month / last 6 months) and how many
 * service papers it has filed. Sale value is the price the bike sold for, from
 * the paid order - the workshop's throughput, not a payout.
 */
export async function getWorkshopStats(db: DB, workshopId: string) {
  const soldJoin = db
    .select({
      n: count(),
      cents: sql<number>`coalesce(sum(${orderItems.priceCents}), 0)`,
    })
    .from(orderItems)
    .innerJoin(bikes, eq(bikes.id, orderItems.bikeId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId));

  const [allTime, thisMonth, monthly, papers] = await Promise.all([
    soldJoin.where(and(eq(bikes.workshopId, workshopId), isNotNull(orders.paidAt))),

    db
      .select({
        n: count(),
        cents: sql<number>`coalesce(sum(${orderItems.priceCents}), 0)`,
      })
      .from(orderItems)
      .innerJoin(bikes, eq(bikes.id, orderItems.bikeId))
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(bikes.workshopId, workshopId),
          isNotNull(orders.paidAt),
          gte(orders.paidAt, sql`date_trunc('month', now())`)
        )
      ),

    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${orders.paidAt}), 'YYYY-MM')`,
        n: count(),
        cents: sql<number>`coalesce(sum(${orderItems.priceCents}), 0)`,
      })
      .from(orderItems)
      .innerJoin(bikes, eq(bikes.id, orderItems.bikeId))
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(bikes.workshopId, workshopId),
          isNotNull(orders.paidAt),
          gte(orders.paidAt, sql`date_trunc('month', now()) - interval '5 months'`)
        )
      )
      .groupBy(sql`date_trunc('month', ${orders.paidAt})`)
      .orderBy(sql`date_trunc('month', ${orders.paidAt})`),

    db
      .select({ kind: serviceRecords.kind, n: count() })
      .from(serviceRecords)
      .where(eq(serviceRecords.workshopId, workshopId))
      .groupBy(serviceRecords.kind),
  ]);

  return {
    soldCount: num(allTime[0]?.n),
    soldCents: num(allTime[0]?.cents),
    soldThisMonthCount: num(thisMonth[0]?.n),
    soldThisMonthCents: num(thisMonth[0]?.cents),
    monthly: monthly.map((m) => ({ month: m.month, n: num(m.n), cents: num(m.cents) })),
    papers: {
      intake: num(papers.find((p) => p.kind === "intake")?.n),
      final: num(papers.find((p) => p.kind === "final")?.n),
    },
  };
}
