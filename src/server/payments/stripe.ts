import Stripe from "stripe";

/**
 * Stripe is enabled purely by the presence of a secret key. Test vs live is
 * decided by the key prefix (sk_test_ / sk_live_), so the same code path serves
 * every environment:
 *   - localhost: no key set -> disabled (checkout skipped, order stays pending)
 *   - preprod: sk_test_ -> real flow, test cards, no real money
 *   - prod: sk_live_ -> real money
 */
export function isPaymentEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!cached) cached = new Stripe(key);
  return cached;
}
