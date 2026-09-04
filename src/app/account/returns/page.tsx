import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getReturnsForUser } from "@/server/services/returns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Trimisă", cls: "bg-amber-500 text-asphalt" },
  handled: { label: "Rezolvată", cls: "bg-emerald-600 text-white" },
};

export default async function MyReturnsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const rows = await getReturnsForUser(db, session.user.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Retururile mele</h2>
        <Link
          href="/retur"
          className="inline-flex h-9 items-center rounded-full border border-asphalt/25 px-4 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50"
        >
          Cerere de retur nouă
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center text-steel">
          Nu ai nicio cerere de retur încă. Ai 14 zile de la primire ca să te retragi din contract.{" "}
          <Link href="/retur" className="text-blue underline-offset-2 hover:underline">
            Deschide formularul de retur
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((r) => {
            const st = STATUS[r.status] ?? { label: r.status, cls: "bg-asphalt/15 text-foreground" };
            return (
              <li key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-steel">
                    {new Date(r.createdAt).toLocaleDateString("ro-RO")}
                  </span>
                  <span className={`rounded px-2 py-0.5 font-mono text-[0.65rem] font-semibold ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 border-t border-border/70 pt-3">
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
                  <p className="mt-3 text-sm text-foreground/80">
                    <span className="font-medium">Motiv:</span> {r.reason}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
