import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Camera, Store, FileSignature, PackageCheck, HandCoins, Check, Undo2 } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Consignație pentru persoane fizice: cum vinzi bicicleta pas cu pas",
  description:
    "Pașii consignației pentru persoane fizice: trimiți poze, primești un preț provizoriu de la un atelier partener, semnăm contractul, stabilim prețul real, o vindem și primești banii.",
  alternates: { canonical: "/consignatie-pf" },
  openGraph: {
    type: "website",
    url: "/consignatie-pf",
    title: "Consignație pentru persoane fizice | Second Cycle",
    description:
      "De la primele poze până la banii în cont: cum funcționează consignația bicicletei tale, pas cu pas.",
  },
};

type Step = {
  k: string;
  icon: ReactNode;
  title: string;
  body: ReactNode;
};

const steps: Step[] = [
  {
    k: "01",
    icon: <Camera className="size-5" aria-hidden />,
    title: "Trimiți poze cu bicicleta",
    body: (
      <>
        Cât mai multe poze, cu atât mai bine: și de aproape pe piese, și cu bicicleta întreagă. Dacă
        știi vreo problemă la ea, spune-ne din start. Așa putem estima un preț cât mai corect încă de
        la început.
      </>
    ),
  },
  {
    k: "02",
    icon: <Store className="size-5" aria-hidden />,
    title: "Cerem o sugestie de preț unui atelier partener",
    body: (
      <>
        Vorbim cu un atelier partener și cerem o sugestie de preț (un <strong>preț provizoriu</strong>
        ), direct de la profesioniști care cunosc piața.
      </>
    ),
  },
  {
    k: "03",
    icon: <FileSignature className="size-5" aria-hidden />,
    title: "Îți comunicăm prețul provizoriu și semnăm contractul",
    body: (
      <>
        Îți spunem prețul provizoriu. Dacă ești de acord, facem un contract de consignație cu acest
        preț provizoriu.
      </>
    ),
  },
  {
    k: "04",
    icon: <PackageCheck className="size-5" aria-hidden />,
    title: "Predai bicicleta și stabilim prețul real",
    body: (
      <>
        Predai bicicleta, o ducem la un atelier și stabilim <strong>prețul real</strong>: prețul pe
        care ți-l oferim dacă o vindem.
      </>
    ),
  },
  {
    k: "05",
    icon: <HandCoins className="size-5" aria-hidden />,
    title: "O vindem și îți primești banii",
    body: (
      <>
        După ce găsim cumpărător, îi facem revizia și eventualele reparații, o predăm noului
        proprietar, iar tu îți primești banii.
      </>
    ),
  },
];

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export default function ConsignarePfPage() {
  const mailto = `mailto:${company.contact.inboxEmail}?subject=${encodeURIComponent(
    "Vreau să dau o bicicletă în consignație"
  )}`;
  const waNumber = company.contact.phone.replace(/\D/g, "");
  const whatsapp = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Salut! Vreau să dau o bicicletă în consignație (persoană fizică)."
  )}`;

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/80">
          <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
              Consignație · Persoană fizică
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Cum îți vindem bicicleta, pas cu pas
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">
              O dai în consignație, iar noi ne ocupăm de tot: evaluare printr-un atelier, contract,
              pregătire și vânzare. Tu trimiți doar câteva poze la început, iar la final îți primești
              banii.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-semibold text-white transition-colors hover:bg-[#20bd5a]"
              >
                <WhatsAppIcon />
                Trimite pozele pe WhatsApp
              </a>
              <a
                href={mailto}
                className="inline-flex h-12 items-center justify-center rounded-full border border-asphalt/25 px-7 text-base font-semibold text-foreground transition-colors hover:border-asphalt/50"
              >
                Scrie-ne pe e-mail
              </a>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Cei 5 pași</h2>

          <ol className="mt-10 space-y-0">
            {steps.map((s, i) => {
              const last = i === steps.length - 1;
              return (
                <li key={s.k} className="relative flex gap-5 pb-10 last:pb-0">
                  {/* Number badge + connecting line */}
                  <div className="relative flex flex-col items-center">
                    <span className="z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-asphalt shadow-sm">
                      {s.icon}
                    </span>
                    {!last ? (
                      <span
                        aria-hidden
                        className="absolute top-12 h-[calc(100%-3rem)] w-px bg-border"
                      />
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-sm text-blue">{s.k}</span>
                      <h3 className="font-heading text-lg font-semibold tracking-tight">
                        {s.title}
                      </h3>
                    </div>
                    <p className="mt-2 max-w-xl leading-relaxed text-foreground/80">{s.body}</p>

                    {/* Step 4 has two outcomes. */}
                    {s.k === "04" ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-lime/40 bg-lime/[0.06] p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-asphalt">
                            <Check className="size-4 text-lime" aria-hidden />
                            Dacă ești de acord
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                            Punem bicicleta pe site și avem 30 de zile (sau câte am agreat în
                            contract) ca să o vindem. Dacă perioada expiră și nu s-a vândut, îți
                            predăm bicicleta înapoi.
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                            <Undo2 className="size-4 text-steel" aria-hidden />
                            Dacă nu ești de acord
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                            Nicio problemă: îți predăm bicicleta înapoi.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 max-w-2xl border-l-2 border-lime pl-4 text-lg text-foreground/80">
            Fără obligații: dacă nu se vinde în perioada stabilită, îți dăm bicicleta înapoi.
          </p>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-border/80 bg-card/40">
          <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Gata să începi? Trimite-ne câteva poze.
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-foreground/80">
              E cel mai simplu pe WhatsApp: fotografii cu bicicleta întreagă și de aproape pe piese,
              plus orice problemă știută. Îți revenim cu un preț provizoriu.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
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
            <p className="mt-4 text-sm text-steel">
              Sau direct:{" "}
              <a
                href={`tel:${company.contact.phone.replace(/\s/g, "")}`}
                className="text-blue underline-offset-2 hover:underline"
              >
                {company.contact.phone}
              </a>{" "}
              ·{" "}
              <a href={mailto} className="text-blue underline-offset-2 hover:underline">
                {company.contact.inboxEmail}
              </a>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
