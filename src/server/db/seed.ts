import { config } from "dotenv";
// Load env BEFORE anything reads process.env. (DATABASE_URL can be overridden
// inline on the command line to seed a different environment's DB.)
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";
import { hashPassword } from "../auth/password";

/**
 * Idempotent seed: ensures the admin user exists (created or updated) from
 * ADMIN_EMAIL / ADMIN_PASSWORD. The admin is stored pre-verified so they can
 * log in immediately. Safe to run repeatedly and against any environment's DB.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 });
  const db = drizzle(pool, { schema: { users } });

  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ role: "admin", passwordHash, emailVerifiedAt: existing.emailVerifiedAt ?? new Date() })
      .where(eq(users.email, email));
    console.log(`admin ensured (updated): ${email}`);
  } else {
    await db
      .insert(users)
      .values({ email, passwordHash, role: "admin", emailVerifiedAt: new Date() });
    console.log(`admin ensured (created): ${email}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
