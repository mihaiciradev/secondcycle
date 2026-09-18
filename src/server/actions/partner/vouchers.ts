"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requirePartner } from "@/server/auth/guards";
import { redeemVoucherByCode } from "@/server/services/vouchers";
import { redeemVoucherSchema } from "@/server/validation/vouchers";
import { actionError } from "@/server/errors";

type Result =
  | { ok: true; title: string; code: string }
  | { ok: false; error: string };

/** Partner marks a voucher used by scanning/typing its code. One-way. */
export async function redeemVoucherAction(input: unknown): Promise<Result> {
  try {
    const partner = await requirePartner();
    const parsed = redeemVoucherSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Cod invalid" };

    const voucher = await redeemVoucherByCode(db, {
      code: parsed.data.code,
      partnerId: partner.partnerId,
      userId: partner.id,
    });
    revalidatePath("/account/scan");
    return { ok: true, title: voucher.title, code: voucher.code };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
