import { z } from "zod";

export const bikeCategoryValues = ["city", "trekking", "mtb", "road", "kids", "ebike"] as const;
export const gradeValues = ["A", "B", "C"] as const;

const MAX_PRICE_CENTS = 100_000_00; // 100k lei

export const createBikeSchema = z
  .object({
    sku: z.string().trim().min(1).max(40),
    frameNumber: z.string().trim().min(1).max(80),
    brand: z.string().trim().min(1).max(80),
    model: z.string().trim().min(1).max(120),
    modelYear: z.number().int().min(1970).max(2100).nullable().optional(),
    category: z.enum(bikeCategoryValues),
    frameSize: z.string().trim().min(1).max(40),
    wheelSize: z.string().trim().min(1).max(40),
    conditionGrade: z.enum(gradeValues),
    priceCents: z.number().int().min(0).max(MAX_PRICE_CENTS),
    oldPriceCents: z.number().int().min(0).max(MAX_PRICE_CENTS).nullable().optional(),
    description: z.string().max(4000).optional().default(""),
    workDone: z.array(z.string().max(200)).max(50).optional().default([]),
    status: z.enum(["draft", "available"]).optional().default("draft"),
    workshopId: z.string().uuid().nullable().optional(),
  })
  .strict();

export type CreateBikeInput = z.infer<typeof createBikeSchema>;
