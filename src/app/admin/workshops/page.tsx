import { db } from "@/server/db/client";
import { listWorkshops } from "@/server/services/workshops";
import { WorkshopCreateDialog } from "@/components/admin/workshop-create-dialog";
import { DemoteWorkshopButton } from "@/components/admin/demote-workshop-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminWorkshopsPage() {
  const rows = await listWorkshops(db);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Ateliere
          <span className="ml-2 font-mono text-sm font-normal text-steel">({rows.length})</span>
        </h2>
        <WorkshopCreateDialog />
      </div>

      <section className="mt-6">
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-steel">Niciun atelier încă.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                  <th className="py-2 pr-4">Atelier</th>
                  <th className="py-2 pr-4">Locație</th>
                  <th className="py-2 pr-4">Program</th>
                  <th className="py-2 pr-4">Cont</th>
                  <th className="py-2 pr-4">Stare</th>
                  <th className="py-2">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ workshop, accountEmail }) => (
                  <tr key={workshop.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{workshop.name}</td>
                    <td className="py-3 pr-4 text-foreground/80">{workshop.location ?? "-"}</td>
                    <td className="py-3 pr-4 text-foreground/80">{workshop.workHours ?? "-"}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{accountEmail ?? "-"}</td>
                    <td className="py-3 pr-4">
                      {workshop.active ? (
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">activ</span>
                      ) : (
                        <span className="font-mono text-xs text-steel">inactiv</span>
                      )}
                    </td>
                    <td className="py-3">
                      {workshop.active ? (
                        <DemoteWorkshopButton
                          workshopId={workshop.id}
                          workshopName={workshop.name}
                          accountEmail={accountEmail}
                        />
                      ) : (
                        <span className="font-mono text-xs text-steel">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
