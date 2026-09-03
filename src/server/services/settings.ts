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
  /**
   * Prebook mode: bikes are visible but not buyable. The buy CTA becomes a
   * "prebook" lead form and order creation is refused server-side.
   */
  prebookEnabled: "prebook_enabled",
} as const;

/** Shown wherever a purchase is attempted while prebook mode is on. */
export const PREBOOK_MESSAGE =
  "Momentan bicicletele nu se pot cumpăra online. Fă un prebook și te contactăm noi.";

/** Known string-valued setting keys (stored in app_settings.value). */
export const TEXT_SETTING = {
  /** Where new return (retur) requests are announced. */
  returnsNotifyEmail: "returns_notify_email",
} as const;

/** Fallback if the admin has not set a returns notification address yet. */
export const DEFAULT_RETURNS_NOTIFY_EMAIL = "secondcycle_romania@proton.me";

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

/** Read a string setting (app_settings.value), or null if unset/empty. */
export async function getSetting(db: DB, key: string): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  const v = row?.value?.trim();
  return v ? v : null;
}

/** Write a string setting. */
export async function setSetting(db: DB, key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });
}

/** The email that return requests are announced to (falls back to the default). */
export async function getReturnsNotifyEmail(db: DB): Promise<string> {
  return (await getSetting(db, TEXT_SETTING.returnsNotifyEmail)) ?? DEFAULT_RETURNS_NOTIFY_EMAIL;
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

/** Prebook mode: buying is replaced by a lead-capture form. */
export async function getPrebookEnabled(db: DB): Promise<boolean> {
  return getFlag(db, SETTING.prebookEnabled);
}
