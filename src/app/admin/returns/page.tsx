import { db } from "@/server/db/client";
import { listReturnRequests } from "@/server/services/returns";
import { ReturnHandledButton } from "@/components/admin/return-handled-button";
import { SectionTitle } from "@/components/admin/dashboard-ui";
import { company } from "@/lib/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const waNumber = company.contact.phone.replace(/\D/g, "");

export default async function AdminReturnsPage() {
  const rows = await listReturnRequests(db);
  const pending = rows.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <SectionTitle hint={`${pending.length} de tratat`}>Cereri de retur</SectionTitle>

      <p className="text-sm text-steel">
        Drept de retragere, 14 zile de la primire. Clientul nu e obligat să dea un motiv. Termenul de
        rambursare este de 14 zile de la anunț.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-steel">Nicio cerere de retur.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const wa = `https://wa.me/${waNumber}`;
            const mailto = `mailto:${r.contactEmail}?subject=${encodeURIComponent("Retur bicicletă")}`;
            return (
              <li
                key={r.id}
                className={`rounded-xl border p-5 ${
                  r.status === "pending" ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[0.65rem] font-semibold ${
                          r.status === "pending"
                            ? "bg-amber-500 text-asphalt"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {r.status === "pending" ? "De tratat" : "Tratată"}
                      </span>
                      <span className="font-mono text-xs text-steel">
                        {new Date(r.createdAt).toLocaleString("ro-RO")}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{r.contactName}</p>
                    <p className="font-mono text-xs text-steel">
                      <a href={mailto} className="hover:underline">
                        {r.contactEmail}
                      </a>
                      {r.contactPhone ? (
                        <>
                          {" · "}
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {r.contactPhone}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  {r.status === "pending" ? <ReturnHandledButton id={r.id} /> : null}
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-border/70 pt-4">
                  {r.items.map((it) => (
                    <li key={it.bikeId} className="flex items-center justify-between gap-3 text-sm">
                      <span>
                        {it.brand} {it.model}{" "}
                        <span className="font-mono text-xs text-steel">{it.sku}</span>
                      </span>
                      <span className="font-mono text-xs text-steel">comanda {it.orderNumber}</span>
                    </li>
                  ))}
                </ul>

                {r.reason ? (
                  <p className="mt-3 rounded-lg bg-paper/60 p-3 text-sm text-foreground/80">
                    <span className="font-semibold">Motiv:</span> {r.reason}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-steel">Fără motiv (nu este obligatoriu).</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
