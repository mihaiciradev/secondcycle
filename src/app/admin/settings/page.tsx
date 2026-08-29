import { db } from "@/server/db/client";
import { getFlag, SETTING } from "@/server/services/settings";
import { isPaymentEnabled } from "@/server/payments/stripe";
import { PaymentsToggle } from "@/components/admin/payments-toggle";
import { SectionTitle } from "@/components/admin/dashboard-ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const flag = await getFlag(db, SETTING.paymentsEnabled);
  const stripeConfigured = isPaymentEnabled();
  const mode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_")
    ? "live"
    : stripeConfigured
      ? "test"
      : null;
  const live = flag && stripeConfigured;

  return (
    <div className="max-w-2xl space-y-8">
      <SectionTitle>Setări aplicație</SectionTitle>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="font-heading text-base font-semibold">Plăți online active</h3>
            <p className="mt-1 text-sm text-steel">
              Când e oprit, clienții nu văd butonul de plată/comandă — în locul lui apare un mesaj
              că plățile sunt indisponibile temporar. Trebuie pornit ca să se poată plasa comenzi
              prin Stripe.
            </p>
          </div>
          <PaymentsToggle initial={flag} />
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <StatusRow
            label="Comutator plăți"
            ok={flag}
            okText="Pornit"
            offText="Oprit"
          />
          <StatusRow
            label="Stripe configurat în acest mediu"
            ok={stripeConfigured}
            okText={mode === "live" ? "Da · LIVE" : "Da · TEST"}
            offText="Nu — lipsesc cheile"
          />
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                live
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              }`}
            >
              <span className={`size-1.5 rounded-full ${live ? "bg-white" : "bg-amber-500"}`} />
              {live ? "Clienții pot plăti acum" : "Plățile sunt oprite pentru clienți"}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-steel">
        Notă: chiar dacă oprești plățile aici, un client care e deja în pagina Stripe își poate
        finaliza plata în curs; webhook-ul o va procesa corect. Comutatorul controlează pornirea
        de noi comenzi.
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
