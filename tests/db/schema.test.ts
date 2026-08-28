import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { bikes, orders, reservations, users } from "@/server/db/schema";
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

async function seedBike(sku = "RO-1") {
  const [b] = await t.db
    .insert(bikes)
    .values({
      sku,
      frameNumber: `F-${sku}`,
      brand: "Pegas",
      model: "Clasic",
      category: "city",
      frameSize: "M",
      wheelSize: "28",
      conditionGrade: "A",
      priceCents: 85000,
      status: "available",
    })
    .returning();
  return b;
}

describe("schema (migrations against real Postgres)", () => {
  it("enforces one active reservation per bike (partial unique index)", async () => {
    const [u1] = await t.db.insert(users).values({ email: "u1@sc.ro" }).returning();
    const [u2] = await t.db.insert(users).values({ email: "u2@sc.ro" }).returning();
    const b = await seedBike();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await t.db.insert(reservations).values({ bikeId: b.id, userId: u1.id, expiresAt });

    await expect(
      t.db.insert(reservations).values({ bikeId: b.id, userId: u2.id, expiresAt })
    ).rejects.toThrow();
  });

  it("allows a user to hold several bikes at once (basket)", async () => {
    const [u] = await t.db.insert(users).values({ email: "solo@sc.ro" }).returning();
    const b1 = await seedBike("RO-1");
    const b2 = await seedBike("RO-2");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await t.db.insert(reservations).values({ bikeId: b1.id, userId: u.id, expiresAt });
    // No longer rejected — one hold per bike, but many per user.
    await t.db.insert(reservations).values({ bikeId: b2.id, userId: u.id, expiresAt });

    const held = await t.db.select().from(reservations).where(eq(reservations.userId, u.id));
    expect(held).toHaveLength(2);
  });

  it("treats email as case-insensitive (citext unique)", async () => {
    await t.db.insert(users).values({ email: "Case@SC.ro" });
    await expect(t.db.insert(users).values({ email: "case@sc.ro" })).rejects.toThrow();
  });

  it("generates order_number from the SC-YYYY sequence and stores inet", async () => {
    const [u] = await t.db.insert(users).values({ email: "buyer@sc.ro" }).returning();
    const b = await seedBike();

    const [o] = await t.db
      .insert(orders)
      .values({
        userId: u.id,
        totalCents: b.priceCents,
        billingType: "individual",
        billingName: "Ion Popescu",
        billingEmail: "buyer@sc.ro",
        billingPhone: "+40700000000",
        billingStreet: "Str. Exemplu 1",
        billingCity: "Timișoara",
        billingCounty: "Timiș",
        billingPostalCode: "300000",
        deliveryMethod: "pickup",
        termsVersion: "draft-2026-08",
        termsAcceptedAt: new Date(),
        termsAcceptedIp: "203.0.113.7",
      })
      .returning();

    expect(o.orderNumber).toMatch(/^SC-\d{4}-000001$/);
    expect(o.totalCents).toBe(85000);
  });
});
