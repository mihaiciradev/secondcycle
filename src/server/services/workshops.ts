import { and, desc, eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, users, workshops } from "@/server/db/schema";
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
