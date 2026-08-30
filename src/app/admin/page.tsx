import Link from "next/link";
import { db } from "@/server/db/client";
import { getAdminStats } from "@/server/services/admin-stats";
import { getStripeSnapshot } from "@/server/services/payments";
import { getStorageStats, isStorageEnabled } from "@/server/storage/r2";
import {
  MiniBars,
  SectionTitle,
  StatCard,
  UsageBar,
  formatBytes,
  lastSixMonths,
} from "@/components/admin/dashboard-ui";
import { FREE_TIER } from "@/server/constants/app";
import { formatLei } from "@/lib/money";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [s, stripe, storage] = await Promise.all([
    getAdminStats(db),
    getStripeSnapshot(),
    getStorageStats(),
  ]);
  const months = lastSixMonths(s.revenue.monthly);

  return (
    <div className="space-y-10">
      {/* Headline numbers */}
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Venit încasat"
            value={formatLei(s.revenue.allTimeCents)}
            sub={`${s.revenue.paidCount} comenzi plătite`}
            tone="accent"
          />
          <StatCard
            label="Luna aceasta"
            value={formatLei(s.revenue.thisMonthCents)}
            sub={`${s.revenue.thisMonthCount} comenzi`}
          />
          <StatCard
            label="Comenzi de tratat"
            value={s.orders.pending}
            sub="în așteptare"
            tone={s.orders.pending > 0 ? "warn" : "default"}
          />
          <StatCard
            label="Cereri „anunță-mă”"
            value={s.watchers.waiting}
            sub="clienți care așteaptă"
          />
          <StatCard label="În stoc" value={s.bikes.available} sub="disponibile acum" />
          <StatCard label="Rezervate" value={s.bikes.reserved} sub="blocate la plată" />
          <StatCard label="Vândute" value={s.bikes.sold} sub={`din ${s.bikes.total} biciclete`} />
          <StatCard
            label="Utilizatori"
            value={s.users.total}
            sub={`+${s.users.newThisMonth} luna aceasta`}
          />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: revenue trend + recent orders */}
        <div className="space-y-10">
          <section>
            <SectionTitle hint="ultimele 6 luni">Venituri lunare</SectionTitle>
            <MiniBars
              data={months.map((m) => ({
                label: m.label,
                value: m.cents,
                caption: m.cents > 0 ? formatLei(m.cents) : "—",
              }))}
            />
          </section>

          <section>
            <SectionTitle
              hint={
                <Link href="/admin/orders" className="text-blue hover:underline">
                  toate
                </Link>
              }
            >
              Comenzi recente
            </SectionTitle>
            {s.recentOrders.length === 0 ? (
              <p className="text-sm text-steel">Nicio comandă încă.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {s.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href="/admin/orders"
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-card"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {o.label}
                          {o.itemCount > 1 ? <span className="text-steel"> +{o.itemCount - 1}</span> : null}
                        </p>
                        <p className="font-mono text-xs text-steel">{o.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded px-2 py-0.5 font-mono text-[0.65rem] ${ORDER_STATUS_BADGE[o.status]}`}>
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                        <p className="mt-1 font-mono text-sm">{formatLei(o.totalCents)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: Stripe, free-tier usage, demand */}
        <div className="space-y-10">
          <section>
            <SectionTitle hint={stripe ? stripe.mode.toUpperCase() : undefined}>Stripe</SectionTitle>
            {stripe ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel">Disponibil</p>
                    <p className="mt-1 font-heading text-xl font-bold tabular-nums">
                      {formatLei(stripe.availableCents)}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel">În tranzit</p>
                    <p className="mt-1 font-heading text-xl font-bold tabular-nums">
                      {formatLei(stripe.pendingCents)}
                    </p>
                  </div>
                </div>
                {stripe.mode === "test" ? (
                  <p className="mt-3 text-xs text-steel">Mediu de test — bani fictivi.</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-steel">
                Stripe nu e configurat în acest mediu (sau nu răspunde).
              </p>
            )}
          </section>

          <section>
            <SectionTitle hint="planuri gratuite">Utilizare servicii</SectionTitle>
            <div className="space-y-4 rounded-xl border border-border bg-card p-4">
              <UsageBar
                label="E-mailuri (Resend), luna"
                used={s.email.sentMonth}
                limit={FREE_TIER.resendEmailsPerMonth}
              />
              <UsageBar
                label="E-mailuri (Resend), azi"
                used={s.email.sentToday}
                limit={FREE_TIER.resendEmailsPerDay}
              />
              <UsageBar
                label="Bază de date (Neon)"
                used={s.dbSizeBytes}
                limit={FREE_TIER.neonStorageBytes}
                format={formatBytes}
              />
              {storage ? (
                <UsageBar
                  label={`Poze (R2 · ${storage.objects} fișiere)`}
                  used={storage.bytes}
                  limit={FREE_TIER.r2StorageBytes}
                  format={formatBytes}
                />
              ) : isStorageEnabled() ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  R2 e configurat, dar nu am putut citi utilizarea (verifică permisiunile tokenului
                  sau conexiunea).
                </p>
              ) : (
                <p className="text-xs text-steel">Stocarea foto (R2) nu e configurată în acest mediu.</p>
              )}
              {s.email.failedMonth > 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {s.email.failedMonth} e-mailuri eșuate luna aceasta — verifică Resend.
                </p>
              ) : null}
            </div>
          </section>

          {s.watchers.top.length > 0 ? (
            <section>
              <SectionTitle hint="cerere">Cele mai așteptate</SectionTitle>
              <ul className="space-y-2">
                {s.watchers.top.map((w) => (
                  <li
                    key={w.sku}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{w.label}</p>
                      <p className="font-mono text-xs text-steel">{w.sku}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue/10 px-2.5 py-1 font-mono text-xs font-semibold text-blue">
                      {w.count} {w.count === 1 ? "cerere" : "cereri"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
