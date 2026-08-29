import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { appSettings } from "@/server/db/schema";
import { isPaymentEnabled } from "@/server/payments/stripe";

/** Known boolean feature-flag keys. Absent row = off. */
export const SETTING = {
  paymentsEnabled: "payments_enabled",
} as const;

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
 * Whether customers can actually pay right now. Requires BOTH the admin flag to
 * be on AND Stripe to be configured in this environment. Either missing = the
 * buy flow is hidden behind the "technical problems" notice.
 */
export async function getPaymentsLive(db: DB): Promise<boolean> {
  if (!isPaymentEnabled()) return false;
  return getFlag(db, SETTING.paymentsEnabled);
}
