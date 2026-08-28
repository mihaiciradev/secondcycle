import { db } from "@/server/db/client";
import { listWorkshops } from "@/server/services/workshops";
import { WorkshopCreateForm } from "@/components/admin/workshop-create-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminWorkshopsPage() {
  const rows = await listWorkshops(db);

  return (
    <div>
      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Adaugă un atelier</h2>
        <div className="mt-4">
          <WorkshopCreateForm />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Ateliere ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-steel">Niciun atelier încă.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                  <th className="py-2 pr-4">Atelier</th>
                  <th className="py-2 pr-4">Locație</th>
                  <th className="py-2 pr-4">Program</th>
                  <th className="py-2 pr-4">Cont</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ workshop, accountEmail }) => (
                  <tr key={workshop.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{workshop.name}</td>
                    <td className="py-3 pr-4 text-foreground/80">{workshop.location ?? "-"}</td>
                    <td className="py-3 pr-4 text-foreground/80">{workshop.workHours ?? "-"}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{accountEmail ?? "-"}</td>
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
