/**
 * Display title for a bike. Brand + model when known; otherwise a free-text
 * "name" (for old bikes whose make/model we don't know); finally the SKU.
 */
export function bikeTitle(b: {
  brand?: string | null;
  model?: string | null;
  name?: string | null;
  sku?: string | null;
}): string {
  const brandModel = [b.brand, b.model]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
  return brandModel || (b.name ?? "").trim() || (b.sku ?? "").trim() || "Bicicletă";
}
