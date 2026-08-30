"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/use-cart";
import { watchBikeAction } from "@/server/actions/reservations";
import type { CartItem } from "@/lib/cart";

const solidBtn =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-blue px-7 text-base font-semibold text-white transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-60";
const ghostBtn =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-asphalt/25 px-7 text-base font-semibold text-foreground transition-colors hover:border-asphalt/50";

export function BikeActions({
  bike,
  status,
  userEmail,
  paymentsLive = true,
}: {
  bike: CartItem;
  status: "available" | "reserved" | "sold" | "draft" | "withdrawn";
  userEmail?: string;
  paymentsLive?: boolean;
}) {
  const router = useRouter();
  const { has, add } = useCart();
  const inCart = has(bike.bikeId);

  if (status === "available" && !paymentsLive) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        Comenzile online sunt momentan indisponibile din motive tehnice. Revino în curând sau
        contactează-ne.
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            add(bike);
            router.push("/checkout");
          }}
          className={solidBtn}
        >
          Cumpără acum
        </button>
        {inCart ? (
          <Link href="/cart" className={ghostBtn}>
            În coș ✓ · vezi coșul
          </Link>
        ) : (
          <button type="button" onClick={() => add(bike)} className={ghostBtn}>
            Adaugă în coș
          </button>
        )}
      </div>
    );
  }

  if (status === "reserved") {
    return <NotifyMe bikeId={bike.bikeId} defaultEmail={userEmail} />;
  }

  return (
    <span className="inline-flex h-12 items-center rounded-full border border-asphalt/20 px-7 text-base text-steel">
      Vândută
    </span>
  );
}

function NotifyMe({ bikeId, defaultEmail }: { bikeId: string; defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [state, setState] = useState<"idle" | "loading" | "done" | "available">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await watchBikeAction({ bikeId, email: email.trim() });
    if (res.ok) {
      setState(res.status === "available" ? "available" : "done");
    } else {
      setState("idle");
      setError(res.error);
    }
  }

  return (
    <div>
      <div className="mb-3 inline-flex h-9 items-center rounded-full bg-manila/60 px-4 text-sm font-medium text-asphalt">
        Rezervată momentan
      </div>
      {state === "done" ? (
        <p className="rounded-md border border-blue/25 bg-blue/5 px-3.5 py-2.5 text-sm text-blue">
          Gata. Îți scriem pe <strong>{email}</strong> imediat ce se eliberează.
        </p>
      ) : state === "available" ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          Vești bune: s-a eliberat între timp. Reîncarcă pagina ca s-o cumperi.
        </p>
      ) : (
        <form onSubmit={submit} className="max-w-sm">
          <p className="mb-2 text-sm text-foreground/70">
            E deja rezervată de altcineva. Îți dăm de veste dacă redevine disponibilă:
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresa ta de e-mail"
              className="h-11 flex-1 rounded-full border border-border bg-paper px-4 text-sm outline-none focus:border-asphalt/50"
            />
            <button type="submit" disabled={state === "loading"} className={solidBtn + " h-11 px-5 text-sm"}>
              {state === "loading" ? "Se trimite…" : "Anunță-mă"}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
