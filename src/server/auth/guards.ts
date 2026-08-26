import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { Forbidden, Unauthorized } from "@/server/errors";

/** Require an authenticated user. Throws Unauthorized otherwise. */
export async function requireUser(): Promise<{ id: string; role: "customer" | "admin" }> {
  const session = await auth();
  if (!session?.user?.id) throw Unauthorized();
  return { id: session.user.id, role: session.user.role };
}

/** Require an admin — role is re-read from the DB, never trusted from the token. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw Unauthorized();
  const user = await getUserById(db, session.user.id);
  if (!user || user.role !== "admin") throw Forbidden();
  return user;
}
