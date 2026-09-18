import { desc, eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { partners, users } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";
import { Conflict } from "@/server/errors";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
}

export type CreatePartnerInput = {
  name: string;
  contactName?: string;
  phone?: string;
  email: string;
  password: string;
};

/** Create a partner (collab) entity + a login account (role='partner'). */
export async function createPartnerAccount(db: DB, input: CreatePartnerInput) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const [partner] = await tx
      .insert(partners)
      .values({
        name: input.name,
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
          role: "partner",
          partnerId: partner.id,
          emailVerifiedAt: new Date(),
        })
        .returning({ id: users.id, email: users.email });
      return { partner, user };
    } catch (e) {
      if (isUniqueViolation(e)) throw Conflict("Există deja un cont cu acest e-mail");
      throw e;
    }
  });
}

/** All partners with their login e-mail, newest first (admin list). */
export async function listPartners(db: DB) {
  const rows = await db
    .select({
      partner: partners,
      accountEmail: users.email,
    })
    .from(partners)
    .leftJoin(users, eq(users.partnerId, partners.id))
    .orderBy(desc(partners.createdAt));
  return rows;
}

/** Active partners for the voucher-assignment dropdown. */
export async function listActivePartners(db: DB) {
  return db
    .select({ id: partners.id, name: partners.name })
    .from(partners)
    .where(eq(partners.active, true))
    .orderBy(partners.name);
}

export async function getPartner(db: DB, id: string) {
  const [row] = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return row ?? null;
}
