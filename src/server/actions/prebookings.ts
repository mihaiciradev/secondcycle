"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { createPrebooking } from "@/server/services/prebookings";
import { getBikeById } from "@/server/services/bikes";
import { prebookSchema } from "@/server/validation/prebookings";
import { sendEmail } from "@/server/email/send";
import { prebookRequestTemplate } from "@/server/email/templates";
import { company } from "@/lib/content/site";
import { AppError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

function baseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3082";
}

/** A visitor (guest or logged-in) prebooks a bike. No auth required. */
export async function submitPrebookAction(input: unknown): Promise<Result> {
  try {
    const parsed = prebookSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    const session = await auth();
    const row = await createPrebooking(db, {
      bikeId: parsed.data.bikeId,
      userId: session?.user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      note: parsed.data.note,
    });

    // Notify the shop (best-effort; the DB row is the reliable record).
    const bike = await getBikeById(db, row.bikeId);
    const label = bike ? `${bike.brand} ${bike.model}` : "Bicicletă";
    const { subject, html } = prebookRequestTemplate({
      bikeLabel: label,
      bikeSku: bike?.sku ?? "",
      name: row.name,
      email: row.email,
      phone: row.phone,
      note: row.note,
      link: `${baseUrl()}/admin/prebookings`,
    });
    await sendEmail(db, { to: company.contact.inboxEmail, subject, html, template: "prebook" });

    revalidatePath("/admin/prebookings");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AppError ? e.message : "A apărut o eroare" };
  }
}
