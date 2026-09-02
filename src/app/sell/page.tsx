import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Vinde-ți bicicleta",
  description:
    "O luăm în consignație și o vindem pentru tine, cu o parte convenită din preț. Fără anunțuri și fără necunoscuți la ușă. Evaluare corectă printr-un atelier partener.",
  alternates: { canonical: "/sell" },
  openGraph: {
    type: "website",
    url: "/sell",
    title: "Vinde-ți bicicleta | Second Cycle",
    description:
      "O luăm în consignație, o pregătim și o vindem în numele tău. Primești o parte convenită din preț.",
  },
};

const steps = [
  { k: "01", t: "Ne spui ce ai", d: "Câteva poze și detalii despre bicicletă. Spune-ne și ce știi că nu e în regulă." },
  { k: "02", t: "O evaluăm corect", d: "Un atelier partener stabilește un preț corect de piață. Nu e un preț inventat de noi." },
  { k: "03", t: "O vindem, primești partea ta", d: "O pregătim și o vindem în numele tău. Primești o parte convenită din preț." },
];

const benefits = [
  "Preț corect, stabilit de un atelier, nu de noi",
  "Noi ne ocupăm de tot: verificare, reparații și vânzare",
  "Fără necunoscuți la ușă și fără negocieri interminabile",
];

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export default function SellPage() {
  const mailto = `mailto:${company.contact.email}?subject=${encodeURIComponent("Vreau să vând o bicicletă")}`;
  const waNumber = company.contact.phone.replace(/\D/g, "");
  const whatsapp = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Salut! Vreau să vând o bicicletă prin Second Cycle."
  )}`;

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Consignație</p>
            <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Vinde-ți bicicleta
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">
              O luăm în consignație: o vindem pentru tine și primești o parte convenită din
              preț. Fără anunțuri, fără mesaje nesfârșite și fără necunoscuți la ușă.
            </p>

            <ul className="mt-6 grid max-w-xl gap-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex gap-2.5 text-foreground/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-semibold text-white transition-colors hover:bg-[#20bd5a]"
              >
                <WhatsAppIcon />
                Scrie-ne pe WhatsApp
              </a>
              <a
                href={mailto}
                className="inline-flex h-12 items-center justify-center rounded-full border border-asphalt/25 px-7 text-base font-semibold text-foreground transition-colors hover:border-asphalt/50"
              >
                Trimite un e-mail
              </a>
            </div>
            <p className="mt-3 text-sm text-steel">
              Sau direct:{" "}
              <a href={`tel:${company.contact.phone.replace(/\s/g, "")}`} className="text-blue underline-offset-2 hover:underline">
                {company.contact.phone}
              </a>{" "}
              ·{" "}
              <a href={mailto} className="text-blue underline-offset-2 hover:underline">
                {company.contact.email}
              </a>
              . Un formular online pentru vânzare vine în curând.
            </p>
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
