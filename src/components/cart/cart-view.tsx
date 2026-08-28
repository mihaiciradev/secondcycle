"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/use-cart";
import { formatLei } from "@/lib/money";

export function CartView() {
  const router = useRouter();
  const { items, remove, count } = useCart();
  const total = items.reduce((sum, it) => sum + it.priceCents, 0);

  if (count === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center text-steel">
        Coșul e gol.{" "}
        <Link href="/bikes" className="text-blue underline-offset-2 hover:underline">
          Vezi bicicletele
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it.bikeId}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-3.5"
          >
            <div className="size-16 shrink-0 overflow-hidden rounded bg-manila/40">
              {it.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[0.6rem] text-asphalt/40">
                  {it.sku}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/bikes/${it.sku}`} className="font-medium hover:text-blue">
                {it.brand} {it.model}
              </Link>
              <p className="font-mono text-xs text-steel">{it.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">{formatLei(it.priceCents)}</p>
              <button
                type="button"
                onClick={() => remove(it.bikeId)}
                className="mt-1 cursor-pointer text-xs text-steel underline-offset-2 hover:text-destructive hover:underline"
              >
                Scoate
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-foreground/70">Total ({count})</span>
            <span className="font-heading text-xl font-bold tracking-tight">{formatLei(total)}</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-blue text-base font-semibold text-white transition-colors hover:bg-blue/90"
          >
            Finalizează comanda
          </button>
          <p className="mt-3 text-xs text-steel">
            Bicicletele se blochează pentru tine 30 de minute abia când începi plata.
          </p>
        </div>
      </aside>
    </div>
  );
}
