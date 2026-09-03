import { eq, inArray } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, orders, users } from "@/server/db/schema";
import { countyCode } from "@/server/constants/counties";

/**
 * SoftPro invoicing (facturi-clienti / post-facturi). Fires after an order is
 * paid: one `comanda` document (SoftPro auto-numbers from our configured series
 * and uses the server date), in the second-hand margin VAT regime.
 *
 * VALUES TO CONFIRM with SoftPro / the accountant (kept as named constants):
 *   - OP_TYPE_MARGIN: the tip_operatiune id for regimul de marjă (second-hand).
 *   - the auth scheme (how SP_AUTH_KEY is sent) and whether `sursa` = SP_CLIENT_CODE.
 *   - accounts (cont_par, cont_incasare) and the delivery line's VAT treatment.
 */

const OP_TYPE_MARGIN = 8; // tip_operatiune pentru second-hand (de confirmat)
const K_TVA = 21;
const MARGIN_MENTION = "Regim special TVA la marjă - bunuri second-hand";
const CONT_PAR = "4111.01"; // clienți interni (4111.02 = externi)
const CONT_INCASARE_CARD = "5125.PAY";
const SERVICE_CODE = "~~~SERV~~~"; // linie fără scădere de stoc

export function isSoftproConfigured(): boolean {
  return Boolean(process.env.SP_API_URL && process.env.SP_AUTH_KEY && process.env.SP_CLIENT_CODE);
}

const lei = (cents: number): number => Math.round(cents) / 100;

type FacturiResponse = { status: number; ok: boolean; body: unknown; raw: string };

async function postFacturi(payload: unknown): Promise<FacturiResponse> {
  const url = process.env.SP_API_URL as string;
  // Log the outgoing document (no secrets: auth lives in headers, not logged).
  console.log("[softpro] POST", url, "payload:", JSON.stringify(payload));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // AUTH: best guess. Confirm the exact scheme in SoftPro's swagger "Authorize".
      Authorization: `Bearer ${process.env.SP_AUTH_KEY}`,
      "X-Client-Code": process.env.SP_CLIENT_CODE as string,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  // The raw response is what we need to confirm the real shape on staging.
  console.log(`[softpro] response ${res.status} ${res.ok ? "OK" : "ERR"}:`, text.slice(0, 2000));
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return { status: res.status, ok: res.ok, body, raw: text };
}

/** Interpret the response into a stored status + human-readable info. */
function parseResult(res: FacturiResponse): { ok: boolean; info: string } {
  if (res.status === 409) return { ok: false, info: "409: alt import în curs, reîncearcă" };
  if (!res.ok) return { ok: false, info: `HTTP ${res.status}: ${res.raw.slice(0, 400)}` };
  const body = res.body as { documente?: Array<Record<string, unknown>> };
  const doc = body?.documente?.[0];
  if (!doc) return { ok: false, info: `Răspuns neașteptat: ${res.raw.slice(0, 400)}` };
  if (doc.hasError) return { ok: false, info: String(doc.message ?? "Eroare document") };
  const ref = doc.numar_doc ?? doc.seria_doc ?? doc.message ?? "emisă";
  return { ok: true, info: String(ref) };
}

type OrderRow = typeof orders.$inferSelect;
type ItemRow = typeof orderItems.$inferSelect;

function buildDocument(
  order: OrderRow,
  items: ItemRow[],
  buyerPartnerNo: number,
  costByBike: Map<string, number | null>
) {
  const adresa = {
    tara: "RO",
    judet: countyCode(order.billingCounty),
    localitate: order.billingCity,
    strada: order.billingStreet,
  };
  const cumparator =
    order.billingType === "company"
      ? {
          entitate: "PJ" as const,
          cif: order.companyCui ?? undefined,
          denumire: order.companyName ?? order.billingName,
          adresa,
        }
      : {
          entitate: "PF" as const,
          uniquePartnerId: buyerPartnerNo,
          nume: order.billingName,
          adresa,
        };

  const liniiFactura: Record<string, unknown>[] = items.map((it) => {
    const cost = costByBike.get(it.bikeId);
    return {
      codpr: SERVICE_CODE,
      cantitate: 1,
      pret: lei(it.priceCents),
      ...(cost != null ? { pret_cost: lei(cost) } : {}),
      k_tva: K_TVA,
      denumire: `${it.brand} ${it.model} (${it.sku})`,
    };
  });
  if (order.deliveryFeeCents > 0) {
    liniiFactura.push({
      codpr: SERVICE_CODE,
      cantitate: 1,
      pret: lei(order.deliveryFeeCents),
      k_tva: K_TVA,
      denumire: "Livrare curier",
    });
  }

  const data = (order.paidAt ?? order.createdAt).toISOString().slice(0, 10);

  return {
    uniqueIdSursa: order.id,
    tip_document: "comanda",
    data,
    valuta: "RON",
    tip_operatiune: OP_TYPE_MARGIN,
    cont_par: CONT_PAR,
    mentiuni: MARGIN_MENTION,
    pret_cu_tva: true,
    cumparator,
    liniiFactura,
    incasari: [{ tip_incasare: "card", suma: lei(order.totalCents), cont_incasare: CONT_INCASARE_CARD }],
  };
}

/**
 * Issue the SoftPro invoice for a paid order. Idempotent (SoftPro dedupes on
 * uniqueIdSursa, and we skip once status is 'ok'). Best-effort: stores the
 * outcome on the order and never throws, so it can't undo a payment.
 */
export async function issueInvoiceForOrder(db: DB, orderId: string): Promise<void> {
  if (!isSoftproConfigured()) return;
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || !order.paidAt || order.spInvoiceStatus === "ok") return;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const [buyer] = await db
      .select({ partnerNo: users.partnerNo })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);

    const bikeIds = items.map((i) => i.bikeId);
    const costRows = bikeIds.length
      ? await db
          .select({ id: bikes.id, acq: bikes.acquisitionCostCents })
          .from(bikes)
          .where(inArray(bikes.id, bikeIds))
      : [];
    const costByBike = new Map(costRows.map((r) => [r.id, r.acq]));

    const doc = buildDocument(order, items, buyer?.partnerNo ?? 0, costByBike);
    const res = await postFacturi({ sursa: process.env.SP_CLIENT_CODE, documente: [doc] });
    const parsed = parseResult(res);

    await db
      .update(orders)
      .set({
        spInvoiceStatus: parsed.ok ? "ok" : "error",
        spInvoiceInfo: parsed.info.slice(0, 500),
        spInvoicedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  } catch (e) {
    await db
      .update(orders)
      .set({
        spInvoiceStatus: "error",
        spInvoiceInfo: (e instanceof Error ? e.message : String(e)).slice(0, 500),
        spInvoicedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .catch(() => {});
  }
}
