import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getListedBikesForOwner } from "@/server/services/bikes";
import { Card, Row } from "@/components/auth/account-ui";
import { company } from "@/lib/content/site";
import { formatLei } from "@/lib/money";
import { bikeTitle } from "@/lib/bike-name";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountDetailsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  const listed = await getListedBikesForOwner(db, user.id);
  const waNumber = company.contact.phone.replace(/\D/g, "");
  const isStaff = user.role !== "customer";

  return (
    <div className="space-y-6">
      {/* Welcome + primary actions (what a new user should do first) */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Bine ai venit!</h2>
        <p className="mt-1 text-sm text-steel">
          {isStaff
            ? "De aici îți gestionezi contul."
            : "De aici îți urmărești comenzile și îți ții actele la un loc."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/bikes"
            className="inline-flex h-10 items-center rounded-full bg-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-blue/90"
          >
            Vezi bicicletele
          </Link>
          {!isStaff ? (
            <Link
              href="/account/orders"
              className="inline-flex h-10 items-center rounded-full border border-asphalt/25 px-5 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50"
            >
              Comenzile mele
            </Link>
          ) : null}
          {user.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex h-10 items-center rounded-full border border-asphalt/25 px-5 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50"
            >
              Panou admin
            </Link>
          ) : null}
        </div>
      </div>

      {/* Email verification nudge (only when it matters) */}
      {!user.emailVerifiedAt ? (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-foreground">
          Confirmă-ți e-mailul <strong>{user.email}</strong> ca să poți plasa comenzi. Ți-am trimis un
          link de confirmare; caută-l în inbox (și în Spam).
        </div>
      ) : null}

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
      </Card>

      {listed.length > 0 ? (
        <Card title="Bicicletele tale la vânzare">
          <p className="text-sm text-steel">
            Sunt la noi în consignație. Poți cere oricând retragerea uneia din vânzare, pe WhatsApp
            sau pe e-mail.
          </p>
          <ul className="mt-4 space-y-3">
            {listed.map((b) => {
              const text = `Salut! Vreau să retrag din vânzare bicicleta ${bikeTitle(b)} (${b.sku}).`;
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
                    <p className="font-medium">{bikeTitle(b)}</p>
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
