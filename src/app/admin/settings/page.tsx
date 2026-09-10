import type { ReactNode } from "react";
import { db } from "@/server/db/client";
import { getFlag, getPaymentProvider, getReturnsNotifyEmail, SETTING } from "@/server/services/settings";
import { isPaymentEnabled } from "@/server/payments/stripe";
import { isRevolutConfigured, revolutMode } from "@/server/payments/revolut";
import { SettingToggle } from "@/components/admin/setting-toggle";
import { NotifyEmailForm } from "@/components/admin/notify-email-form";
import {
  setPaymentsEnabledAction,
  setPrebookEnabledAction,
  setRevolutEnabledAction,
} from "@/server/actions/admin/settings";
import { SectionTitle } from "@/components/admin/dashboard-ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A labelled block that groups a few related settings under one heading. */
function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-steel">
          {title}
        </h3>
        {description ? <p className="mt-1 text-xs text-steel/80">{description}</p> : null}
      </div>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

/** One switchable setting inside a Group, with its explainer. */
function ToggleRow({
  title,
  children,
  initial,
  action,
}: {
  title: string;
  children: ReactNode;
  initial: boolean;
  action: (enabled: boolean) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-6 p-5">
      <div>
        <h4 className="font-heading text-base font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-steel">{children}</p>
      </div>
      <SettingToggle initial={initial} action={action} />
    </div>
  );
}

export default async function AdminSettingsPage() {
  const [paymentsOn, revolutOn, prebookOn, provider, returnsEmail] = await Promise.all([
    getFlag(db, SETTING.paymentsEnabled),
    getFlag(db, SETTING.revolutEnabled),
    getFlag(db, SETTING.prebookEnabled),
    getPaymentProvider(db),
    getReturnsNotifyEmail(db),
  ]);

  const stripeConfigured = isPaymentEnabled();
  const stripeMode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_") ? "LIVE" : "TEST";
  const revolutConfigured = isRevolutConfigured();

  const providerLabel =
    provider === "revolut" ? "Revolut Pay" : provider === "stripe" ? "Stripe" : null;

  return (
    <div className="max-w-2xl space-y-10">
      <SectionTitle>Setări aplicație</SectionTitle>

      {/* Live status, up top so the current state is the first thing you see. */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            provider ? "bg-emerald-600 text-white" : "bg-amber-500 text-asphalt"
          }`}
        >
          <span className={`size-1.5 rounded-full ${provider ? "bg-white" : "bg-asphalt"}`} />
          {provider
            ? `Clienții plătesc acum prin ${providerLabel}`
            : "Plățile sunt oprite pentru clienți"}
        </span>
        <div className="mt-4 space-y-2 text-sm">
          <StatusRow label="Comutator plăți" ok={paymentsOn} okText="Pornit" offText="Oprit" />
          <StatusRow
            label="Stripe configurat"
            ok={stripeConfigured}
            okText={`Da · ${stripeMode}`}
            offText="Nu, lipsesc cheile"
          />
          <StatusRow
            label="Revolut configurat"
            ok={revolutConfigured}
            okText={`Da · ${revolutMode().toUpperCase()}`}
            offText="Nu, lipsesc cheile"
          />
        </div>
      </div>

      <Group
        title="Plăți"
        description="Controlează dacă și cum pot plăti clienții. Furnizorul ales trebuie să aibă cheile configurate în acest mediu."
      >
        <ToggleRow title="Plăți online active" initial={paymentsOn} action={setPaymentsEnabledAction}>
          Când e oprit, clienții nu văd butonul de plată/comandă; în locul lui apare un mesaj că
          plățile sunt indisponibile temporar. Trebuie pornit ca să se poată plasa comenzi.
        </ToggleRow>
        <ToggleRow title="Folosește Revolut Pay" initial={revolutOn} action={setRevolutEnabledAction}>
          Pornit: comenzile se plătesc prin <strong>Revolut Pay</strong>. Oprit: prin{" "}
          <strong>Stripe</strong>.
        </ToggleRow>
      </Group>

      <Group title="Vânzare" description="Cum se comportă bicicletele în magazin.">
        <ToggleRow title="Mod prebook" initial={prebookOn} action={setPrebookEnabledAction}>
          Pornit: bicicletele sunt vizibile dar nu se pot cumpăra. În locul butonului de cumpărare
          apare <strong>Prebook</strong> (captăm interesul, fără să blocăm bicicleta) și orice comandă
          e refuzată. Le vezi în tab-ul „Prebook”.
        </ToggleRow>
      </Group>

      <Group title="Notificări">
        <div className="p-5">
          <h4 className="font-heading text-base font-semibold">E-mail pentru cereri de retur</h4>
          <p className="mt-1 mb-4 text-sm text-steel">
            Aici primești o notificare de fiecare dată când un client trimite o cerere de retur.
            Cererea rămâne oricum vizibilă în tab-ul „Retururi”, chiar dacă e-mailul nu ajunge.
          </p>
          <NotifyEmailForm initial={returnsEmail} />
        </div>
      </Group>

      <p className="text-xs text-steel">
        Notă: chiar dacă oprești plățile aici, un client deja aflat în pagina furnizorului își poate
        finaliza plata în curs; webhook-ul o procesează corect. Comutatorul controlează pornirea de
        noi comenzi.
      </p>
    </div>
  );
}

function StatusRow({
  label,
  ok,
  okText,
  offText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  offText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-foreground/80">{label}</span>
      <span className={`font-mono text-xs ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-steel"}`}>
        {ok ? okText : offText}
      </span>
    </div>
  );
}
