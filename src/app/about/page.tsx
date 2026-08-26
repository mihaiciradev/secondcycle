import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { ModelDiagram } from "@/components/sections/model-diagram";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

export const metadata: Metadata = {
  title: "Ce facem",
  description:
    "Second Cycle pe scurt: cumpărăm, reparăm și vindem biciclete second-hand în regim de consignație, în nume propriu. O explicație rapidă a modelului.",
};

const positioning = [
  {
    t: "Golul din piață",
    b: "OLX și Facebook sunt mai ieftine, dar fără acte, fără garanție și fără certitudinea că bicicleta nu e furată. Magazinele noi costă de câteva ori mai mult. Noi stăm exact între ele.",
  },
  {
    t: "Cum câștigăm",
    b: "Lucrăm în consignație: vindem bicicleta în numele proprietarului, care primește o parte convenită din preț. Noi o recondiționăm, îi punem acte și garanție și o vindem la un preț corect.",
  },
  {
    t: "Cine e vânzătorul",
    b: "Vindem în nume propriu. Noi emitem factura, semnăm contractul cu cumpărătorul și răspundem pentru bicicletă. Proprietarul nu apare în relația cu clientul.",
  },
];

export default function AboutPage() {
  return (
    <>
      <header className="border-b border-border/80 bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label={company.name}
            className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BrandLogo tone="light" height={52} priority />
          </Link>
          <Link
            href="/"
            className="rounded-sm text-sm text-foreground/75 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ← Înapoi la pagina principală
          </Link>
        </Container>
      </header>

      <main id="continut" className="flex-1">
        <section className="py-16 sm:py-24">
          <Container className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
              Ce facem
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Încrederea unui atelier, la un preț apropiat de o vânzare între persoane.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-foreground/80">
              Cumpărăm biciclete second-hand, le verificăm, le reparăm și le
              vindem cu acte și garanție. Fiecare bicicletă e un unicat, cu serial
              propriu și fișă tehnică. Începem în {company.city}.
            </p>
          </Container>
        </section>

        <section className="pb-8">
          <Container>
            <div className="rounded border border-border bg-card p-6 sm:p-10">
              <h2 className="text-2xl font-semibold tracking-tight">Modelul, pe scurt</h2>
              <p className="mt-2 max-w-2xl text-foreground/75">
                De la proprietar până la predarea către cumpărător, cu Second
                Cycle ca vânzător pe tot parcursul.
              </p>
              <div className="mt-8">
                <ModelDiagram />
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 sm:py-16">
          <Container>
            <div className="grid gap-4 md:grid-cols-3">
              {positioning.map((p) => (
                <div key={p.t} className="rounded border border-border bg-card p-6">
                  <h2 className="font-heading text-lg font-semibold tracking-tight">
                    {p.t}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                    {p.b}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
