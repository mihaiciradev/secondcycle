import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { assignBikeToWorkshop, createBike } from "@/server/services/bikes";
import { createWorkshopAccount, getBikeForWorkshop } from "@/server/services/workshops";
import { createServiceRecord, getServiceRecords } from "@/server/services/service-records";
import { authenticateCredentials } from "@/server/services/auth";
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

describe("workshop accounts", () => {
  it("creates a workshop with a login that can authenticate as role=workshop", async () => {
    const { workshop, user } = await createWorkshopAccount(t.db, {
      name: "Atelier Central",
      location: "Timișoara",
      workHours: "L-V 9-18",
      email: "shop@sc.ro",
      password: "workshop-pass-1",
    });
    expect(workshop.name).toBe("Atelier Central");

    const authed = await authenticateCredentials(t.db, "shop@sc.ro", "workshop-pass-1");
    expect(authed?.role).toBe("workshop");

    const [u] = await t.db.select().from(users).where(eq(users.email, "shop@sc.ro"));
    expect(u.role).toBe("workshop");
    expect(u.workshopId).toBe(workshop.id);
    expect(user.email).toBe("shop@sc.ro");
  });

  it("scopes papers to assigned bikes and allows one intake + one final", async () => {
    const a = await createWorkshopAccount(t.db, { name: "A", email: "a@sc.ro", password: "workshop-pass-1" });
    const b = await createWorkshopAccount(t.db, { name: "B", email: "b@sc.ro", password: "workshop-pass-2" });
    const bike = await createBike(t.db, bikeInput("RO-1"));
    await assignBikeToWorkshop(t.db, bike.id, a.workshop.id);

    expect(await getBikeForWorkshop(t.db, bike.id, a.workshop.id)).not.toBeNull();
    expect(await getBikeForWorkshop(t.db, bike.id, b.workshop.id)).toBeNull();

    const intake = await createServiceRecord(t.db, {
      bikeId: bike.id,
      kind: "intake",
      performedBy: "Ion",
      performedAt: "2026-08-26",
      summary: "Uzură normală",
      checklist: [{ item: "Frânare", status: "attention", note: "plăcuțe uzate" }],
      workshopId: a.workshop.id,
      createdBy: a.user.id,
    });
    expect(intake.kind).toBe("intake");

    // second intake for the same bike is rejected
    await expect(
      createServiceRecord(t.db, {
        bikeId: bike.id,
        kind: "intake",
        performedBy: "Ion",
        performedAt: "2026-08-26",
        checklist: [],
        workshopId: a.workshop.id,
        createdBy: a.user.id,
      })
    ).rejects.toThrow();

    await createServiceRecord(t.db, {
      bikeId: bike.id,
      kind: "final",
      performedBy: "Ion",
      performedAt: "2026-08-27",
      checklist: [],
      workshopId: a.workshop.id,
      createdBy: a.user.id,
    });
    expect(await getServiceRecords(t.db, bike.id)).toHaveLength(2);
  });
});
