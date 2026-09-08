/**
 * Fișa tehnică a unei biciclete second-hand: stare individuală, structurată.
 * Stocată pe bike (bikes.techSheet) și snapshot-ată imutabil pe order_items la
 * momentul comenzii, ca sursă unică de adevăr pentru litigii / ANPC.
 */
export type TechSheet = {
  stareGenerala?: string;
  anvelope?: string;
  placuteFrana?: string;
  lantTransmisie?: string;
  cadru?: string;
  roti?: string;
  frane?: string;
  schimbator?: string;
  electrice?: string;
  pieseInlocuite?: string;
  problemeCunoscute?: string;
  accesorii?: string;
};

/** Ordered field definitions (key + Romanian label), for editor + display. */
export const TECH_SHEET_FIELDS: { key: keyof TechSheet; label: string }[] = [
  { key: "stareGenerala", label: "Stare generală" },
  { key: "anvelope", label: "Anvelope" },
  { key: "placuteFrana", label: "Plăcuțe / saboți frână" },
  { key: "lantTransmisie", label: "Lanț / transmisie" },
  { key: "cadru", label: "Cadru (cosmetică)" },
  { key: "roti", label: "Roți / butuci / spițe" },
  { key: "frane", label: "Frâne" },
  { key: "schimbator", label: "Schimbător" },
  { key: "electrice", label: "Componente electrice (e-bike)" },
  { key: "pieseInlocuite", label: "Piese înlocuite de Second Cycle" },
  { key: "problemeCunoscute", label: "Probleme cunoscute / nereparate" },
  { key: "accesorii", label: "Accesorii incluse" },
];

/** Non-empty fields, in order (for rendering). */
export function techSheetEntries(t?: TechSheet | null): { key: string; label: string; value: string }[] {
  if (!t) return [];
  return TECH_SHEET_FIELDS.map((f) => ({ key: f.key, label: f.label, value: (t[f.key] ?? "").trim() })).filter(
    (e) => e.value.length > 0
  );
}

export function techSheetHasContent(t?: TechSheet | null): boolean {
  return techSheetEntries(t).length > 0;
}

/** Reduced legal warranty for second-hand goods (24 -> 12 months). */
export const SH_WARRANTY_MONTHS = 12;

/**
 * Textul Bifei 2 (per bicicletă) afișat la checkout, în e-mail și în Certificatul
 * de Garanție - trebuie identic în toate trei. Salvat imutabil pe comandă la
 * acceptare; orice comandă deja plasată păstrează varianta ei (versionare, art.
 * 4 din spec), deci modificarea acestui text NU afectează retroactiv comenzile.
 * Formulare conform art. 9 din OUG nr. 140/2021.
 */
export function bikeConsentText(input: {
  title: string;
  sku: string;
  warrantyMonths: number;
}): string {
  return (
    `Am citit fișa tehnică a acestei biciclete (${input.title}, cod ${input.sku}) și accept ` +
    `starea sa tehnică individuală, inclusiv abaterile de la un produs nou menționate acolo. ` +
    `Sunt de acord, în mod expres și separat, ca perioada de garanție legală de conformitate ` +
    `pentru această bicicletă să fie de ${input.warrantyMonths} luni de la livrare, în loc de ` +
    `24 de luni, conform art. 9 din OUG nr. 140/2021.`
  );
}
