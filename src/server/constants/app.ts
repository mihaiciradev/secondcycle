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
 * Version stamped on orders when the buyer accepts the T&C. The real versioned
 * T&C pages are not published yet; bump this when they are.
 */
export const TERMS_VERSION = "draft-2026-08";

/** Single-use email token TTLs. */
export const TOKEN_TTL = {
  verify_email: 24 * 60 * 60 * 1000,
  newsletter_confirm: 24 * 60 * 60 * 1000,
  newsletter_unsub: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
} as const;
