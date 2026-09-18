import { z } from "zod";

const MAX_AMOUNT_BANI = 100_000_00; // 100k lei
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dată invalidă");

export const createVoucherSchema = z
  .object({
    title: z.string().trim().min(2, "Titlul e prea scurt").max(160),
    subtitle: z.string().trim().max(240).nullable().optional(),
    explanations: z.array(z.string().trim().min(1).max(500)).max(20).optional().default([]),
    valueType: z.enum(["percent", "amount"]),
    // percent: 1..100 ; amount: bani (RON cents), already converted client-side.
    valueAmount: z.number().int().positive("Valoarea trebuie să fie pozitivă"),
    validFrom: isoDate.nullable().optional(),
    validUntil: isoDate,
    partnerId: z.string().uuid().nullable().optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.valueType === "percent" && v.valueAmount > 100) {
      ctx.addIssue({ code: "custom", path: ["valueAmount"], message: "Procentul nu poate depăși 100." });
    }
    if (v.valueType === "amount" && v.valueAmount > MAX_AMOUNT_BANI) {
      ctx.addIssue({ code: "custom", path: ["valueAmount"], message: "Valoarea e prea mare." });
    }
  });

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;

export const assignVoucherSchema = z
  .object({
    voucherId: z.string().uuid(),
    recipientEmail: z.string().email("Adresă de e-mail invalidă").max(255),
  })
  .strict();

export const redeemVoucherSchema = z
  .object({
    code: z.string().trim().min(4, "Cod prea scurt").max(40),
  })
  .strict();
