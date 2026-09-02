import { z } from "zod";

/** Consumer's return (right-of-withdrawal) request. Reason is optional by law. */
export const returnRequestSchema = z
  .object({
    contactName: z.string().trim().min(2, "Numele este necesar").max(120),
    contactEmail: z.string().email("Adresă de e-mail invalidă").max(255),
    contactPhone: z.string().trim().max(40).optional(),
    bikeIds: z.array(z.string().uuid()).min(1, "Selectează cel puțin o bicicletă"),
    reason: z.string().trim().max(1000).optional(),
  })
  .strict();

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
