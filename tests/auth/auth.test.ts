import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { accounts, users } from "@/server/db/schema";
import { rateLimit } from "@/server/services/rate-limit";
import { createToken, consumeToken } from "@/server/services/tokens";
import {
  authenticateCredentials,
  registerUser,
  resetPassword,
  upsertGoogleUser,
  verifyEmail,
} from "@/server/services/auth";
import { setupTestDb, teardownTestDb, truncateAll, type TestDb } from "../helpers/testDb";

let t: TestDb;
beforeAll(async () => {
  t = await setupTestDb();
});
afterAll(async () => {
  await teardownTestDb(t);
});
beforeEach(async () => {
  await truncateAll(t.pool);
});

async function verifiedUserWithPassword(email: string, password: string) {
  await registerUser(t.db, { email, password });
  await t.db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
  const [u] = await t.db.select().from(users).where(eq(users.email, email));
  return u;
}

describe("rate limiting", () => {
  it("allows up to max then rejects; a new window admits again", async () => {
    const key = "test:a";
    expect(await rateLimit(t.db, key, 3, 60)).toBe(true);
    expect(await rateLimit(t.db, key, 3, 60)).toBe(true);
    expect(await rateLimit(t.db, key, 3, 60)).toBe(true);
    expect(await rateLimit(t.db, key, 3, 60)).toBe(false);

    const key2 = "test:b";
    expect(await rateLimit(t.db, key2, 1, 1)).toBe(true);
    expect(await rateLimit(t.db, key2, 1, 1)).toBe(false);
    await new Promise((r) => setTimeout(r, 1100));
    expect(await rateLimit(t.db, key2, 1, 1)).toBe(true);
  });
});

describe("tokens", () => {
  it("are single-use, kind-scoped and expiring", async () => {
    const token = await createToken(t.db, {
      email: "tok@sc.ro",
      kind: "verify_email",
      ttlMs: 60_000,
    });
    expect(await consumeToken(t.db, token, "password_reset")).toBeNull(); // wrong kind
    expect(await consumeToken(t.db, token, "verify_email")).not.toBeNull(); // ok
    expect(await consumeToken(t.db, token, "verify_email")).toBeNull(); // single-use

    const expired = await createToken(t.db, { email: "x@sc.ro", kind: "verify_email", ttlMs: -1000 });
    expect(await consumeToken(t.db, expired, "verify_email")).toBeNull();
  });
});

describe("register + verify", () => {
  it("creates one unverified user and stays uniform on duplicate", async () => {
    await registerUser(t.db, { email: "reg@sc.ro", password: "correct-horse-1" });
    let rows = await t.db.select().from(users).where(eq(users.email, "reg@sc.ro"));
    expect(rows).toHaveLength(1);
    expect(rows[0].emailVerifiedAt).toBeNull();

    await registerUser(t.db, { email: "reg@sc.ro", password: "different-pass-1" });
    rows = await t.db.select().from(users).where(eq(users.email, "reg@sc.ro"));
    expect(rows).toHaveLength(1); // no duplicate
  });

  it("verifyEmail sets email_verified_at", async () => {
    const [u] = await t.db.insert(users).values({ email: "ver@sc.ro" }).returning();
    const token = await createToken(t.db, {
      userId: u.id,
      email: "ver@sc.ro",
      kind: "verify_email",
      ttlMs: 60_000,
    });
    expect(await verifyEmail(t.db, token)).toBe(true);
    const [after] = await t.db.select().from(users).where(eq(users.id, u.id));
    expect(after.emailVerifiedAt).not.toBeNull();
  });
});

describe("credential login uniformity", () => {
  it("rejects wrong password, unknown user, and unverified identically (null)", async () => {
    await registerUser(t.db, { email: "cred@sc.ro", password: "correct-horse-1" });
    // unverified cannot log in even with the right password
    expect(await authenticateCredentials(t.db, "cred@sc.ro", "correct-horse-1")).toBeNull();

    await t.db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, "cred@sc.ro"));
    expect((await authenticateCredentials(t.db, "cred@sc.ro", "correct-horse-1"))?.email).toBe("cred@sc.ro");

    expect(await authenticateCredentials(t.db, "cred@sc.ro", "wrong-password-0")).toBeNull();
    expect(await authenticateCredentials(t.db, "ghost@sc.ro", "whatever-00000")).toBeNull();
  });
});

describe("password reset invalidates sessions", () => {
  it("changes the password and bumps session_version", async () => {
    const before = await verifiedUserWithPassword("res@sc.ro", "old-password-1");
    expect(before.sessionVersion).toBe(0);

    const token = await createToken(t.db, {
      userId: before.id,
      email: "res@sc.ro",
      kind: "password_reset",
      ttlMs: 60_000,
    });
    expect(await resetPassword(t.db, token, "new-password-1")).toBe(true);

    const [after] = await t.db.select().from(users).where(eq(users.id, before.id));
    expect(after.sessionVersion).toBe(1);
    expect(await authenticateCredentials(t.db, "res@sc.ro", "new-password-1")).not.toBeNull();
    expect(await authenticateCredentials(t.db, "res@sc.ro", "old-password-1")).toBeNull();
  });
});

describe("google sign-in linking", () => {
  it("creates a verified user, links onto a verified account, rejects unverified", async () => {
    // brand-new email → verified user + account link
    expect(
      await upsertGoogleUser(t.db, { email: "g-new@sc.ro", verified: true, providerAccountId: "g1" })
    ).not.toBeNull();
    const [nu] = await t.db.select().from(users).where(eq(users.email, "g-new@sc.ro"));
    expect(nu.emailVerifiedAt).not.toBeNull();
    expect(await t.db.select().from(accounts).where(eq(accounts.userId, nu.id))).toHaveLength(1);

    // existing VERIFIED local account → links
    await verifiedUserWithPassword("g-ver@sc.ro", "pw-1234567890");
    expect(
      await upsertGoogleUser(t.db, { email: "g-ver@sc.ro", verified: true, providerAccountId: "g2" })
    ).not.toBeNull();

    // existing UNVERIFIED local account → rejected
    await registerUser(t.db, { email: "g-unv@sc.ro", password: "pw-1234567890" });
    expect(
      await upsertGoogleUser(t.db, { email: "g-unv@sc.ro", verified: true, providerAccountId: "g3" })
    ).toBeNull();

    // Google's email_verified === false → rejected
    expect(
      await upsertGoogleUser(t.db, { email: "g-x@sc.ro", verified: false, providerAccountId: "g4" })
    ).toBeNull();
  });
});
