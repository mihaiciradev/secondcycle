import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { serviceRecords } from "@/server/db/schema";
import { Conflict, Forbidden, NotFound } from "@/server/errors";
import type { ServiceRecordInput, UpdateServiceRecordInput } from "@/server/validation/workshops";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
}

export async function getServiceRecords(db: DB, bikeId: string) {
  return db.select().from(serviceRecords).where(eq(serviceRecords.bikeId, bikeId));
}

/** Create the intake or final paper for a bike. One of each per bike (unique index). */
export async function createServiceRecord(
  db: DB,
  input: ServiceRecordInput & { workshopId: string; createdBy: string }
) {
  try {
    const [row] = await db
      .insert(serviceRecords)
      .values({
        bikeId: input.bikeId,
        workshopId: input.workshopId,
        kind: input.kind,
        checklist: input.checklist ?? [],
        summary: input.summary ?? null,
        performedBy: input.performedBy,
        performedAt: input.performedAt,
        createdBy: input.createdBy,
      })
      .returning();
    return row;
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw Conflict(
        input.kind === "intake"
          ? "Există deja fișa de constatare pentru această bicicletă"
          : "Există deja fișa finală pentru această bicicletă"
      );
    }
    throw e;
  }
}

/** Edit an existing paper, only by the workshop that owns it. */
export async function updateServiceRecord(
  db: DB,
  input: UpdateServiceRecordInput & { workshopId: string }
) {
  const [existing] = await db
    .select()
    .from(serviceRecords)
    .where(eq(serviceRecords.id, input.recordId))
    .limit(1);
  if (!existing) throw NotFound("Fișa nu există");
  if (existing.workshopId !== input.workshopId) throw Forbidden();

  const [row] = await db
    .update(serviceRecords)
    .set({
      checklist: input.checklist ?? [],
      summary: input.summary ?? null,
      performedBy: input.performedBy,
      performedAt: input.performedAt,
    })
    .where(eq(serviceRecords.id, input.recordId))
    .returning();
  return row;
}
