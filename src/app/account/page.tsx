import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getListedBikesForOwner } from "@/server/services/bikes";
import { Card, Row } from "@/components/auth/account-ui";
import { company } from "@/lib/content/site";
import { formatLei } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountDetailsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  const listed = await getListedBikesForOwner(db, user.id);
  const waNumber = company.contact.phone.replace(/\D/g, "");

  return (
    <div className="space-y-6">
      <Card title="Detalii cont">
        <dl>
          <Row label="E-mail">{user.email}</Row>
          <Row label="Tip cont">{user.role === "admin" ? "Administrator" : "Client"}</Row>
          <Row label="E-mail confirmat">
            {user.emailVerifiedAt ? (
              <span className="rounded bg-lime px-2 py-0.5 font-mono text-xs text-asphalt">Confirmat</span>
            ) : (
              <span className="rounded bg-asphalt/10 px-2 py-0.5 font-mono text-xs text-steel">Neconfirmat</span>
            )}
          </Row>
        </dl>
        {user.role === "admin" ? (
          <Link
            href="/admin"
            className="mt-5 inline-flex text-sm font-medium text-blue underline-offset-2 hover:underline"
          >
            Deschide panoul de administrare
          </Link>
        ) : null}
      </Card>

      <Card title="Retur (drept de retragere)">
        <p className="text-sm leading-relaxed text-steel">
          Ai 14 zile de la primirea bicicletei ca să te retragi din contract, fără să dai un motiv.
          Deschide formularul de retur, alege bicicleta cumpărată și trimite cererea.
        </p>
        <Link
          href="/retur"
          className="mt-4 inline-flex h-10 items-center rounded-full bg-asphalt px-5 text-sm font-semibold text-paper transition-colors hover:bg-asphalt/90"
        >
          Deschide formularul de retur
        </Link>
      </Card>

      {listed.length > 0 ? (
        <Card title="Bicicletele tale la vânzare">
          <p className="text-sm text-steel">
            Sunt la noi în consignație. Poți cere oricând retragerea uneia din vânzare, pe WhatsApp
            sau pe e-mail.
          </p>
          <ul className="mt-4 space-y-3">
            {listed.map((b) => {
              const text = `Salut! Vreau să retrag din vânzare bicicleta ${b.brand} ${b.model} (${b.sku}).`;
              const wa = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
              const mailto = `mailto:${company.contact.email}?subject=${encodeURIComponent(
                `Retragere bicicletă ${b.sku}`
              )}&body=${encodeURIComponent(text)}`;
              return (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5"
                >
                  <div>
                    <p className="font-medium">
                      {b.brand} {b.model}
                    </p>
                    <p className="font-mono text-xs text-steel">
                      {b.sku} · {formatLei(b.priceCents)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={mailto}
                      className="inline-flex h-9 items-center rounded-full border border-asphalt/25 px-4 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50"
                    >
                      E-mail
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
