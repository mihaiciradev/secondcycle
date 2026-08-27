import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Vinde-ne bicicleta ta",
  description:
    "O luăm în consignație și o vindem pentru tine, cu o parte convenită din preț. Fără anunțuri și fără necunoscuți la ușă.",
};

const steps = [
  { k: "01", t: "Ne spui ce ai", d: "Câteva poze și detalii despre bicicletă. Spune-ne și ce știi că nu e în regulă." },
  { k: "02", t: "O evaluăm corect", d: "Un atelier partener stabilește un preț corect de piață. Nu e un preț inventat de noi." },
  { k: "03", t: "O vindem, primești partea ta", d: "O pregătim și o vindem în numele tău. Primești o parte convenită din preț." },
];

export default function SellPage() {
  const mailto = `mailto:${company.contact.email}?subject=${encodeURIComponent("Vreau să vând o bicicletă")}`;

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Consignație</p>
            <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Vinde-ne bicicleta ta
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">
              O luăm în consignație: o vindem pentru tine și primești o parte convenită din
              preț. Fără anunțuri, fără mesaje nesfârșite și fără necunoscuți la ușă.
            </p>
            <div className="mt-8">
              <a
                href={mailto}
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue px-7 text-base font-semibold text-white transition-colors hover:bg-blue/90"
              >
                Scrie-ne
              </a>
              <p className="mt-3 text-sm text-steel">
                Un formular online pentru vânzare vine în curând. Până atunci, un e-mail e de ajuns.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Cum funcționează</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.k} className="flex flex-col rounded-lg border border-border bg-card p-5">
                <span className="font-mono text-sm text-blue">{s.k}</span>
                <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl border-l-2 border-lime pl-4 text-lg text-foreground/80">
            Fără obligații: dacă nu se vinde în perioada stabilită, îți dăm bicicleta înapoi.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
