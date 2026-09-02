import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, orders, serviceRecords, users, workshops } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";
import { Conflict, NotFound } from "@/server/errors";
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

/**
 * Promote an existing customer account to a workshop: create the workshop
 * record, link the user to it, and flip their role. Bumps session_version so
 * their current session picks up the new role on next request.
 */
export async function promoteUserToWorkshop(
  db: DB,
  input: {
    userEmail: string;
    name: string;
    location?: string;
    workHours?: string;
    contactName?: string;
    phone?: string;
  }
) {
  const email = input.userEmail.trim().toLowerCase();
  return db.transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw Conflict("Nu există un cont cu acest e-mail");
    if (user.role !== "customer") throw Conflict("Contul are deja rol de admin sau atelier");

    const [workshop] = await tx
      .insert(workshops)
      .values({
        name: input.name,
        location: input.location ?? null,
        workHours: input.workHours ?? null,
        contactName: input.contactName ?? null,
        phone: input.phone ?? null,
        email: user.email,
        active: true,
      })
      .returning();

    await tx
      .update(users)
      .set({
        role: "workshop",
        workshopId: workshop.id,
        sessionVersion: sql`${users.sessionVersion} + 1`,
      })
      .where(eq(users.id, user.id));

    return { workshop, userEmail: user.email };
  });
}

/**
 * Demote a workshop back to a plain customer: flip its linked login(s) to role
 * 'customer', unlink them, and deactivate the workshop. The workshop row is kept
 * (bikes + service_records reference it, onDelete restrict) so history stays
 * attributed; it just can't take new assignments. Bumps session_version so the
 * account loses workshop access on its next request.
 */
export async function demoteWorkshopToCustomer(db: DB, workshopId: string) {
  return db.transaction(async (tx) => {
    const [ws] = await tx.select().from(workshops).where(eq(workshops.id, workshopId)).limit(1);
    if (!ws) throw NotFound("Atelierul nu există");

    await tx
      .update(users)
      .set({
        role: "customer",
        workshopId: null,
        sessionVersion: sql`${users.sessionVersion} + 1`,
      })
      .where(eq(users.workshopId, workshopId));

    await tx.update(workshops).set({ active: false }).where(eq(workshops.id, workshopId));

    return { workshopId };
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
