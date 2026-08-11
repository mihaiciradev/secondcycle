/**
 * All copy for the home page, in Romanian.
 *
 * Rules that shaped this content:
 * - Second Cycle is the SELLER, never a marketplace. First person throughout:
 *   noi verificăm, noi garantăm, noi luăm bicicleta înapoi. No "vânzător",
 *   no owner, no listing-by.
 * - Specificity over superlatives. No marketing adjective where a fact fits.
 * - No invented numbers. Inspection categories carry NO counts (we have no
 *   verified figures); repair tiers carry NO fixed prices (quoted per bike).
 * - The warranty PERIOD is intentionally not stated on the page (business
 *   decision). We say there is a legal warranty, without a month count.
 * - Legal facts are exact: retragere 14 zile, clock starts at handover,
 *   buyer pays return shipping (stated up front).
 */

export const hero = {
  eyebrow: "Timișoara",
  title: "Încrederea unui atelier, la un preț apropiat de o vânzare între persoane.",
  body: "Cumpărăm biciclete second-hand, le reparăm și le vindem cu acte și garanție. O verificăm, o reparăm și ne punem numele pe ea.",
  primaryCta: { href: "#biciclete", label: "Vezi bicicletele" },
  secondaryCta: { href: "#cum-vinzi", label: "Vinde-ne bicicleta ta" },
} as const;

/** Static trust strip. No motion, wraps on narrow screens. */
export const trustBar = [
  { label: "Cu garanție", detail: "garanție legală de conformitate" },
  { label: "Cu acte", detail: "contract de vânzare și factură pe numele nostru" },
  { label: "Verificată", detail: "inspecție tehnică înainte de listare" },
  { label: "Livrare la tine", detail: "cu proces-verbal de predare-primire" },
] as const;

export const buying = {
  id: "cum-cumperi",
  title: "Cum cumperi",
  intro: "Tu alegi bicicleta și nivelul de reparație. Restul ține de noi.",
  steps: [
    {
      k: "01",
      title: "Alegi bicicleta",
      body: "Fiecare bicicletă are un serial propriu, o fișă cu starea reală și o notă de condiție. Nu e un catalog de produse identice. Fiecare e unicat.",
    },
    {
      k: "02",
      title: "Alegi nivelul de reparație",
      body: "Basic, Quality sau Premium. Prețul nivelului ales se adaugă la prețul bicicletei, înainte de plată.",
    },
    {
      k: "03",
      title: "Accepți termenii și plătești",
      body: "Confirmi că ai citit contractul de vânzare, completezi datele de facturare și plătești cu cardul. Banii intră în contul Second Cycle.",
    },
    {
      k: "04",
      title: "Reparăm bicicleta",
      body: "După plată, bicicleta intră în atelier pentru reparațiile de la nivelul ales. Acest pas poate dura, iar tu vezi în ce stadiu e comanda.",
    },
    {
      k: "05",
      title: "Ți-o predăm cu proces-verbal",
      body: "La livrare semnăm un proces-verbal de predare-primire. Din acest moment încep să curgă termenele legale: garanția și dreptul de retur.",
    },
  ],
} as const;

export const selling = {
  id: "cum-vinzi",
  title: "Vinde-ne bicicleta ta",
  intro:
    "Lucrăm în regim de consignație: încercăm să-ți vindem bicicleta, iar tu primești o parte convenită din preț.",
  steps: [
    {
      k: "01",
      title: "Semnăm un contract de consignație",
      body: "Stabilim împreună o perioadă în care încercăm să vindem bicicleta și partea care ți se cuvine la vânzare.",
    },
    {
      k: "02",
      title: "Un atelier partener o evaluează",
      body: "Prețul nu e inventat de noi. Un atelier partener evaluează bicicleta și garantează o valoare corectă de piață.",
    },
    {
      k: "03",
      title: "O pregătim și o listăm",
      body: "O fotografiem, îi dăm o notă de condiție și un serial, și verificăm seria cadrului în registrul bicicletelor furate.",
    },
  ],
  reassurance:
    "Fără obligații: dacă nu o vindem în perioada stabilită, îți dăm bicicleta înapoi.",
} as const;

/**
 * The inspection is the trust engine of the page.
 * Categories are real inspection groups. NO counts are shown: we have no
 * verified numbers, and a fake "X-point check" would read as a promise.
 */
export const inspection = {
  id: "verificarea",
  title: "Verificarea",
  intro:
    "Înainte de listare, fiecare bicicletă trece printr-o inspecție tehnică. Notăm ce e în regulă și ce nu, inclusiv defectele. Preferăm un fapt concret unui adjectiv.",
  groups: [
    {
      title: "Cadru și furcă",
      items: ["Fisuri și lovituri", "Aliniere", "Coroziune", "Filete și inserturi"],
    },
    {
      title: "Transmisie",
      items: ["Uzura lanțului", "Pinioane și foi", "Schimbătoare", "Rulmenți pedalier"],
    },
    {
      title: "Frânare",
      items: ["Plăcuțe și saboți", "Discuri sau jante", "Cabluri și hidraulică", "Manete"],
    },
    {
      title: "Roți și anvelope",
      items: ["Voalări", "Tensiune spițe", "Rulmenți butuci", "Uzura anvelopelor"],
    },
    {
      title: "Direcție și comenzi",
      items: ["Cuvete direcție", "Ghidon și pipă", "Șa și tijă", "Joc și strângeri"],
    },
    {
      title: "Identitate și proveniență",
      items: [
        "Seria cadrului",
        "Verificare în registrul bicicletelor furate",
        "Serial intern Second Cycle",
        "Notă de condiție",
      ],
    },
  ],
  note:
    "Rezultatul verificării ajunge în fișa fiecărei biciclete. Ce e uzat scrie „uzat”.",
} as const;

/**
 * Repair tiers. Pricing is quoted per bike (established at valuation), so no
 * fixed prices appear. Tier contents are described at a structural level only.
 * The exact work per bike is listed in that bike's fișă. Replace with the real
 * tier definitions when finalized.
 */
export const repairTiers = {
  id: "reparatii",
  title: "Nivelurile de reparație",
  intro:
    "Alegi nivelul la cumpărare. Fiecare nivel îl include pe cel dinainte. Ce anume se face pe fiecare bicicletă e listat în fișa ei, iar prețul se stabilește la evaluare.",
  tiers: [
    {
      id: "basic",
      name: "Basic",
      summary: "Siguranță și funcționare.",
      body: "Aducem la standard elementele critice pentru siguranță și ne asigurăm că bicicleta funcționează corect.",
    },
    {
      id: "quality",
      name: "Quality",
      summary: "Basic, plus piesele de uzură.",
      body: "Pe lângă Basic, înlocuim piesele de uzură ajunse la capăt, ca bicicleta să nu ceară intervenții imediate.",
    },
    {
      id: "premium",
      name: "Premium",
      summary: "Recondiționare completă.",
      body: "Recondiționare pe toate ansamblurile, pentru starea cea mai apropiată de nou pe care o poate atinge bicicleta.",
    },
  ],
  priceNote: "Prețul fiecărui nivel se stabilește per bicicletă și se adaugă la prețul ei.",
} as const;

/**
 * Rights. Withdrawal (14 days) and warranty are DIFFERENT things, shown under
 * separate headings, never merged into one "Returns" blur. The warranty period
 * is deliberately not stated (business decision).
 */
export const rights = {
  id: "drepturile-tale",
  title: "Drepturile tale",
  intro: "Două lucruri diferite, explicate separat. Nu le amestecăm.",
  withdrawal: {
    title: "Retragere în 14 zile",
    lead: "„M-am răzgândit.”",
    points: [
      "Ai la dispoziție 14 zile ca să te retragi, fără să dai niciun motiv.",
      "Nu e nevoie de niciun defect. Poți pur și simplu să te răzgândești.",
      "Cele 14 zile încep de la predarea fizică a bicicletei, nu de la plată.",
      "Bicicleta se întoarce, banii se întorc. Rambursare în cel mult 14 zile de la anunț.",
      "Transportul de retur este suportat de cumpărător.",
    ],
    formLabel: "Descarcă formularul de retragere",
    formHref: "/formular-retragere",
    formNote:
      "Nu ești obligat să folosești formularul. Un e-mail clar e suficient, dar ți-l punem la dispoziție.",
  },
  warranty: {
    title: "Garanție",
    lead: "„S-a stricat sau nu e cum a fost descris.”",
    points: [
      "Beneficiezi de garanția legală de conformitate.",
      "Se aplică atunci când există un defect real sau o neconformitate față de descriere.",
      "Noi am reparat bicicleta și tot noi răspundem față de tine pentru ea.",
      "Ne ocupăm de remediere. Nu te trimitem la altcineva.",
    ],
  },
} as const;

export const footer = {
  legalLinks: [
    { href: "/termeni", label: "Termeni și condiții" },
    { href: "/confidentialitate", label: "Politica de confidențialitate" },
    { href: "/cookies", label: "Politica de cookies" },
    { href: "/formular-retragere", label: "Formular de retragere" },
  ],
  disclaimer:
    "Second Cycle vinde bicicletele în nume propriu. Emitem factura, semnăm contractul de vânzare și răspundem față de cumpărător pentru fiecare bicicletă.",
} as const;
