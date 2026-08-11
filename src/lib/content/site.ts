/**
 * Site-wide content: company identity, navigation, contact.
 *
 * Romanian copy lives in these content modules (not buried in JSX) so a future
 * i18n pass can lift strings out cleanly and an English toggle can be added.
 *
 * NOTE: The company legal details below are PLACEHOLDERS. They are intentionally
 * obvious (all-caps [...] tokens) so nothing false ships. Replace every token
 * with the real registered values before launch, the footer is the legal
 * seller identity and must be accurate.
 */

export const PLACEHOLDER = "[DE COMPLETAT]";

export const company = {
  name: "Second Cycle",
  tagline: "Biciclete second-hand, reparate și garantate.",
  city: "Timișoara",
  legal: {
    // e.g. "Second Cycle S.R.L.", the legal entity that issues the invoice.
    entityName: `Second Cycle ${PLACEHOLDER}`,
    cui: PLACEHOLDER, // Cod unic de înregistrare
    tradeRegister: PLACEHOLDER, // Nr. de ordine în Registrul Comerțului
    address: PLACEHOLDER, // Sediu social
  },
  contact: {
    email: PLACEHOLDER, // e.g. contact@second-cycle.ro
    phone: PLACEHOLDER, // e.g. +40 7XX XXX XXX
  },
} as const;

export const nav = {
  brand: company.name,
  links: [
    { href: "#cum-cumperi", label: "Cum cumperi" },
    { href: "#cum-vinzi", label: "Vinde-ne bicicleta ta" },
    { href: "#verificarea", label: "Verificarea" },
    { href: "#drepturile-tale", label: "Drepturile tale" },
  ],
  primaryCta: { href: "#biciclete", label: "Vezi bicicletele" },
} as const;
