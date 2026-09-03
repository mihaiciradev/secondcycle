import { z } from "zod";

/** A visitor signals interest in a bike (no purchase, no hold). */
export const prebookSchema = z
  .object({
    bikeId: z.string().uuid(),
    name: z.string().trim().min(2, "Numele este necesar").max(120),
    email: z.string().email("Adresă de e-mail invalidă").max(255),
    phone: z.string().trim().max(40).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export type PrebookInput = z.infer<typeof prebookSchema>;
