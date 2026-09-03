"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { createReturnRequest } from "@/server/services/returns";
import { getReturnsNotifyEmail } from "@/server/services/settings";
import { returnRequestSchema } from "@/server/validation/returns";
import { sendEmail } from "@/server/email/send";
import { returnRequestTemplate } from "@/server/email/templates";
import { actionError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };

function baseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3082";
}

/** A logged-in customer submits a return request for bike(s) they bought. */
export async function submitReturnRequestAction(input: unknown): Promise<Result> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, error: "Trebuie să fii autentificat ca să trimiți cererea." };

    const parsed = returnRequestSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    const { request, items } = await createReturnRequest(db, {
      userId: session.user.id,
      ...parsed.data,
    });

    // Notify the shop (best-effort; the DB record is the reliable backstop).
    const to = await getReturnsNotifyEmail(db);
    const { subject, html } = returnRequestTemplate({
      items: items.map((i) => ({
        brand: i.brand,
        model: i.model,
        sku: i.sku,
        orderNumber: i.orderNumber,
      })),
      reason: request.reason,
      contactName: request.contactName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      link: `${baseUrl()}/admin/returns`,
    });
    await sendEmail(db, { to, subject, html, template: "return_request" });

    revalidatePath("/admin/returns");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
