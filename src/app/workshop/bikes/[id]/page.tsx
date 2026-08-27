import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getBikeForWorkshop } from "@/server/services/workshops";
import { getServiceRecords } from "@/server/services/service-records";
import { SiteHeader } from "@/components/site/site-header";
import { ServiceRecordForm } from "@/components/workshop/service-record-form";
import { SERVICE_CHECK_STATUS_LABEL } from "@/server/constants/app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceRecordRow = Awaited<ReturnType<typeof getServiceRecords>>[number];

function RecordView({ record }: { record: ServiceRecordRow }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-3 font-mono text-xs text-steel">
        <span>Mecanic: {record.performedBy}</span>
        <span>{new Date(record.performedAt).toLocaleDateString("ro-RO")}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {record.checklist.map((c) => (
          <li key={c.item} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-foreground/80">{c.item}</span>
            <span className="text-right">
              <span className="font-medium">{SERVICE_CHECK_STATUS_LABEL[c.status] ?? c.status}</span>
              {c.note ? <span className="text-steel"> · {c.note}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {record.summary ? (
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/80">
          {record.summary}
        </p>
      ) : null}
    </div>
  );
}

export default async function WorkshopBikePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "workshop" || !me.workshopId) redirect("/");

  const { id } = await params;
  const bike = await getBikeForWorkshop(db, id, me.workshopId);
  if (!bike) notFound();

  const records = await getServiceRecords(db, id);
  const intake = records.find((r) => r.kind === "intake");
  const final = records.find((r) => r.kind === "final");

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          <Link href="/workshop" className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground">
            ← Bicicletele mele
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {bike.brand} {bike.model}
          </h1>
          <p className="mt-1 font-mono text-xs text-steel">
            {[bike.sku, bike.frameSize, `${bike.wheelSize}"`, bike.conditionGrade].join(" · ")}
          </p>

          <section className="mt-10">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Constatare (înainte de reparație)
            </h2>
            <p className="mb-4 mt-1 text-sm text-steel">Cum arată bicicleta la primire.</p>
            {intake ? <RecordView record={intake} /> : <ServiceRecordForm bikeId={bike.id} kind="intake" />}
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-lg font-semibold tracking-tight">După reparație</h2>
            <p className="mb-4 mt-1 text-sm text-steel">Ce s-a înlocuit și ce s-a reparat.</p>
            {final ? <RecordView record={final} /> : <ServiceRecordForm bikeId={bike.id} kind="final" />}
          </section>
        </div>
      </main>
    </>
  );
}
