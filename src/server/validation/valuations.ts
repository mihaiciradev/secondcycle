import { z } from "zod";

const MAX_PRICE_CENTS = 100_000_00; // 100k lei

/** Admin creates a shareable valuation link for a bike. */
export const createValuationLinkSchema = z
  .object({
    bikeId: z.string().uuid(),
    // Optional: the mechanic's name if known, pre-filled in the page.
    suggestedName: z.string().trim().max(120).nullable().optional(),
  })
  .strict();

/** The mechanic submits their opinion. Prices are optional when "not worth"
 *  is ticked, but otherwise the market price is required. */
export const submitValuationSchema = z
  .object({
    token: z.string().trim().min(10).max(200),
    respondentName: z.string().trim().min(2, "Spune-ne cine ești.").max(120),
    marketValueCents: z.number().int().min(0).max(MAX_PRICE_CENTS).nullable().optional(),
    suggestedSpendCents: z.number().int().min(0).max(MAX_PRICE_CENTS).nullable().optional(),
    notWorth: z.boolean().optional().default(false),
    notes: z.string().trim().max(4000).nullable().optional(),
  })
  .strict()
  .refine((v) => v.notWorth || v.marketValueCents != null, {
    message: "Adaugă un preț de piață sau bifează că nu merită.",
    path: ["marketValueCents"],
  });
