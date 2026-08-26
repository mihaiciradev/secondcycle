/**
 * Romanian CUI (Cod Unic de Înregistrare) validation.
 *
 * The optional "RO" VAT prefix is accepted and stripped. The last digit is a
 * control digit computed from the preceding digits against the official key
 * 753217532 (right-aligned), sum * 10 mod 11, with 10 mapped to 0.
 */
const CONTROL_KEY = "753217532";

/** Returns the numeric CUI (prefix stripped) or null if the shape is invalid. */
export function normalizeCui(raw: string): string | null {
  let s = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (s.startsWith("RO")) s = s.slice(2);
  return /^\d{2,10}$/.test(s) ? s : null;
}

export function isValidCui(raw: string): boolean {
  const s = normalizeCui(raw);
  if (!s) return false;

  const control = Number(s[s.length - 1]);
  const body = s.slice(0, -1).padStart(9, "0");

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(body[i]) * Number(CONTROL_KEY[i]);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;

  return check === control;
}
