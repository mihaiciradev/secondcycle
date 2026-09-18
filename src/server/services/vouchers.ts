import { randomInt } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { partners, users, vouchers } from "@/server/db/schema";
import { Conflict, Invalid, NotFound } from "@/server/errors";

export type VoucherValueType = "percent" | "amount";
export type VoucherRow = typeof vouchers.$inferSelect;

// Unambiguous alphabet (no 0/O/1/I) for a code that is easy to read/type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  let body = "";
  for (let i = 0; i < 8; i++) body += ALPHABET[randomInt(ALPHABET.length)];
  return `SC-${body.slice(0, 4)}-${body.slice(4)}`;
}

/** Generate a code that isn't already taken (a few retries is plenty). */
async function uniqueCode(db: DB): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = randomCode();
    const [hit] = await db.select({ id: vouchers.id }).from(vouchers).where(eq(vouchers.code, code)).limit(1);
    if (!hit) return code;
  }
  throw Conflict("Nu am putut genera un cod unic, reîncearcă.");
}

export type CreateVoucherInput = {
  title: string;
  subtitle?: string | null;
  explanations: string[];
  valueType: VoucherValueType;
  valueAmount: number; // percent 1..100, or bani
  validFrom?: Date | null;
  validUntil: Date;
  partnerId?: string | null;
  createdByUserId: string;
};

export async function createVoucher(db: DB, input: CreateVoucherInput): Promise<VoucherRow> {
  const code = await uniqueCode(db);
  const [row] = await db
    .insert(vouchers)
    .values({
      code,
      title: input.title,
      subtitle: input.subtitle ?? null,
      explanations: input.explanations,
      valueType: input.valueType,
      valueAmount: input.valueAmount,
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil,
      partnerId: input.partnerId ?? null,
      createdByUserId: input.createdByUserId,
    })
    .returning();
  return row;
}

/** Admin view: every voucher with its partner name and recipient e-mail. */
export async function listAllVouchers(db: DB) {
  const recipient = users;
  return db
    .select({
      voucher: vouchers,
      partnerName: partners.name,
      recipientEmail: recipient.email,
    })
    .from(vouchers)
    .leftJoin(partners, eq(partners.id, vouchers.partnerId))
    .leftJoin(recipient, eq(recipient.id, vouchers.recipientUserId))
    .orderBy(desc(vouchers.createdAt));
}

/** Partner view: the vouchers they may redeem, with recipient e-mail. */
export async function listVouchersForPartner(db: DB, partnerId: string) {
  return db
    .select({ voucher: vouchers, recipientEmail: users.email })
    .from(vouchers)
    .leftJoin(users, eq(users.id, vouchers.recipientUserId))
    .where(eq(vouchers.partnerId, partnerId))
    .orderBy(desc(vouchers.createdAt));
}

/** Recipient view: the vouchers assigned to them, with partner name. */
export async function listVouchersForRecipient(db: DB, userId: string) {
  return db
    .select({ voucher: vouchers, partnerName: partners.name })
    .from(vouchers)
    .leftJoin(partners, eq(partners.id, vouchers.partnerId))
    .where(eq(vouchers.recipientUserId, userId))
    .orderBy(desc(vouchers.createdAt));
}

export async function getVoucherById(db: DB, id: string): Promise<VoucherRow | null> {
  const [row] = await db.select().from(vouchers).where(eq(vouchers.id, id)).limit(1);
  return row ?? null;
}

/** Assign a voucher to a recipient account (by user id). Returns the voucher. */
export async function assignVoucher(db: DB, voucherId: string, recipientUserId: string): Promise<VoucherRow> {
  const [row] = await db
    .update(vouchers)
    .set({ recipientUserId, assignedAt: new Date() })
    .where(eq(vouchers.id, voucherId))
    .returning();
  if (!row) throw NotFound("Voucherul nu există");
  return row;
}

/**
 * Partner redeems a voucher by its code: flips unused -> used, one-way. Only the
 * partner the voucher belongs to can do it, and only within its validity.
 */
export async function redeemVoucherByCode(
  db: DB,
  input: { code: string; partnerId: string; userId: string }
): Promise<VoucherRow> {
  const normalized = input.code.trim().toUpperCase();
  const [row] = await db.select().from(vouchers).where(eq(vouchers.code, normalized)).limit(1);
  if (!row) throw NotFound("Nu există niciun voucher cu acest cod.");
  if (row.partnerId !== input.partnerId) throw Invalid("Acest voucher nu e alocat contului tău.");
  if (row.status === "used") throw Conflict("Voucherul a fost deja folosit.");

  const now = Date.now();
  if (row.validFrom && row.validFrom.getTime() > now) throw Invalid("Voucherul nu e încă valabil.");
  if (row.validUntil.getTime() < now) throw Invalid("Voucherul a expirat.");

  // Guarded update: only flip if still unused (can't be reverted or double-used).
  const [updated] = await db
    .update(vouchers)
    .set({ status: "used", usedAt: new Date(), usedByUserId: input.userId })
    .where(and(eq(vouchers.id, row.id), eq(vouchers.status, "unused")))
    .returning();
  if (!updated) throw Conflict("Voucherul a fost deja folosit.");
  return updated;
}

/** Format a voucher's value for display (percent or lei). */
export function formatVoucherValue(valueType: VoucherValueType, valueAmount: number): string {
  if (valueType === "percent") return `${valueAmount}%`;
  const lei = valueAmount / 100;
  return `${lei.toLocaleString("ro-RO", { minimumFractionDigits: lei % 1 ? 2 : 0 })} lei`;
}
