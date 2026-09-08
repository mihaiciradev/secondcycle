import { z } from "zod";
import { isValidCounty } from "@/server/constants/counties";
import { isValidCui } from "@/server/constants/cui";

export const createOrderSchema = z
  .object({
    bikeIds: z.array(z.string().uuid()).min(1, "Coșul este gol").max(20),
    billingType: z.enum(["individual", "company"]),
    billingName: z.string().trim().min(2).max(120),
    billingEmail: z.string().email().max(255),
    billingPhone: z.string().trim().min(6).max(30),
    billingStreet: z.string().trim().min(3).max(200),
    billingCity: z.string().trim().min(2).max(120),
    billingCounty: z.string().refine(isValidCounty, "Județ invalid"),
    billingPostalCode: z.string().trim().min(4).max(12),
    companyName: z.string().trim().max(160).optional(),
    companyCui: z.string().trim().max(20).optional(),
    companyRegCom: z.string().trim().max(40).optional(),
    deliveryMethod: z.enum(["pickup", "courier"]),
    deliveryStreet: z.string().trim().max(200).optional(),
    deliveryCity: z.string().trim().max(120).optional(),
    deliveryCounty: z.string().optional(),
    deliveryPostalCode: z.string().trim().max(12).optional(),
    customerNote: z.string().max(1000).optional(),
    // Bifa 1 (o dată pe comandă): Termeni + Confidențialitate.
    termsAccepted: z.literal(true),
    // Bifa 2 (per bicicletă, obligatorie): acceptarea stării + garanția redusă.
    bikeConsents: z
      .array(z.object({ bikeId: z.string().uuid(), accepted: z.literal(true) }))
      .max(20),
  })
  .strict()
  .superRefine((data, ctx) => {
    // Every bike in the cart must have its own accepted consent (Bifa 2).
    const consented = new Set(data.bikeConsents.map((c) => c.bikeId));
    for (const id of data.bikeIds) {
      if (!consented.has(id)) {
        ctx.addIssue({
          code: "custom",
          path: ["bikeConsents"],
          message: "Confirmă starea tehnică pentru fiecare bicicletă din coș.",
        });
        break;
      }
    }

    if (data.billingType === "company") {
      if (!data.companyName)
        ctx.addIssue({ code: "custom", path: ["companyName"], message: "Numele firmei este obligatoriu" });
      if (!data.companyRegCom)
        ctx.addIssue({ code: "custom", path: ["companyRegCom"], message: "Nr. Reg. Com. este obligatoriu" });
      if (!data.companyCui || !isValidCui(data.companyCui))
        ctx.addIssue({ code: "custom", path: ["companyCui"], message: "CUI invalid" });
    } else if (data.companyName || data.companyCui || data.companyRegCom) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Câmpurile de firmă nu se completează pentru persoană fizică",
      });
    }

    if (data.deliveryMethod === "courier") {
      if (!data.deliveryStreet)
        ctx.addIssue({ code: "custom", path: ["deliveryStreet"], message: "Adresa de livrare este obligatorie" });
      if (!data.deliveryCity)
        ctx.addIssue({ code: "custom", path: ["deliveryCity"], message: "Orașul de livrare este obligatoriu" });
      if (!data.deliveryCounty || !isValidCounty(data.deliveryCounty))
        ctx.addIssue({ code: "custom", path: ["deliveryCounty"], message: "Județ de livrare invalid" });
      if (!data.deliveryPostalCode)
        ctx.addIssue({ code: "custom", path: ["deliveryPostalCode"], message: "Cod poștal de livrare obligatoriu" });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
