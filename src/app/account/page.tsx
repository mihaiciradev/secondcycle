import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LogoutButton, MarketingToggle } from "@/components/auth/account-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="font-mono text-xs uppercase tracking-[0.1em] text-steel">{label}</dt>
      <dd className="text-sm text-foreground/90">{children}</dd>
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Cont</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Contul tău</h1>
          <p className="mt-2 text-foreground/70">{user.email}</p>

          <div className="mt-8 space-y-4">
            <Card title="Detalii cont">
              <dl>
                <Row label="E-mail">{user.email}</Row>
                <Row label="Tip cont">{user.role === "admin" ? "Administrator" : "Client"}</Row>
                <Row label="E-mail confirmat">
                  {user.emailVerifiedAt ? (
                    <span className="rounded bg-lime px-2 py-0.5 font-mono text-xs text-asphalt">
                      Confirmat
                    </span>
                  ) : (
                    <span className="rounded bg-asphalt/10 px-2 py-0.5 font-mono text-xs text-steel">
                      Neconfirmat
                    </span>
                  )}
                </Row>
              </dl>
              {user.role === "admin" ? (
                <Link
                  href="/admin/bikes"
                  className="mt-5 inline-flex text-sm font-medium text-blue underline-offset-2 hover:underline"
                >
                  Deschide panoul de administrare
                </Link>
              ) : null}
            </Card>

            <Card title="Preferințe">
              <MarketingToggle initialOptIn={user.marketingOptIn} />
            </Card>

            <Card title="Securitate">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue underline-offset-2 hover:underline"
                >
                  Schimbă parola
                </Link>
                <LogoutButton />
              </div>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
