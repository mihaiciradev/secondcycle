import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getBikeForWorkshop } from "@/server/services/workshops";
import { getServiceRecords } from "@/server/services/service-records";
import { SiteHeader } from "@/components/site/site-header";
import { ServicePaper } from "@/components/workshop/service-paper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function WorkshopBikePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "workshop" || !me.workshopId) redirect("/");

  const { id } = await params;
  const bike = await getBikeForWorkshop(db, id, me.workshopId);
  if (!bike) notFound();

  const records = await getServiceRecords(db, id);
  const intake = records.find((r) => r.kind === "intake") ?? null;
  const final = records.find((r) => r.kind === "final") ?? null;

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
            {[bike.sku, bike.frameSize, `${bike.wheelSize}"`].join(" · ")}
          </p>

          <ol className="mt-10 space-y-12">
            <li>
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-asphalt font-mono text-xs text-paper">
                  1
                </span>
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Constatare (înainte de reparație)
                </h2>
              </div>
              <p className="mb-4 ml-10 mt-1 text-sm text-steel">Cum arată bicicleta la primire.</p>
              <div className="ml-10">
                <ServicePaper bikeId={bike.id} kind="intake" record={intake} canFill />
              </div>
            </li>

            <li>
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-7 place-items-center rounded-full font-mono text-xs ${
                    intake ? "bg-asphalt text-paper" : "bg-asphalt/15 text-steel"
                  }`}
                >
                  2
                </span>
                <h2 className="font-heading text-lg font-semibold tracking-tight">După reparație</h2>
              </div>
              <p className="mb-4 ml-10 mt-1 text-sm text-steel">Ce s-a înlocuit și ce s-a reparat.</p>
              <div className="ml-10">
                <ServicePaper bikeId={bike.id} kind="final" record={final} canFill={Boolean(intake)} />
              </div>
            </li>
          </ol>
        </div>
      </main>
    </>
  );
}
