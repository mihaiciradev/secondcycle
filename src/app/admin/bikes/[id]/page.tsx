import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { getBikeById } from "@/server/services/bikes";
import { getServiceRecords } from "@/server/services/service-records";
import { users } from "@/server/db/schema";
import { isStorageEnabled, publicUrl } from "@/server/storage/r2";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { BikeSaleForm } from "@/components/admin/bike-sale-form";
import { BikeOwnerForm } from "@/components/admin/bike-owner-form";
import { SectionTitle } from "@/components/admin/dashboard-ui";
import { SERVICE_CHECK_STATUS_LABEL } from "@/server/constants/app";
import { formatLei } from "@/lib/money";
import type { ChecklistItem } from "@/server/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  draft: "Ciornă",
  available: "Publicată",
  reserved: "Rezervată",
  sold: "Vândută",
  withdrawn: "Retrasă",
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
  const [bike, records] = await Promise.all([getBikeById(db, id), getServiceRecords(db, id)]);
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

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/bikes"
          className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground"
        >
          ← Stoc
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            {bike.brand} {bike.model}
          </h2>
          <div className="flex items-center gap-3 text-sm text-steel">
            <span className="font-mono">{bike.sku}</span>
            <span>·</span>
            <span>{statusLabel[bike.status] ?? bike.status}</span>
            <span>·</span>
            <span className="font-mono">{formatLei(bike.priceCents)}</span>
          </div>
        </div>
        <Link
          href={`/bikes/${bike.sku}`}
          className="mt-2 inline-flex text-sm text-blue underline-offset-2 hover:underline"
        >
          Vezi pagina publică
        </Link>
      </div>

      <section>
        <SectionTitle hint="atelier">Fișe de service</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
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

      <section>
        <SectionTitle hint="consignatar">Proprietar</SectionTitle>
        <BikeOwnerForm bikeId={bike.id} currentEmail={ownerEmail} />
      </section>

      <section>
        <SectionTitle hint="preț final + descriere">Publicare</SectionTitle>
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
  );
}
