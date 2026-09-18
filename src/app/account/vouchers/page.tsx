import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { listVouchersForRecipient, formatVoucherValue } from "@/server/services/vouchers";
import { VoucherQr } from "@/components/vouchers/voucher-qr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date | string | null): string {
  return d ? new Date(d).toLocaleDateString("ro-RO") : "-";
}

export default async function AccountVouchersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  const rows = await listVouchersForRecipient(db, user.id);
  const now = Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">Vouchere</h2>
        <p className="mt-1 text-sm text-steel">
          Voucherele primite de la Second Cycle. Arată codul (sau QR-ul) la partener ca să îl folosești.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-steel">
          Nu ai niciun voucher momentan.
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ voucher, partnerName }) => {
            const used = voucher.status === "used";
            const expired = !used && new Date(voucher.validUntil).getTime() < now;
            return (
              <li
                key={voucher.id}
                className={`rounded-xl border p-5 ${
                  used ? "border-border bg-card/50 opacity-70" : "border-border bg-card"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-semibold tracking-tight">{voucher.title}</h3>
                      <span className="rounded-full bg-blue/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-blue">
                        {formatVoucherValue(voucher.valueType, voucher.valueAmount)}
                      </span>
                      {used ? (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 font-mono text-[0.65rem] text-white">
                          folosit
                        </span>
                      ) : expired ? (
                        <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 font-mono text-[0.65rem] text-destructive">
                          expirat
                        </span>
                      ) : null}
                    </div>
                    {voucher.subtitle ? <p className="mt-1 text-sm text-steel">{voucher.subtitle}</p> : null}
                    {partnerName ? (
                      <p className="mt-1 text-sm text-foreground/80">Valabil la: {partnerName}</p>
                    ) : null}

                    {voucher.explanations.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                        {voucher.explanations.map((e, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-wider text-steel">Cod</p>
                    <p className="font-mono text-lg font-bold tracking-wide">{voucher.code}</p>
                    <p className="mt-1 text-xs text-steel">
                      {voucher.validFrom ? `${fmtDate(voucher.validFrom)} - ` : "Valabil până la "}
                      {fmtDate(voucher.validUntil)}
                    </p>
                  </div>

                  {!used ? (
                    <div className="shrink-0">
                      <VoucherQr code={voucher.code} />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
