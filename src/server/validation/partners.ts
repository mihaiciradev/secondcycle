import { z } from "zod";
import { isCommonPassword } from "@/server/auth/common-passwords";

const password = z
  .string()
  .min(10, "Parola trebuie să aibă cel puțin 10 caractere")
  .max(200)
  .refine((p) => !isCommonPassword(p), "Alege o parolă mai puțin comună");

export const createPartnerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    contactName: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    email: z.string().email("Adresă de e-mail invalidă").max(255),
    password,
  })
  .strict();

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
