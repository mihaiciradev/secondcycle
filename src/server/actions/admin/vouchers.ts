"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { users, partners } from "@/server/db/schema";
import {
  assignVoucher,
  createVoucher,
  deleteVoucher,
  formatVoucherValue,
  getVoucherById,
} from "@/server/services/vouchers";
import { assignVoucherSchema, createVoucherSchema } from "@/server/validation/vouchers";
import { sendEmail } from "@/server/email/send";
import { voucherAssignedTemplate } from "@/server/email/templates";
import { appBaseUrl } from "@/lib/app-env";
import { actionError } from "@/server/errors";

type Result = { ok: true } | { ok: false; error: string };
type EmailResult =
  | { ok: true; emailed: boolean; emailError: string | null }
  | { ok: false; error: string };

export async function createVoucherAction(input: unknown): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const parsed = createVoucherSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    const v = parsed.data;
    await createVoucher(db, {
      title: v.title,
      subtitle: v.subtitle ?? null,
      explanations: v.explanations,
      valueType: v.valueType,
      valueAmount: v.valueAmount,
      // Date-granular validity; validUntil is inclusive (end of that day).
      validFrom: v.validFrom ? new Date(`${v.validFrom}T00:00:00`) : null,
      validUntil: new Date(`${v.validUntil}T23:59:59`),
      partnerId: v.partnerId ?? null,
      createdByUserId: admin.id,
    });
    revalidatePath("/admin/collabs");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

/** Build + send the voucher e-mail; returns the send outcome. */
async function emailVoucher(voucher: Awaited<ReturnType<typeof getVoucherById>>, to: string) {
  if (!voucher) return { ok: false, error: null as string | null };
  let partnerName: string | null = null;
  if (voucher.partnerId) {
    const [p] = await db.select({ name: partners.name }).from(partners).where(eq(partners.id, voucher.partnerId)).limit(1);
    partnerName = p?.name ?? null;
  }
  const tpl = voucherAssignedTemplate({
    title: voucher.title,
    subtitle: voucher.subtitle,
    explanations: voucher.explanations,
    valueLabel: formatVoucherValue(voucher.valueType, voucher.valueAmount),
    code: voucher.code,
    partnerName,
    validUntil: new Date(voucher.validUntil).toLocaleDateString("ro-RO"),
    link: `${appBaseUrl()}/account/vouchers`,
  });
  return sendEmail(db, { to, subject: tpl.subject, html: tpl.html, template: "voucher_assigned" });
}

/** Assign a voucher to a recipient account (by e-mail) and e-mail them. */
export async function assignVoucherAction(input: unknown): Promise<EmailResult> {
  try {
    await requireAdmin();
    const parsed = assignVoucherSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };

    const email = parsed.data.recipientEmail.trim().toLowerCase();
    const [recipient] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);
    if (!recipient) {
      return { ok: false, error: "Nu există un cont Second Cycle cu acest e-mail. Recipientul trebuie să aibă cont." };
    }

    const voucher = await assignVoucher(db, parsed.data.voucherId, recipient.id);
    const mail = await emailVoucher(voucher, recipient.email);

    revalidatePath("/admin/collabs");
    return { ok: true, emailed: mail.ok, emailError: mail.error };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

/** Resend the voucher e-mail to its current recipient. */
export async function resendVoucherEmailAction(voucherId: string): Promise<EmailResult> {
  try {
    await requireAdmin();
    const voucher = await getVoucherById(db, voucherId);
    if (!voucher) return { ok: false, error: "Voucherul nu există." };
    if (!voucher.recipientUserId) return { ok: false, error: "Voucherul nu e alocat niciunui cont." };
    const [recipient] = await db.select({ email: users.email }).from(users).where(eq(users.id, voucher.recipientUserId)).limit(1);
    if (!recipient) return { ok: false, error: "Contul recipientului nu mai există." };

    const mail = await emailVoucher(voucher, recipient.email);
    return { ok: true, emailed: mail.ok, emailError: mail.error };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

/** Admin-only: permanently delete a voucher. */
export async function deleteVoucherAction(voucherId: string): Promise<Result> {
  try {
    await requireAdmin();
    if (typeof voucherId !== "string" || !voucherId) return { ok: false, error: "Id invalid" };
    await deleteVoucher(db, voucherId);
    revalidatePath("/admin/collabs");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
