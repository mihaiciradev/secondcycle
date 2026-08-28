import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { bikes, orderItems, orders, reservations, users } from "@/server/db/schema";
import { expireOverdueReservations } from "@/server/services/reservations";
import { adminTransitionOrderStatus, createOrder } from "@/server/services/orders";
import { createBike } from "@/server/services/bikes";
import { createOrderSchema, type CreateOrderInput } from "@/server/validation/orders";
import type { CreateBikeInput } from "@/server/validation/bikes";
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

function bikeInput(sku: string, over: Partial<CreateBikeInput> = {}): CreateBikeInput {
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
    ...over,
  };
}

function orderInput(bikeIds: string[], over: Partial<CreateOrderInput> = {}): CreateOrderInput {
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
    ...over,
  } as CreateOrderInput;
}

async function user(email: string) {
  const [u] = await t.db.insert(users).values({ email }).returning();
  return u;
}

describe("checkout holds", () => {
  it("two concurrent checkouts for the same bike: exactly one wins", async () => {
    const u1 = await user("a@sc.ro");
    const u2 = await user("b@sc.ro");
    const bike = await createBike(t.db, bikeInput("RO-1"));

    const results = await Promise.allSettled([
      createOrder(t.db, { ...orderInput([bike.id]), userId: u1.id, termsIp: "0.0.0.0" }),
      createOrder(t.db, { ...orderInput([bike.id]), userId: u2.id, termsIp: "0.0.0.0" }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);

    const active = await t.db
      .select()
      .from(reservations)
      .where(and(eq(reservations.bikeId, bike.id), eq(reservations.status, "active")));
    expect(active).toHaveLength(1);
    const [b] = await t.db.select().from(bikes).where(eq(bikes.id, bike.id));
    expect(b.status).toBe("reserved");
  });

  it("checkout rejects a bike already held by someone else", async () => {
    const u1 = await user("a@sc.ro");
    const u2 = await user("b@sc.ro");
    const bike = await createBike(t.db, bikeInput("RO-1"));
    await createOrder(t.db, { ...orderInput([bike.id]), userId: u1.id, termsIp: "0.0.0.0" });

    await expect(
      createOrder(t.db, { ...orderInput([bike.id]), userId: u2.id, termsIp: "0.0.0.0" })
    ).rejects.toThrow();
  });

  it("an expired hold releases the bike and cancels the abandoned order", async () => {
    const u1 = await user("a@sc.ro");
    const u2 = await user("b@sc.ro");
    const bike = await createBike(t.db, bikeInput("RO-1"));
    const { order } = await createOrder(t.db, {
      ...orderInput([bike.id]),
      userId: u1.id,
      termsIp: "0.0.0.0",
    });

    await t.db
      .update(reservations)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(reservations.bikeId, bike.id));

    expect(await expireOverdueReservations(t.db)).toBe(1);
    expect((await t.db.select().from(bikes).where(eq(bikes.id, bike.id)))[0].status).toBe("available");
    expect((await t.db.select().from(orders).where(eq(orders.id, order.id)))[0].status).toBe("cancelled");

    // The bike can now be taken by another buyer.
    const { order: order2 } = await createOrder(t.db, {
      ...orderInput([bike.id]),
      userId: u2.id,
      termsIp: "0.0.0.0",
    });
    expect(order2.id).not.toBe(order.id);
  });

  it("a basket becomes one order with a summed total and one item per bike", async () => {
    const u1 = await user("a@sc.ro");
    const b1 = await createBike(t.db, bikeInput("RO-1", { priceCents: 100000 }));
    const b2 = await createBike(t.db, bikeInput("RO-2", { priceCents: 250000 }));

    const { order, items, unavailable } = await createOrder(t.db, {
      ...orderInput([b1.id, b2.id]),
      userId: u1.id,
      termsIp: "0.0.0.0",
    });
    expect(unavailable).toHaveLength(0);
    expect(items).toHaveLength(2);
    expect(order.totalCents).toBe(350000);

    const rows = await t.db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    expect(rows).toHaveLength(2);
  });

  it("snapshots the total independent of later price edits", async () => {
    const u1 = await user("a@sc.ro");
    const bike = await createBike(t.db, bikeInput("RO-1", { priceCents: 100000 }));
    const { order } = await createOrder(t.db, {
      ...orderInput([bike.id]),
      userId: u1.id,
      termsIp: "0.0.0.0",
    });
    expect(order.totalCents).toBe(100000);

    await t.db.update(bikes).set({ priceCents: 200000 }).where(eq(bikes.id, bike.id));
    const [o] = await t.db.select().from(orders).where(eq(orders.id, order.id));
    expect(o.totalCents).toBe(100000);
  });

  it("admin order transitions apply the right bike side effects", async () => {
    const u1 = await user("a@sc.ro");
    const b1 = await createBike(t.db, bikeInput("RO-1"));
    const { order: o1 } = await createOrder(t.db, {
      ...orderInput([b1.id]),
      userId: u1.id,
      termsIp: "0.0.0.0",
    });

    await adminTransitionOrderStatus(t.db, o1.id, "confirmed"); // bikes -> sold
    expect((await t.db.select().from(bikes).where(eq(bikes.id, b1.id)))[0].status).toBe("sold");
    await adminTransitionOrderStatus(t.db, o1.id, "completed");
    await expect(adminTransitionOrderStatus(t.db, o1.id, "cancelled")).rejects.toThrow(); // illegal

    const b2 = await createBike(t.db, bikeInput("RO-2"));
    const { order: o2 } = await createOrder(t.db, {
      ...orderInput([b2.id]),
      userId: u1.id,
      termsIp: "0.0.0.0",
    });
    await adminTransitionOrderStatus(t.db, o2.id, "cancelled"); // bikes -> available
    expect((await t.db.select().from(bikes).where(eq(bikes.id, b2.id)))[0].status).toBe("available");
  });
});

describe("order validation", () => {
  const base = {
    bikeIds: [randomUUID()],
    billingName: "Client Exemplu",
    billingEmail: "client@sc.ro",
    billingPhone: "0700000000",
    billingStreet: "Str. Exemplu 1",
    billingCity: "Timișoara",
    billingCounty: "Timiș",
    billingPostalCode: "300000",
    deliveryMethod: "pickup" as const,
    termsAccepted: true as const,
  };

  it("requires a non-empty basket", () => {
    expect(createOrderSchema.safeParse({ ...base, bikeIds: [], billingType: "individual" }).success).toBe(false);
  });

  it("enforces company, county, CUI and terms rules", () => {
    expect(createOrderSchema.safeParse({ ...base, billingType: "company" }).success).toBe(false);
    expect(
      createOrderSchema.safeParse({
        ...base,
        billingType: "company",
        companyName: "Exemplu S.R.L.",
        companyRegCom: "J40/1/2020",
        companyCui: "RO14837428",
      }).success
    ).toBe(true);
    expect(
      createOrderSchema.safeParse({
        ...base,
        billingType: "company",
        companyName: "X",
        companyRegCom: "J40/1/2020",
        companyCui: "RO123",
      }).success
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ ...base, billingType: "individual", companyName: "X" }).success
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ ...base, billingType: "individual", billingCounty: "Nicăieri" }).success
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ ...base, billingType: "individual", termsAccepted: false }).success
    ).toBe(false);
  });
});
