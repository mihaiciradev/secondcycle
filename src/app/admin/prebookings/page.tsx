import Link from "next/link";
import { db } from "@/server/db/client";
import { listPrebookings } from "@/server/services/prebookings";
import { getPrebookEnabled } from "@/server/services/settings";
import { PrebookContactedButton } from "@/components/admin/prebook-contacted-button";
import { CopyButton } from "@/components/admin/copy-button";
import { SectionTitle } from "@/components/admin/dashboard-ui";
import { company } from "@/lib/content/site";
import { bikeTitle } from "@/lib/bike-name";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const waNumber = company.contact.phone.replace(/\D/g, "");

export default async function AdminPrebookingsPage() {
  const [rows, prebookOn] = await Promise.all([listPrebookings(db), getPrebookEnabled(db)]);
  const pending = rows.filter((r) => r.status === "pending");
  const pendingEmails = [...new Set(pending.map((r) => r.email))].join("\n");

  return (
    <div className="space-y-6">
      <SectionTitle hint={`${pending.length} de contactat`}>Prebookings</SectionTitle>

      <p className="text-sm text-steel">
        Interes pentru biciclete cât timp cumpărarea online e oprită. Un prebook{" "}
        <strong>nu blochează</strong> bicicleta.{" "}
        {prebookOn ? (
          <span className="text-emerald-600 dark:text-emerald-400">Modul prebook e pornit.</span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400">
            Modul prebook e oprit (activează-l în Setări ca să apară butonul pe site).
          </span>
        )}
      </p>

      {pending.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <CopyButton
            text={pendingEmails}
            label={`Copiază e-mailurile de contactat (${pending.length})`}
            emptyLabel="Niciunul"
          />
          <span className="text-xs text-steel">
            Contactează-i pe rând (butoanele de mai jos) sau în masă când redeschizi vânzarea.
          </span>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-sm text-steel">Niciun prebook încă.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const title = bikeTitle({ brand: r.bikeBrand, model: r.bikeModel, name: r.bikeName, sku: r.bikeSku });
            const mailto = `mailto:${r.email}?subject=${encodeURIComponent(`Prebook ${title}`)}`;
            return (
              <li
                key={r.id}
                className={`rounded-xl border p-4 ${
                  r.status === "pending" ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[0.65rem] font-semibold ${
                          r.status === "pending"
                            ? "bg-amber-500 text-asphalt"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {r.status === "pending" ? "De contactat" : "Contactat"}
                      </span>
                      <Link
                        href={`/admin/bikes/${r.bikeId}`}
                        className="font-medium hover:underline"
                      >
                        {title}
                      </Link>
                      <span className="font-mono text-xs text-steel">{r.bikeSku}</span>
                      <span className="font-mono text-xs text-steel">
                        {new Date(r.createdAt).toLocaleString("ro-RO")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{r.name}</span>{" "}
                      <a href={mailto} className="font-mono text-xs text-steel hover:underline">
                        {r.email}
                      </a>
                      {r.phone ? (
                        <>
                          {" · "}
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-steel hover:underline"
                          >
                            {r.phone}
                          </a>
                        </>
                      ) : null}
                    </p>
                    {r.note ? <p className="mt-1 text-sm text-foreground/80">{r.note}</p> : null}
                  </div>
                  {r.status === "pending" ? <PrebookContactedButton id={r.id} /> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
