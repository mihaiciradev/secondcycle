import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { bikes, orders, reservations, users } from "@/server/db/schema";
import { deleteUserAccount } from "@/server/services/account";
import { createOrder } from "@/server/services/orders";
import { createBike } from "@/server/services/bikes";
import type { CreateBikeInput } from "@/server/validation/bikes";
import type { CreateOrderInput } from "@/server/validation/orders";
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

function bikeInput(sku: string): CreateBikeInput {
  return {
    sku,
    frameNumber: `F-${sku}`,
    brand: "Pegas",
    model: "Clasic",
    modelYear: 2020,
    category: "city",
    frameSize: "M",
    wheelSize: "28",
    conditionGrade: "A",
    priceCents: 100000,
    oldPriceCents: null,
    description: "",
    workDone: [],
    status: "available",
  };
}
function orderInput(bikeIds: string[]): CreateOrderInput {
  return {
    bikeIds,
    billingType: "individual",
    billingName: "Ion Popescu",
    billingEmail: "ion@sc.ro",
    billingPhone: "0700000000",
    billingStreet: "Str. Exemplu 1",
    billingCity: "Timișoara",
    billingCounty: "Timiș",
    billingPostalCode: "300000",
    deliveryMethod: "pickup",
    termsAccepted: true,
  } as CreateOrderInput;
}

describe("account deletion", () => {
  it("hard-deletes a user with no orders and releases held bikes", async () => {
    const [u] = await t.db.insert(users).values({ email: "gone@sc.ro" }).returning();
    const bike = await createBike(t.db, bikeInput("RO-1"));
    // A bare active hold (no order) — the account has nothing to retain.
    await t.db
      .insert(reservations)
      .values({ bikeId: bike.id, userId: u.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
    await t.db.update(bikes).set({ status: "reserved" }).where(eq(bikes.id, bike.id));

    const res = await deleteUserAccount(t.db, u.id);
    expect(res.anonymized).toBe(false);
    expect(await t.db.select().from(users).where(eq(users.id, u.id))).toHaveLength(0);
    expect((await t.db.select().from(bikes).where(eq(bikes.id, bike.id)))[0].status).toBe("available");
    expect(await t.db.select().from(reservations).where(eq(reservations.userId, u.id))).toHaveLength(0);
  });

  it("anonymizes a user that has orders and keeps the order", async () => {
    const [u] = await t.db.insert(users).values({ email: "keep@sc.ro" }).returning();
    const bike = await createBike(t.db, bikeInput("RO-1"));
    const { order } = await createOrder(t.db, {
      ...orderInput([bike.id]),
      userId: u.id,
      termsIp: "0.0.0.0",
    });

    const res = await deleteUserAccount(t.db, u.id);
    expect(res.anonymized).toBe(true);

    const [after] = await t.db.select().from(users).where(eq(users.id, u.id));
    expect(after).toBeDefined();
    expect(after.email).not.toBe("keep@sc.ro");
    expect(after.passwordHash).toBeNull();
    expect(await t.db.select().from(orders).where(eq(orders.id, order.id))).toHaveLength(1);
  });
});
