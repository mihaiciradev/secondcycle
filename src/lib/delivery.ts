/**
 * Courier delivery fees. Delivery is only within Romania; pickup is free.
 * Client- and server-safe (pure), so the checkout can preview the fee and
 * createOrder can compute the authoritative one with the same rules.
 *
 * Zones:
 *   - Timișoara + close-by localities: 30 lei
 *   - rest of Timiș county:            80 lei
 *   - anywhere else in Romania:       130 lei
 */
export const DELIVERY_FEE = {
  timisoaraZoneCents: 3000,
  timisCountyCents: 8000,
  restRomaniaCents: 13000,
} as const;

/** Localities charged the Timișoara-zone rate (normalized: lowercase, no diacritics). */
export const TIMISOARA_ZONE = [
  "timisoara",
  "dumbravita",
  "remetea",
  "remetea mare",
  "giroc",
  "mosnita noua",
  "sanandrei",
];

function normalize(s: string | null | undefined): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export function isTimisCounty(county: string | null | undefined): boolean {
  return normalize(county) === "timis";
}

export function courierFeeCents(county: string, city: string): number {
  const inTimis = isTimisCounty(county);
  if (inTimis && TIMISOARA_ZONE.includes(normalize(city))) return DELIVERY_FEE.timisoaraZoneCents;
  if (inTimis) return DELIVERY_FEE.timisCountyCents;
  return DELIVERY_FEE.restRomaniaCents;
}

/** The delivery fee for a method + destination, in bani. Pickup is free. */
export function deliveryFeeCents(
  method: "pickup" | "courier",
  county: string,
  city: string
): number {
  return method === "courier" ? courierFeeCents(county, city) : 0;
}
