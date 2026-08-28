import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getWorkshop, getWorkshopStats, listBikesForWorkshop } from "@/server/services/workshops";
import { SiteHeader } from "@/components/site/site-header";
import { MiniBars, SectionTitle, StatCard, lastSixMonths } from "@/components/admin/dashboard-ui";
import { formatLei } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  draft: "Ciornă",
  available: "Disponibilă",
  reserved: "Rezervată",
  sold: "Vândută",
  withdrawn: "Retrasă",
};

export default async function WorkshopHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "workshop" || !me.workshopId) redirect("/");

  const [workshop, list, stats] = await Promise.all([
    getWorkshop(db, me.workshopId),
    listBikesForWorkshop(db, me.workshopId),
    getWorkshopStats(db, me.workshopId),
  ]);

  const byStatus = list.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
  const inPrep = (byStatus.draft ?? 0);
  const months = lastSixMonths(stats.monthly);

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Atelier</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{workshop?.name ?? "Atelier"}</h1>
              <p className="mt-2 text-sm text-steel">
                {[workshop?.location, workshop?.workHours].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Link
              href="/account/security"
              className="text-sm text-blue underline-offset-2 hover:underline"
            >
              Schimbă parola
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Reparate & vândute"
              value={stats.soldCount}
              sub={formatLei(stats.soldCents)}
              tone="accent"
            />
            <StatCard
              label="Vândute luna aceasta"
              value={stats.soldThisMonthCount}
              sub={formatLei(stats.soldThisMonthCents)}
            />
            <StatCard label="În pregătire" value={inPrep} sub="ciorne de finalizat" tone={inPrep > 0 ? "warn" : "default"} />
            <StatCard
              label="Fișe depuse"
              value={stats.papers.intake + stats.papers.final}
              sub={`${stats.papers.intake} intrare · ${stats.papers.final} final`}
            />
          </div>

          {months.some((m) => m.cents > 0) ? (
            <section className="mt-10">
              <SectionTitle hint="ultimele 6 luni">Vânzări din bicicletele tale</SectionTitle>
              <MiniBars
                data={months.map((m) => ({
                  label: m.label,
                  value: m.cents,
                  caption: m.cents > 0 ? formatLei(m.cents) : "—",
                }))}
              />
            </section>
          ) : null}

          <h2 className="mt-12 font-heading text-lg font-semibold tracking-tight">
            Biciclete alocate ({list.length})
          </h2>
          {list.length === 0 ? (
            <p className="mt-4 text-sm text-steel">
              Nicio bicicletă alocată încă. Adminul îți alocă bicicletele de reparat.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {list.map((bike) => (
                <li key={bike.id}>
                  <Link
                    href={`/workshop/bikes/${bike.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-asphalt/40"
                  >
                    <div>
                      <p className="font-mono text-xs text-steel">{bike.sku}</p>
                      <p className="mt-1 font-medium">
                        {bike.brand} {bike.model}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-steel">{statusLabel[bike.status] ?? bike.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
