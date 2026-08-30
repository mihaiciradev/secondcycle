import { eq, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { accounts, users } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createToken, consumeToken } from "@/server/services/tokens";
import { sendEmail } from "@/server/email/send";
import { passwordResetTemplate, verifyEmailTemplate } from "@/server/email/templates";
import { TOKEN_TTL } from "@/server/constants/app";

export type SessionUser = {
  id: string;
  email: string;
  role: "customer" | "admin" | "workshop";
  sessionVersion: number;
};

function baseUrl(): string {
  // Prod/local set AUTH_URL explicitly; on Vercel previews without it, fall back
  // to the deployment's own URL so email links always resolve.
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3082";
}

/** In dev (no verified email domain) print the link so flows are testable. */
function devLog(kind: string, link: string) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[auth:${kind}] ${link}`);
  }
}

// Constant-time guard: verify against a real hash even when the user is absent.
let dummyHashPromise: Promise<string> | null = null;
function dummyHash(): Promise<string> {
  if (!dummyHashPromise) dummyHashPromise = hashPassword("not-a-real-password-constant");
  return dummyHashPromise;
}

/** Internal - includes password_hash. Never returned to a client. */
async function getUserByEmailInternal(db: DB, email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

/** Public-safe user (no password_hash). */
export async function getUserById(db: DB, id: string) {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      marketingOptIn: users.marketingOptIn,
      sessionVersion: users.sessionVersion,
      workshopId: users.workshopId,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

/** Auth-oriented lookup by email (id/role/sessionVersion), no password_hash. */
export async function getAuthUserByEmail(db: DB, email: string) {
  const [row] = await db
    .select({
      id: users.id,
      role: users.role,
      sessionVersion: users.sessionVersion,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function getSessionVersion(db: DB, id: string): Promise<number | null> {
  const [row] = await db
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row?.sessionVersion ?? null;
}

async function issueVerifyEmail(db: DB, userId: string, email: string) {
  const token = await createToken(db, {
    userId,
    email,
    kind: "verify_email",
    ttlMs: TOKEN_TTL.verify_email,
  });
  const link = `${baseUrl()}/api/auth/verify?token=${token}`;
  devLog("verify", link);
  const { subject, html } = verifyEmailTemplate(link);
  await sendEmail(db, { to: email, subject, html, template: "verify_email" });
}

/** Register. Uniform outcome (no account enumeration): always resolves. */
export async function registerUser(
  db: DB,
  input: { email: string; password: string; marketingOptIn?: boolean }
) {
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmailInternal(db, email);
  if (existing) {
    if (!existing.emailVerifiedAt) await issueVerifyEmail(db, existing.id, email);
    return;
  }
  const passwordHash = await hashPassword(input.password);
  const optIn = Boolean(input.marketingOptIn);
  const [created] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "customer",
      marketingOptIn: optIn,
      marketingOptInAt: optIn ? new Date() : null,
    })
    .returning({ id: users.id });
  await issueVerifyEmail(db, created.id, email);
}

export async function verifyEmail(db: DB, token: string): Promise<boolean> {
  const res = await consumeToken(db, token, "verify_email");
  if (!res) return false;
  if (res.userId) {
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, res.userId));
  } else if (res.email) {
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, res.email));
  }
  return true;
}

/** Uniform outcome; sends a reset link only when the account exists. */
export async function requestPasswordReset(db: DB, emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const user = await getUserByEmailInternal(db, email);
  if (!user) return;
  const token = await createToken(db, {
    userId: user.id,
    email,
    kind: "password_reset",
    ttlMs: TOKEN_TTL.password_reset,
  });
  const link = `${baseUrl()}/reset-password?token=${token}`;
  devLog("reset", link);
  const { subject, html } = passwordResetTemplate(link);
  await sendEmail(db, { to: email, subject, html, template: "password_reset" });
}

/** Reset the password and invalidate all existing sessions (bump session_version). */
export async function resetPassword(db: DB, token: string, newPassword: string): Promise<boolean> {
  const res = await consumeToken(db, token, "password_reset");
  if (!res?.userId) return false;
  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash, sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, res.userId));
  return true;
}

/**
 * Credential check. Identical result for every failure mode (missing user,
 * wrong password, unverified) and constant-time even when the user is absent.
 */
export async function authenticateCredentials(
  db: DB,
  emailInput: string,
  password: string
): Promise<SessionUser | null> {
  const email = emailInput.trim().toLowerCase();
  const user = await getUserByEmailInternal(db, email);

  if (!user || !user.passwordHash) {
    await verifyPassword(await dummyHash(), password);
    return null;
  }
  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) return null;
  if (!user.emailVerifiedAt) return null;

  return { id: user.id, email: user.email, role: user.role, sessionVersion: user.sessionVersion };
}

/**
 * Google sign-in. Returns the app user, or null to reject the sign-in:
 * - Google's email_verified must be true.
 * - An existing account is linked ONLY if its email is already verified.
 * - Otherwise a new verified user + account link is created.
 */
export async function upsertGoogleUser(
  db: DB,
  input: { email: string; verified: boolean; providerAccountId: string }
): Promise<SessionUser | null> {
  if (!input.verified) return null;
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmailInternal(db, email);

  if (existing) {
    if (!existing.emailVerifiedAt) return null; // never link onto an unverified local account
    await db
      .insert(accounts)
      .values({ userId: existing.id, type: "oidc", provider: "google", providerAccountId: input.providerAccountId })
      .onConflictDoNothing({ target: [accounts.provider, accounts.providerAccountId] });
    return { id: existing.id, email: existing.email, role: existing.role, sessionVersion: existing.sessionVersion };
  }

  const [created] = await db
    .insert(users)
    .values({ email, role: "customer", emailVerifiedAt: new Date() })
    .returning();
  await db
    .insert(accounts)
    .values({ userId: created.id, type: "oidc", provider: "google", providerAccountId: input.providerAccountId })
    .onConflictDoNothing({ target: [accounts.provider, accounts.providerAccountId] });
  return { id: created.id, email: created.email, role: created.role, sessionVersion: created.sessionVersion };
}

export async function setMarketingOptIn(db: DB, userId: string, optIn: boolean) {
  await db
    .update(users)
    .set({ marketingOptIn: optIn, marketingOptInAt: optIn ? new Date() : null })
    .where(eq(users.id, userId));
}
