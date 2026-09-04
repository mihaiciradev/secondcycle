import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { bikes, reservations, users } from "@/server/db/schema";
import {
  adminTransitionBikeStatus,
  createBike,
  deleteDraftBike,
  getPublicBikeBySku,
  listPublicBikes,
} from "@/server/services/bikes";
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

function input(sku: string, over: Partial<CreateBikeInput> = {}): CreateBikeInput {
  return {
    sku,
    frameNumber: `F-${sku}`,
    brand: "Pegas",
    model: "Clasic",
    modelYear: "2020",
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

describe("public visibility", () => {
  it("lists only available/reserved and hides draft/withdrawn detail", async () => {
    await createBike(t.db, input("RO-AV", { status: "available" }));
    await createBike(t.db, input("RO-DR", { status: "draft" }));
    const wd = await createBike(t.db, input("RO-WD", { status: "available" }));
    await adminTransitionBikeStatus(t.db, wd.id, "withdrawn");

    const { items } = await listPublicBikes(t.db);
    expect(items.map((b) => b.sku).sort()).toEqual(["RO-AV"]);

    expect(await getPublicBikeBySku(t.db, "RO-AV")).not.toBeNull();
    expect(await getPublicBikeBySku(t.db, "RO-DR")).toBeNull();
    expect(await getPublicBikeBySku(t.db, "RO-WD")).toBeNull();
  });

  it("paginates by cursor", async () => {
    for (let i = 0; i < 5; i++) await createBike(t.db, input(`RO-${i}`, { status: "available" }));
    const page1 = await listPublicBikes(t.db, { limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await listPublicBikes(t.db, { limit: 2, cursor: page1.nextCursor! });
    expect(page2.items).toHaveLength(2);
    const skus = new Set([...page1.items, ...page2.items].map((b) => b.sku));
    expect(skus.size).toBe(4); // no overlap between pages
  });
});

describe("admin status transitions", () => {
  it("allows legal transitions and rejects illegal ones", async () => {
    const b = await createBike(t.db, input("RO-T", { status: "draft" }));
    await adminTransitionBikeStatus(t.db, b.id, "available"); // draft -> available
    await adminTransitionBikeStatus(t.db, b.id, "withdrawn"); // available -> withdrawn
    await adminTransitionBikeStatus(t.db, b.id, "available"); // withdrawn -> available

    // illegal: available -> sold (admin cannot), draft -> sold
    await expect(adminTransitionBikeStatus(t.db, b.id, "sold")).rejects.toThrow();
  });

  it("reserved -> available force-releases the active reservation", async () => {
    const [u] = await t.db.insert(users).values({ email: "res@sc.ro" }).returning();
    const b = await createBike(t.db, input("RO-RES", { status: "available" }));
    await t.db.update(bikes).set({ status: "reserved" }).where(eq(bikes.id, b.id));
    await t.db.insert(reservations).values({
      bikeId: b.id,
      userId: u.id,
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await adminTransitionBikeStatus(t.db, b.id, "available");

    const [bike] = await t.db.select().from(bikes).where(eq(bikes.id, b.id));
    expect(bike.status).toBe("available");
    const [res] = await t.db.select().from(reservations).where(eq(reservations.bikeId, b.id));
    expect(res.status).toBe("cancelled");
  });
});

describe("delete rules", () => {
  it("deletes a draft, refuses non-draft, refuses draft with relations", async () => {
    const draft = await createBike(t.db, input("RO-D1", { status: "draft" }));
    await deleteDraftBike(t.db, draft.id);
    expect(await t.db.select().from(bikes).where(eq(bikes.id, draft.id))).toHaveLength(0);

    const avail = await createBike(t.db, input("RO-A1", { status: "available" }));
    await expect(deleteDraftBike(t.db, avail.id)).rejects.toThrow();

    const [u] = await t.db.insert(users).values({ email: "d@sc.ro" }).returning();
    const draft2 = await createBike(t.db, input("RO-D2", { status: "draft" }));
    await t.db.insert(reservations).values({
      bikeId: draft2.id,
      userId: u.id,
      status: "active",
      expiresAt: new Date(Date.now() + 1000),
    });
    await expect(deleteDraftBike(t.db, draft2.id)).rejects.toThrow();
  });
});
