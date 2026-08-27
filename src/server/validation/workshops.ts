import { z } from "zod";
import { isCommonPassword } from "@/server/auth/common-passwords";
import { SERVICE_CHECK_STATUSES } from "@/server/constants/app";

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
          status: z.enum(SERVICE_CHECK_STATUSES),
          note: z.string().max(300).optional(),
        })
      )
      .max(50)
      .optional()
      .default([]),
  })
  .strict();

export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>;
