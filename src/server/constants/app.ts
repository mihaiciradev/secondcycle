/**
 * Backend-wide business constants.
 */

/** Legal warranty of conformity. 12 months is the minimum for second-hand goods
 *  under Romanian law (OUG 140/2021); stated explicitly on product/checkout/T&C. */
export const WARRANTY_MONTHS = 12;

/** EU right-of-withdrawal window, from physical handover. */
export const WITHDRAWAL_DAYS = 14;

/** How long a reservation holds a bike. */
export const RESERVATION_TTL_MINUTES = 30;

/**
 * Free-tier ceilings of the external services, for the admin usage panel.
 * Approximate published limits — update if a plan changes.
 */
export const FREE_TIER = {
  /** Resend free plan. */
  resendEmailsPerMonth: 3000,
  resendEmailsPerDay: 100,
  /** Neon free plan storage per project (0.5 GB). */
  neonStorageBytes: 0.5 * 1024 * 1024 * 1024,
  /** Cloudflare R2 free plan storage (10 GB). */
  r2StorageBytes: 10 * 1024 * 1024 * 1024,
} as const;

/**
 * Version stamped on orders when the buyer accepts the T&C. The real versioned
 * T&C pages are not published yet; bump this when they are.
 */
export const TERMS_VERSION = "draft-2026-08";

/** Standard categories a workshop assesses on the intake and final papers. */
export const SERVICE_CHECK_ITEMS = [
  "Cadru și furcă",
  "Transmisie",
  "Frânare",
  "Roți și anvelope",
  "Direcție și comenzi",
  "Altele",
] as const;

export const SERVICE_CHECK_STATUSES = ["ok", "replaced", "repaired", "attention"] as const;
export const SERVICE_CHECK_STATUS_LABEL: Record<string, string> = {
  ok: "În regulă",
  replaced: "Înlocuit",
  repaired: "Reparat",
  attention: "De atenție",
};

/** Single-use email token TTLs. */
export const TOKEN_TTL = {
  verify_email: 24 * 60 * 60 * 1000,
  newsletter_confirm: 24 * 60 * 60 * 1000,
  newsletter_unsub: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
} as const;
