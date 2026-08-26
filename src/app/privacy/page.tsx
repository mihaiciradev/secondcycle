import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Cum colectează, folosește și protejează Second Cycle (WEBBINGHUB S.R.L.) datele tale personale, conform GDPR.",
};

const UPDATED = "26 august 2026";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-heading text-xl font-semibold tracking-tight">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed text-foreground/80">{children}</p>;
}
function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed text-foreground/80">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
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

      <main id="continut" className="flex-1 py-16 sm:py-24">
        <Container className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Politica de confidențialitate
          </h1>
          <p className="mt-3 font-mono text-sm text-steel">Ultima actualizare: {UPDATED}</p>
          <P>
            Second Cycle este marca operată de {company.legal.entityName}. Prin
            această politică îți explicăm ce date personale colectăm, de ce, cui le
            divulgăm și ce drepturi ai, în conformitate cu Regulamentul (UE)
            2016/679 (GDPR).
          </P>

          <H2>Cine este operatorul de date</H2>
          <P>
            {company.legal.entityName}, cod unic de înregistrare {company.legal.cui},
            înregistrată la Registrul Comerțului cu {company.legal.tradeRegister}, cu
            sediul în {company.legal.address}. Ne poți contacta pentru orice aspect
            legat de datele tale la {company.contact.email} sau la{" "}
            {company.contact.phone}.
          </P>

          <H2>Ce date colectăm</H2>
          <List
            items={[
              "Date de cont: adresa de e-mail și parola (stocată doar sub formă criptată, hash argon2id) sau, dacă te autentifici cu Google, adresa de e-mail, numele și identificatorul contului Google.",
              "Date de comandă: nume, adresă de facturare, județ, cod poștal, telefon, e-mail; pentru persoane juridice, CUI și numărul de la Registrul Comerțului; adresa de livrare, dacă alegi curier.",
              "Dovada consimțământului: versiunea termenilor acceptați, data și adresa IP la momentul acceptării.",
              "Newsletter: adresa de e-mail și confirmarea abonării, dacă te abonezi.",
              "Date tehnice: jurnale de acces și adresa IP, strict pentru funcționarea și securitatea platformei.",
            ]}
          />

          <H2>De ce folosim datele și pe ce temei legal</H2>
          <List
            items={[
              "Crearea și administrarea contului tău — executarea contractului (art. 6(1)(b) GDPR).",
              "Procesarea comenzilor, facturarea și livrarea — executarea contractului și îndeplinirea obligațiilor legale (art. 6(1)(b) și (c)).",
              "Trimiterea de comunicări de marketing — doar pe baza consimțământului tău, pe care îl poți retrage oricând (art. 6(1)(a)).",
              "Securitate, prevenirea fraudei și buna funcționare — interesul nostru legitim (art. 6(1)(f)).",
              "Respectarea obligațiilor contabile și fiscale — obligație legală (art. 6(1)(c)).",
            ]}
          />

          <H2>Autentificarea cu Google</H2>
          <P>
            Dacă alegi să te autentifici cu Google, primim de la Google adresa ta de
            e-mail, numele și identificatorul contului, exclusiv pentru a crea și a-ți
            accesa contul Second Cycle. Nu primim și nu stocăm parola ta de Google.
            Folosirea datelor primite de la Google respectă{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className="text-blue underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , inclusiv cerințele privind utilizarea limitată.
          </P>

          <H2>Cui divulgăm datele</H2>
          <P>
            Nu vindem datele tale. Le divulgăm doar furnizorilor care ne ajută să
            operăm platforma, în calitate de persoane împuternicite, sub obligații de
            confidențialitate:
          </P>
          <List
            items={[
              "Neon — găzduirea bazei de date (regiune UE).",
              "Vercel — găzduirea și livrarea aplicației.",
              "Resend — trimiterea e-mailurilor tranzacționale și de marketing.",
              "Cloudflare R2 — stocarea imaginilor.",
              "Google — autentificarea cu Google.",
              "Stripe — procesarea plăților cu cardul.",
              "Autorităților publice, atunci când legea ne obligă.",
            ]}
          />
          <P>
            Unii furnizori pot prelucra date în afara Spațiului Economic European; în
            aceste cazuri ne asigurăm că există garanții adecvate (de exemplu clauze
            contractuale standard aprobate de Comisia Europeană).
          </P>

          <H2>Cât timp păstrăm datele</H2>
          <List
            items={[
              "Datele de cont — până când îți ștergi contul sau ne ceri ștergerea.",
              "Comenzile și documentele fiscale — pe perioada impusă de legislația contabilă (până la 10 ani).",
              "Datele de marketing — până când te dezabonezi.",
              "Jurnalele tehnice — o perioadă limitată, necesară securității.",
            ]}
          />

          <H2>Drepturile tale</H2>
          <P>
            Conform GDPR, ai dreptul de acces, rectificare, ștergere, restricționare,
            portabilitate, opoziție și dreptul de a-ți retrage consimțământul în orice
            moment. Îți poți exercita drepturile scriindu-ne la {company.contact.email}.
            Ai, de asemenea, dreptul de a depune o plângere la Autoritatea Națională de
            Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP),{" "}
            <a
              href="https://www.dataprotection.ro"
              className="text-blue underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              dataprotection.ro
            </a>
            .
          </P>

          <H2>Cookie-uri</H2>
          <P>
            Folosim doar cookie-uri strict necesare pentru funcționarea platformei, în
            special cookie-ul de sesiune care te menține autentificat (httpOnly). Nu
            folosim cookie-uri de urmărire în scop publicitar. Dacă vom adăuga în viitor
            instrumente de analiză, vom actualiza această politică și îți vom cere
            consimțământul acolo unde legea o cere.
          </P>

          <H2>Securitate</H2>
          <P>
            Parolele sunt stocate criptat (hash argon2id), conexiunile sunt securizate
            prin TLS, iar accesul la date este limitat la ce este necesar pentru operare.
          </P>

          <H2>Modificări ale acestei politici</H2>
          <P>
            Putem actualiza această politică. Vom publica versiunea revizuită pe această
            pagină, cu data ultimei actualizări de mai sus.
          </P>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
