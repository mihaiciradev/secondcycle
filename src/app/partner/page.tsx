import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getPartner } from "@/server/services/partners";
import { listVouchersForPartner, formatVoucherValue } from "@/server/services/vouchers";
import { SiteHeader } from "@/components/site/site-header";
import { Container } from "@/components/site/section";
import { PartnerRedeem } from "@/components/partner/partner-redeem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date | string | null): string {
  return d ? new Date(d).toLocaleDateString("ro-RO") : "-";
}

export default async function PartnerHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "partner" || !me.partnerId) redirect("/");

  const [partner, rows] = await Promise.all([
    getPartner(db, me.partnerId),
    listVouchersForPartner(db, me.partnerId),
  ]);

  const now = Date.now();
  const pending = rows.filter((r) => r.voucher.status === "unused");
  const usedList = rows.filter((r) => r.voucher.status === "used");

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1 py-10 sm:py-14">
        <Container className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Partener</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{partner?.name ?? "Partener"}</h1>
          <p className="mt-2 text-sm text-steel">
            Scanezi voucherele clienților Second Cycle și le marchezi ca folosite. O dată folosit, un
            voucher nu mai poate fi readus la nefolosit.
          </p>

          <div className="mt-8">
            <PartnerRedeem />
          </div>

          {/* Pending (to scan) */}
          <section className="mt-12">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              De folosit
              <span className="ml-2 font-mono text-sm font-normal text-steel">({pending.length})</span>
            </h2>
            {pending.length === 0 ? (
              <p className="mt-3 text-sm text-steel">Niciun voucher nefolosit acum.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {pending.map(({ voucher, recipientEmail }) => {
                  const expired = new Date(voucher.validUntil).getTime() < now;
                  return (
                    <li key={voucher.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {voucher.title}{" "}
                            <span className="font-mono text-sm text-blue">
                              {formatVoucherValue(voucher.valueType, voucher.valueAmount)}
                            </span>
                          </p>
                          {voucher.subtitle ? <p className="text-sm text-steel">{voucher.subtitle}</p> : null}
                        </div>
                        <span className="font-mono text-xs text-steel">{voucher.code}</span>
                      </div>
                      {voucher.explanations.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                          {voucher.explanations.map((e, i) => (
                            <li key={i} className="flex gap-2">
                              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-steel" />
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-steel">
                        {recipientEmail ? <span>Client: {recipientEmail}</span> : <span>Nealocat încă</span>}
                        <span className={expired ? "text-destructive" : ""}>
                          Valabil până la {fmtDate(voucher.validUntil)}
                          {expired ? " (expirat)" : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Used */}
          <section className="mt-12">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Folosite
              <span className="ml-2 font-mono text-sm font-normal text-steel">({usedList.length})</span>
            </h2>
            {usedList.length === 0 ? (
              <p className="mt-3 text-sm text-steel">Niciun voucher folosit încă.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {usedList.map(({ voucher, recipientEmail }) => (
                  <li
                    key={voucher.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/50 p-3 text-sm"
                  >
                    <span>
                      <span className="font-medium">{voucher.title}</span>{" "}
                      <span className="font-mono text-xs text-steel">{voucher.code}</span>
                      {recipientEmail ? <span className="text-steel"> · {recipientEmail}</span> : null}
                    </span>
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                      folosit {fmtDate(voucher.usedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Container>
      </main>
    </>
  );
}
