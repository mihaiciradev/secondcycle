import { db } from "@/server/db/client";
import { listPartners, listActivePartners } from "@/server/services/partners";
import { listAllVouchers, formatVoucherValue } from "@/server/services/vouchers";
import { PartnerCreateDialog } from "@/components/admin/partner-create-dialog";
import { VoucherCreateDialog } from "@/components/admin/voucher-create-dialog";
import { VoucherAssign } from "@/components/admin/voucher-assign";
import { VoucherDelete } from "@/components/admin/voucher-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date | string | null): string {
  return d ? new Date(d).toLocaleDateString("ro-RO") : "-";
}

export default async function AdminCollabsPage() {
  const [partners, activePartners, vouchers] = await Promise.all([
    listPartners(db),
    listActivePartners(db),
    listAllVouchers(db),
  ]);

  const used = vouchers.filter((v) => v.voucher.status === "used").length;

  return (
    <div className="space-y-12">
      {/* Partners */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Parteneri
            <span className="ml-2 font-mono text-sm font-normal text-steel">({partners.length})</span>
          </h2>
          <PartnerCreateDialog />
        </div>
        {partners.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-5 text-sm text-steel">
            Niciun partener încă. Adaugă unul: singura lui funcție e să scaneze vouchere.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                  <th className="py-2 pr-4">Partener</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Cont</th>
                  <th className="py-2 pr-4">Stare</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(({ partner, accountEmail }) => (
                  <tr key={partner.id} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium">{partner.name}</td>
                    <td className="py-3 pr-4 text-foreground/80">
                      {partner.contactName ?? "-"}
                      {partner.phone ? <span className="text-steel"> · {partner.phone}</span> : null}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{accountEmail ?? "-"}</td>
                    <td className="py-3 pr-4">
                      {partner.active ? (
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">activ</span>
                      ) : (
                        <span className="font-mono text-xs text-steel">inactiv</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Vouchers */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Vouchere
            <span className="ml-2 font-mono text-sm font-normal text-steel">
              ({vouchers.length} · {used} folosite)
            </span>
          </h2>
          <VoucherCreateDialog partners={activePartners} />
        </div>

        {vouchers.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-5 text-sm text-steel">
            Niciun voucher încă. Creează unul, apoi alocă-l unui cont.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                  <th className="py-2 pr-4">Cod</th>
                  <th className="py-2 pr-4">Voucher</th>
                  <th className="py-2 pr-4">Valoare</th>
                  <th className="py-2 pr-4">Partener</th>
                  <th className="py-2 pr-4">Alocat lui</th>
                  <th className="py-2 pr-4">Valabilitate</th>
                  <th className="py-2 pr-4">Stare</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(({ voucher, partnerName, recipientEmail }) => (
                  <tr key={voucher.id} className="border-b border-border/70 align-top">
                    <td className="py-3 pr-4 font-mono text-xs">{voucher.code}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{voucher.title}</div>
                      {voucher.subtitle ? <div className="text-xs text-steel">{voucher.subtitle}</div> : null}
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {formatVoucherValue(voucher.valueType, voucher.valueAmount)}
                    </td>
                    <td className="py-3 pr-4 text-foreground/80">{partnerName ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <VoucherAssign voucherId={voucher.id} recipientEmail={recipientEmail} />
                    </td>
                    <td className="py-3 pr-4 text-xs text-foreground/80">
                      {voucher.validFrom ? `${fmtDate(voucher.validFrom)} - ` : "până la "}
                      {fmtDate(voucher.validUntil)}
                    </td>
                    <td className="py-3 pr-4">
                      {voucher.status === "used" ? (
                        <span className="rounded bg-emerald-600 px-2 py-0.5 font-mono text-[0.65rem] text-white">
                          folosit
                        </span>
                      ) : (
                        <span className="rounded bg-asphalt/10 px-2 py-0.5 font-mono text-[0.65rem] text-steel">
                          nefolosit
                        </span>
                      )}
                      {voucher.usedAt ? (
                        <div className="mt-1 font-mono text-[0.6rem] text-steel">{fmtDate(voucher.usedAt)}</div>
                      ) : null}
                    </td>
                    <td className="py-3">
                      <VoucherDelete voucherId={voucher.id} title={voucher.title} />
                    </td>
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
