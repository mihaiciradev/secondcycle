import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { getPartner } from "@/server/services/partners";
import { listVouchersForPartner, formatVoucherValue } from "@/server/services/vouchers";
import { PartnerRedeem } from "@/components/partner/partner-redeem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date | string | null): string {
  return d ? new Date(d).toLocaleDateString("ro-RO") : "-";
}

export default async function AccountScanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me) redirect("/login");
  // Only partner accounts scan vouchers.
  if (me.role !== "partner" || !me.partnerId) redirect("/account");

  const [partner, rows] = await Promise.all([
    getPartner(db, me.partnerId),
    listVouchersForPartner(db, me.partnerId),
  ]);

  const now = Date.now();
  const pending = rows.filter((r) => r.voucher.status === "unused");
  const usedList = rows.filter((r) => r.voucher.status === "used");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Scanare vouchere{partner?.name ? ` · ${partner.name}` : ""}
        </h2>
        <p className="mt-1 text-sm text-steel">
          Scanezi voucherele clienților Second Cycle și le marchezi ca folosite. O dată folosit, un
          voucher nu mai poate fi readus la nefolosit.
        </p>
      </div>

      <PartnerRedeem />

      {/* Pending (to scan) */}
      <section>
        <h3 className="font-heading text-lg font-semibold tracking-tight">
          De folosit
          <span className="ml-2 font-mono text-sm font-normal text-steel">({pending.length})</span>
        </h3>
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
      <section>
        <h3 className="font-heading text-lg font-semibold tracking-tight">
          Folosite
          <span className="ml-2 font-mono text-sm font-normal text-steel">({usedList.length})</span>
        </h3>
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
    </div>
  );
}
