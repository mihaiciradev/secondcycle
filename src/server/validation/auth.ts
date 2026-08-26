import { z } from "zod";
import { isCommonPassword } from "@/server/auth/common-passwords";

const password = z
  .string()
  .min(10, "Parola trebuie să aibă cel puțin 10 caractere")
  .max(200, "Parola este prea lungă")
  .refine((p) => !isCommonPassword(p), "Alege o parolă mai puțin comună");

export const registerSchema = z
  .object({ email: z.string().email("Adresă de e-mail invalidă").max(255), password })
  .strict();

export const forgotSchema = z
  .object({ email: z.string().email("Adresă de e-mail invalidă").max(255) })
  .strict();

export const resetSchema = z.object({ token: z.string().min(1), password }).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
