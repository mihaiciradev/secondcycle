import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { getBikeById } from "@/server/services/bikes";
import { getServiceRecords } from "@/server/services/service-records";
import { listActiveWorkshops } from "@/server/services/workshops";
import { users } from "@/server/db/schema";
import { isStorageEnabled, publicUrl } from "@/server/storage/r2";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { BikeDetailsForm } from "@/components/admin/bike-details-form";
import { BikeSaleForm } from "@/components/admin/bike-sale-form";
import { BikeOwnerForm } from "@/components/admin/bike-owner-form";
import { BikeRowActions } from "@/components/admin/bike-row-actions";
import { WorkshopAssign } from "@/components/admin/workshop-assign";
import { SectionTitle } from "@/components/admin/dashboard-ui";
import { SERVICE_CHECK_STATUS_LABEL } from "@/server/constants/app";
import { formatLei } from "@/lib/money";
import { bikeTitle } from "@/lib/bike-name";
import type { BikeStatus } from "@/server/constants/statuses";
import type { ChecklistItem } from "@/server/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Ciornă", cls: "bg-asphalt/15 text-foreground" },
  available: { label: "Publicată", cls: "bg-emerald-600 text-white" },
  reserved: { label: "Rezervată", cls: "bg-amber-500 text-asphalt" },
  sold: { label: "Vândută", cls: "bg-blue text-white" },
  withdrawn: { label: "Retrasă", cls: "bg-asphalt/15 text-foreground" },
};

const CATEGORY_LABEL: Record<string, string> = {
  city: "Oraș",
  trekking: "Trekking",
  mtb: "MTB",
  road: "Cursieră",
  kids: "Copii",
  ebike: "Electrică",
};

function money(c: number | null | undefined) {
  return c != null ? formatLei(c) : "-";
}

function PaperCard({
  title,
  record,
  valuations,
}: {
  title: string;
  record: {
    performedBy: string;
    performedAt: string | Date;
    summary: string | null;
    checklist: ChecklistItem[];
  } | null;
  valuations: { label: string; value: number | null }[];
}) {
  if (!record) {
    return (
      <div className="rounded-lg border border-dashed border-border p-5 text-sm text-steel">
        {title}: nedepusă încă de atelier.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <span className="font-mono text-xs text-steel">
          {record.performedBy} · {new Date(record.performedAt).toLocaleDateString("ro-RO")}
        </span>
      </div>
      {valuations.some((v) => v.value != null) ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {valuations.map((v) => (
            <div key={v.label} className="rounded bg-manila/40 px-3 py-2">
              <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-steel">{v.label}</dt>
              <dd className="mt-0.5 font-mono text-sm">{money(v.value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {record.checklist.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {record.checklist.map((c) => (
            <li key={c.item} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5">
              <span className="text-foreground/80">{c.item}</span>
              <span className="shrink-0 font-mono text-xs text-steel">
                {SERVICE_CHECK_STATUS_LABEL[c.status] ?? c.status}
                {c.note ? `: ${c.note}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {record.summary ? <p className="mt-3 text-sm text-foreground/75">{record.summary}</p> : null}
    </div>
  );
}

export default async function AdminBikeManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bike, records, workshops] = await Promise.all([
    getBikeById(db, id),
    getServiceRecords(db, id),
    listActiveWorkshops(db),
  ]);
  if (!bike) notFound();

  const intake = records.find((r) => r.kind === "intake") ?? null;
  const final = records.find((r) => r.kind === "final") ?? null;

  let ownerEmail: string | null = null;
  if (bike.ownerUserId) {
    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, bike.ownerUserId))
      .limit(1);
    ownerEmail = owner?.email ?? null;
  }

  const storage = isStorageEnabled();
  const initial = storage ? bike.photos.map((key) => ({ key, url: publicUrl(key) })) : [];
  const st = STATUS[bike.status] ?? { label: bike.status, cls: "bg-asphalt/10 text-steel" };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/bikes"
          className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground"
        >
          ← Stoc
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">{bikeTitle(bike)}</h2>
          <span className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${st.cls}`}>
            {st.label}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-steel">
          <span className="font-mono">{bike.sku}</span>
          <span>·</span>
          <span>{CATEGORY_LABEL[bike.category] ?? bike.category}</span>
          <span>·</span>
          <span>Grad {bike.conditionGrade}</span>
          <span>·</span>
          <span className="font-mono text-foreground/80">{formatLei(bike.priceCents)}</span>
          <span>·</span>
          <Link href={`/bikes/${bike.sku}`} className="text-blue underline-offset-2 hover:underline">
            Vezi pagina publică
          </Link>
        </div>
      </div>

      {/* Status + workshop bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-steel">Acțiuni</span>
          <BikeRowActions id={bike.id} status={bike.status as BikeStatus} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-steel">Atelier</span>
          <WorkshopAssign bikeId={bike.id} current={bike.workshopId} workshops={workshops} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: everything editable */}
        <div className="space-y-8">
          <section>
            <SectionTitle hint="marcă, model, specificații">Detalii bicicletă</SectionTitle>
            <div className="rounded-lg border border-border bg-card p-5">
              <BikeDetailsForm
                bike={{
                  id: bike.id,
                  sku: bike.sku,
                  frameNumber: bike.frameNumber,
                  brand: bike.brand,
                  model: bike.model,
                  name: bike.name,
                  modelYear: bike.modelYear,
                  category: bike.category,
                  frameSize: bike.frameSize,
                  wheelSize: bike.wheelSize,
                  conditionGrade: bike.conditionGrade,
                  oldPriceCents: bike.oldPriceCents,
                  adminNotes: bike.adminNotes,
                }}
              />
            </div>
          </section>

          <section>
            <SectionTitle hint="preț, descriere, publicare">Vânzare</SectionTitle>
            <BikeSaleForm
              bike={{
                id: bike.id,
                status: bike.status,
                priceCents: bike.priceCents,
                provisionalPriceCents: bike.provisionalPriceCents,
                acquisitionCostCents: bike.acquisitionCostCents,
                description: bike.description,
                workDone: bike.workDone,
              }}
              hasIntake={Boolean(intake)}
            />
          </section>

          <section>
            <SectionTitle hint="prima poză e coperta">Poze</SectionTitle>
            <PhotoUploader bikeId={bike.id} initial={initial} storageEnabled={storage} />
          </section>
        </div>

        {/* Right: consignor + workshop papers (reference) */}
        <div className="space-y-8">
          <section>
            <SectionTitle hint="consignatar">Proprietar</SectionTitle>
            <BikeOwnerForm bikeId={bike.id} currentEmail={ownerEmail} />
          </section>

          <section>
            <SectionTitle hint="atelier">Fișe de service</SectionTitle>
            <div className="space-y-4">
              <PaperCard
                title="Constatare (la intrare)"
                record={intake}
                valuations={[
                  { label: "Preț piață", value: intake?.marketValueCents ?? null },
                  { label: "Achiziție sugerată", value: intake?.suggestedPurchaseCents ?? null },
                  { label: "Reparații estimate", value: intake?.estimatedRepairCents ?? null },
                ]}
              />
              <PaperCard
                title="Fișă finală (după reparație)"
                record={final}
                valuations={[{ label: "Reparații reale", value: final?.actualRepairCents ?? null }]}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
