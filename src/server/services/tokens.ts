import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { tokens } from "@/server/db/schema";

export type TokenKind =
  | "verify_email"
  | "password_reset"
  | "newsletter_confirm"
  | "newsletter_unsub";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Create a single-use token; only its sha256 hash is stored. Returns the
 *  plaintext token (put it in the email link, never persist it). */
export async function createToken(
  db: DB,
  input: { userId?: string | null; email?: string | null; kind: TokenKind; ttlMs: number }
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db.insert(tokens).values({
    userId: input.userId ?? null,
    email: input.email ?? null,
    kind: input.kind,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + input.ttlMs),
  });
  return token;
}

/** Consume a token: valid, unused and unexpired. Marks it used atomically
 *  (guarded UPDATE) so it can only be redeemed once. Returns its subject. */
export async function consumeToken(
  db: DB,
  token: string,
  kind: TokenKind
): Promise<{ userId: string | null; email: string | null } | null> {
  const tokenHash = sha256(token);
  const [row] = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.tokenHash, tokenHash), eq(tokens.kind, kind)))
    .limit(1);

  if (!row) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  const [claimed] = await db
    .update(tokens)
    .set({ usedAt: new Date() })
    .where(and(eq(tokens.id, row.id), isNull(tokens.usedAt)))
    .returning({ id: tokens.id });

  if (!claimed) return null; // lost the race - already consumed
  return { userId: row.userId, email: row.email };
}
