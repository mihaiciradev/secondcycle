import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { appSettings } from "@/server/db/schema";
import { isPaymentEnabled } from "@/server/payments/stripe";
import { isRevolutConfigured } from "@/server/payments/revolut";

/** Known boolean feature-flag keys. Absent row = off. */
export const SETTING = {
  paymentsEnabled: "payments_enabled",
  /** When on (and Revolut is configured), Revolut Pay is used instead of Stripe. */
  revolutEnabled: "revolut_enabled",
} as const;

export type PaymentProvider = "stripe" | "revolut";

/** Shown to customers wherever the buy flow is gated off. */
export const PAYMENTS_OFF_MESSAGE =
  "Plățile online sunt momentan indisponibile din motive tehnice. Revino în curând.";

export async function getFlag(db: DB, key: string): Promise<boolean> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  return row?.enabled ?? false;
}

export async function setFlag(db: DB, key: string, enabled: boolean): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, enabled })
    .onConflictDoUpdate({ target: appSettings.key, set: { enabled, updatedAt: new Date() } });
}

/**
 * The payment provider customers should use right now, or null if the buy flow
 * is off. Requires the master `payments_enabled` flag AND the chosen provider to
 * be configured in this environment:
 *   - flag off                          -> null (blocked)
 *   - revolut_enabled + Revolut keys     -> "revolut"
 *   - otherwise Stripe keys present      -> "stripe"
 *   - only Revolut configured            -> "revolut"
 */
export async function getPaymentProvider(db: DB): Promise<PaymentProvider | null> {
  if (!(await getFlag(db, SETTING.paymentsEnabled))) return null;
  const preferRevolut = await getFlag(db, SETTING.revolutEnabled);
  if (preferRevolut && isRevolutConfigured()) return "revolut";
  if (isPaymentEnabled()) return "stripe";
  if (isRevolutConfigured()) return "revolut";
  return null;
}

/** Whether customers can actually pay right now (some provider is live). */
export async function getPaymentsLive(db: DB): Promise<boolean> {
  return (await getPaymentProvider(db)) !== null;
}
