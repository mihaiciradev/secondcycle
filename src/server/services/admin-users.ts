import { desc } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { users } from "@/server/db/schema";

/** All users with the fields the admin directory needs (newest first). */
export async function adminListUsers(db: DB) {
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      marketingOptIn: users.marketingOptIn,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}
