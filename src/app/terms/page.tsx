import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description:
    "Termenii și condițiile de utilizare și de vânzare Second Cycle (WEBBINGHUB S.R.L.).",
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

export default function TermsPage() {
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
            Termeni și condiții
          </h1>
          <p className="mt-3 font-mono text-sm text-steel">Ultima actualizare: {UPDATED}</p>
          <P>
            Acești termeni reglementează folosirea platformei Second Cycle și
            cumpărarea bicicletelor prin intermediul ei. Platforma și marca Second
            Cycle sunt operate de {company.legal.entityName}.
          </P>

          <H2>Cine este vânzătorul</H2>
          <P>
            {company.legal.entityName}, CUI {company.legal.cui}, înregistrată la
            Registrul Comerțului cu {company.legal.tradeRegister}, cu sediul în{" "}
            {company.legal.address}, e-mail {company.contact.email}, telefon{" "}
            {company.contact.phone}. Vindem bicicletele în nume propriu: emitem
            factura, semnăm contractul de vânzare și răspundem față de cumpărător
            pentru fiecare bicicletă.
          </P>

          <H2>Contul tău</H2>
          <List
            items={[
              "Poți crea un cont cu adresa de e-mail și o parolă sau prin autentificare cu Google.",
              "Ești responsabil pentru păstrarea confidențialității datelor de acces și pentru activitatea din contul tău.",
              "Ne poți cere oricând ștergerea contului, cu respectarea obligațiilor legale de păstrare a documentelor fiscale.",
            ]}
          />

          <H2>Bicicletele, prețurile și rezervarea</H2>
          <List
            items={[
              "Fiecare bicicletă este un exemplar unic, cu serial propriu. Când s-a vândut, nu mai este disponibilă.",
              "Prețurile sunt afișate în lei și includ TVA acolo unde este cazul.",
              "La începerea cumpărării, bicicleta poate fi rezervată temporar pentru tine; dacă nu finalizezi, rezervarea expiră și bicicleta redevine disponibilă.",
              "Prețul comenzii tale este cel afișat în momentul plasării comenzii; modificările ulterioare de preț nu afectează comenzile deja plasate.",
            ]}
          />

          <H2>Plata</H2>
          <P>
            Plata se face online (card sau Revolut Pay), prin procesatorii de plăți Stripe și
            Revolut. Banii sunt
            încasați de {company.legal.entityName}. Factura este emisă de noi, în nume
            propriu.
          </P>

          <H2>Livrarea și predarea</H2>
          <P>
            Bicicleta este predată prin ridicare personală sau prin curier, conform
            opțiunii alese la comandă. Predarea este documentată printr-un
            proces-verbal de predare-primire; din acel moment încep să curgă termenele
            legale.
          </P>

          <H2>Dreptul de retragere (14 zile)</H2>
          <P>
            Ca și consumator, te poți retrage din contract în termen de 14 zile de la
            predarea fizică a bicicletei, fără a invoca vreun motiv. Găsești detaliile
            și formularul standard pe pagina{" "}
            <Link href="/withdrawal-form" className="text-blue underline underline-offset-2">
              Formular de retragere
            </Link>
            . Transportul de retur este suportat de cumpărător. Rambursarea se face în
            cel mult 14 zile de la momentul în care ești informat că ne-ai anunțat
            retragerea.
          </P>

          <H2>Garanția</H2>
          <P>
            Beneficiezi de garanția legală de conformitate pentru bunurile vândute,
            inclusiv pentru cele de ocazie, pe o durată de 12 luni de la predare.
            Garanția acoperă neconformitățile existente la momentul predării. Pentru
            orice problemă, ne poți contacta la {company.contact.email}.
          </P>

          <H2>Soluționarea reclamațiilor și a litigiilor</H2>
          <P>
            Pentru orice reclamație, scrie-ne la {company.contact.email}. Te poți adresa
            și Autorității Naționale pentru Protecția Consumatorilor (ANPC),{" "}
            <a
              href="https://anpc.ro"
              className="text-blue underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              anpc.ro
            </a>
            , sau poți folosi platforma europeană de soluționare online a litigiilor,{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              className="text-blue underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              ec.europa.eu/consumers/odr
            </a>
            .
          </P>

          <H2>Legea aplicabilă</H2>
          <P>
            Acestor termeni și oricărei vânzări li se aplică legea română. Termenii nu
            limitează drepturile pe care le ai în calitate de consumator conform legii.
          </P>

          <H2>Modificări</H2>
          <P>
            Putem actualiza acești termeni. Versiunea aplicabilă comenzii tale este cea
            pe care ai acceptat-o la plasarea comenzii; versiunea curentă este publicată
            pe această pagină, cu data de mai sus.
          </P>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
