/**
 * Site-wide company identity.
 *
 * Second Cycle is a brand / subproject of WEBBINGHUB S.R.L. - that company is
 * the legal trader and seller, so its identifiers are what the law requires to
 * be shown (Legea 365/2002, Legea 31/1990, OUG 34/2014).
 *
 * The registered address is published on a dedicated legal page (permanently
 * linked from the footer), not in the footer itself.
 */
export const company = {
  name: "Second Cycle",
  tagline: "Biciclete second-hand, reparate și garantate.",
  city: "Timișoara",
  legal: {
    entityName: "WEBBINGHUB S.R.L.",
    cui: "RO49317150",
    tradeRegister: "J2023004928352",
    address: "Str. Gheorghe Lazăr, nr. 34, Timișoara",
  },
  contact: {
    email: "support@webbinghub.io",
    phone: "+40 736 394 784",
  },
  legalPageHref: "/legal-data",
} as const;
