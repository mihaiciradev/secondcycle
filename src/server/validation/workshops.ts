import { z } from "zod";
import { isCommonPassword } from "@/server/auth/common-passwords";
import { SERVICE_CHECK_STATUSES_ALL } from "@/server/constants/app";

const password = z
  .string()
  .min(10, "Parola trebuie să aibă cel puțin 10 caractere")
  .max(200)
  .refine((p) => !isCommonPassword(p), "Alege o parolă mai puțin comună");

export const createWorkshopSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    location: z.string().trim().max(200).optional(),
    workHours: z.string().trim().max(200).optional(),
    contactName: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    email: z.string().email("Adresă de e-mail invalidă").max(255),
    password,
  })
  .strict();

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;

export const serviceRecordSchema = z
  .object({
    bikeId: z.string().uuid(),
    kind: z.enum(["intake", "final"]),
    performedBy: z.string().trim().min(2).max(120),
    performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dată invalidă"),
    summary: z.string().max(2000).optional(),
    checklist: z
      .array(
        z.object({
          item: z.string().min(1).max(120),
          status: z.enum(SERVICE_CHECK_STATUSES_ALL),
          note: z.string().max(300).optional(),
        })
      )
      .max(50)
      .optional()
      .default([]),
    // Constatare (intake) valuation + repair estimate, in bani. Internal-only.
    marketValueCents: z.number().int().nonnegative().max(100_000_000).optional(),
    suggestedPurchaseCents: z.number().int().nonnegative().max(100_000_000).optional(),
    estimatedRepairCents: z.number().int().nonnegative().max(100_000_000).optional(),
    // Final paper: what the repair actually cost. Internal-only.
    actualRepairCents: z.number().int().nonnegative().max(100_000_000).optional(),
  })
  .strict();

export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>;

export const updateServiceRecordSchema = serviceRecordSchema.extend({
  recordId: z.string().uuid(),
});
export type UpdateServiceRecordInput = z.infer<typeof updateServiceRecordSchema>;
