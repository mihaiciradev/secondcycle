/**
 * Bilingual copy for the home page (RO default, EN toggle).
 *
 * Ground rules kept from the brief:
 * - Second Cycle is the SELLER on a CONSIGNMENT model. First person, no
 *   marketplace language, no owner exposed to the buyer.
 * - No invented facts: no stock counts, no "X-point check", no warranty period,
 *   no payout times, no impact statistics. Sample bikes are illustrative only.
 * - Specificity over superlatives; flaws are stated plainly.
 */

export type Locale = "ro" | "en";

export interface Bike {
  serial: string;
  model: string;
  symbol: "bike-city" | "bike-road" | "bike-mtb";
  category: "city" | "mountain" | "road";
  grade: "a" | "b" | "c";
  year: number;
  frame: string;
  wheel: string; // inches, without the quote mark
  speed: number;
  price: number; // RON, illustrative
  work: Record<Locale, string[]>;
}

/** Sample stock. Illustrative catalogue, one of one, no stock count implied. */
export const bikes: Bike[] = [
  {
    serial: "RO-4471",
    model: "Pegas Clasic Mixt",
    symbol: "bike-city",
    category: "city",
    grade: "a",
    year: 2019,
    frame: "M",
    wheel: "28",
    speed: 3,
    price: 850,
    work: {
      ro: ["Lanț și plăcuțe noi", "Ambele roți centrate", "Anvelope, șa și mânere noi"],
      en: ["New chain and pads", "Both wheels trued", "New tyres, saddle, grips"],
    },
  },
  {
    serial: "RO-4468",
    model: "Cube Aim Race",
    symbol: "bike-mtb",
    category: "mountain",
    grade: "a",
    year: 2020,
    frame: "L",
    wheel: "29",
    speed: 18,
    price: 1590,
    work: {
      ro: ["Furcă revizuită", "Pinioane și lanț noi", "Frâne purjate, plăcuțe noi"],
      en: ["Fork serviced", "New cassette and chain", "Brakes bled, new pads"],
    },
  },
  {
    serial: "RO-4463",
    model: "Bianchi Via Nirone 7",
    symbol: "bike-road",
    category: "road",
    grade: "b",
    year: 2017,
    frame: "54",
    wheel: "28",
    speed: 20,
    price: 2450,
    work: {
      ro: ["Bandă de ghidon și cabluri noi", "Butuci regresați", "Vopsea sărită pe tubul superior"],
      en: ["New bar tape and cables", "Hubs regreased", "Paint chips on the top tube"],
    },
  },
  {
    serial: "RO-4459",
    model: "Btwin Elops 520",
    symbol: "bike-city",
    category: "city",
    grade: "a",
    year: 2021,
    frame: "S",
    wheel: "26",
    speed: 6,
    price: 990,
    work: {
      ro: ["Plăcuțe de frână noi", "Portbagaj și aripi montate", "Lumini incluse"],
      en: ["New brake pads", "Rack and mudguards fitted", "Lights included"],
    },
  },
  {
    serial: "RO-4455",
    model: "Ideal Freeder",
    symbol: "bike-mtb",
    category: "mountain",
    grade: "b",
    year: 2016,
    frame: "M",
    wheel: "27.5",
    speed: 21,
    price: 690,
    work: {
      ro: ["Transmisie înlocuită complet", "Mânere și pedale noi", "Janta spate prezintă uzură"],
      en: ["Full drivetrain replaced", "New grips and pedals", "Rear rim shows wear"],
    },
  },
  {
    serial: "RO-4450",
    model: "Giant Contend 3",
    symbol: "bike-road",
    category: "road",
    grade: "a",
    year: 2019,
    frame: "M",
    wheel: "28",
    speed: 16,
    price: 2190,
    work: {
      ro: ["Anvelope și camere noi", "Viteze reindexate", "Pedalier înlocuit"],
      en: ["New tyres and tubes", "Gears re-indexed", "Bottom bracket replaced"],
    },
  },
];

interface Dict {
  htmlLang: string;
  nav: { bikes: string; sell: string; check: string; browse: string };
  hero: {
    eyebrow: string;
    h1: { pre: string; em: string; post: string };
    sub: string;
    browse: string;
    sell: string;
    proof: { b: string; s: string }[];
    callouts: { b: string; s: string }[];
    caption: string;
  };
  strip: string[];
  check: {
    h2: string;
    p: string;
    cards: { title: string; items: string[] }[];
    papers: { title: string; p: string };
  };
  bikes: {
    h2: string;
    p: string;
    filters: { key: string; label: string }[];
    legend: string;
    specFrame: string;
    specSpeed: string;
    see: string;
    more: string;
    empty: string;
  };
  sell: {
    eyebrow: string;
    h2: string;
    p: string;
    steps: { n: string; h3: string; p: string }[];
    ctaTitle: string;
    ctaBtn: string;
  };
  footer: {
    blurb: string;
    cols: { title: string; links: { label: string; href: string }[] }[];
    rightsLine: string;
  };
}

export const messages: Record<Locale, Dict> = {
  ro: {
    htmlLang: "ro",
    nav: { bikes: "Biciclete în stoc", sell: "Vinde-ne", check: "Verificarea", browse: "Vezi bicicletele" },
    hero: {
      eyebrow: "Biciclete second-hand, vândute corect",
      h1: { pre: "O cumpărăm, o reparăm și ne punem ", em: "numele", post: " pe ea." },
      sub: "Biciclete second-hand din toată România, fiecare demontată, reparată și vândută cu acte de proprietate. Vezi lista completă a reparațiilor înainte să plătești.",
      browse: "Vezi bicicletele",
      sell: "Vinde-ne bicicleta ta",
      proof: [
        { b: "Verificată", s: "inspecție tehnică înainte de listare" },
        { b: "Cu acte", s: "transfer de proprietate și factură" },
        { b: "Cu garanție", s: "garanția legală de conformitate" },
      ],
      callouts: [
        { b: "Șa și mânere", s: "verificate, înlocuite la nevoie" },
        { b: "Roți", s: "centrate, spițe verificate" },
        { b: "Frâne", s: "plăcuțe și cabluri" },
        { b: "Anvelope", s: "profil verificat" },
      ],
      caption: "Cadru nr. RO-4471 · verificat în registrul național al bicicletelor furate",
    },
    strip: ["Garanție legală", "Acte de proprietate", "Verificare tehnică", "Livrare în România"],
    check: {
      h2: "Ce verificăm înainte să vezi un preț",
      p: "O bicicletă merită cumpărată doar dacă cineva competent s-a uitat deja la ea. Fiecare stă pe stativ până e gata. Tot ce înlocuim e trecut pe fișa bicicletei și rămâne în contul tău după cumpărare.",
      cards: [
        {
          title: "Siguranță",
          items: ["Plăcuțe și cabluri de frână", "Centrare roți și tensiune spițe", "Profil și flancuri anvelope", "Cuvete direcție și pipă", "Fisuri cadru și furcă"],
        },
        {
          title: "Transmisie",
          items: ["Uzura lanțului", "Pinioane și foi", "Aliniere schimbător", "Joc pedalier", "Indexare viteze"],
        },
        {
          title: "Confort și potrivire",
          items: ["Șa și tijă", "Mânere sau bandă de ghidon", "Pedale și rulmenți", "Lumini și sonerie", "Mărime potrivită cu înălțimea"],
        },
      ],
      papers: {
        title: "Acte",
        p: "Seria cadrului e fotografiată și verificată în registrul național al bicicletelor furate. Primești transferul de proprietate semnat, factura și garanția în cont, ca bicicleta să poată fi asigurată și revândută mai târziu.",
      },
    },
    bikes: {
      h2: "În stoc acum",
      p: "Fiecare bicicletă e unicat. Când s-a vândut, s-a vândut.",
      filters: [
        { key: "all", label: "Toate" },
        { key: "city", label: "Oraș" },
        { key: "mountain", label: "Munte" },
        { key: "road", label: "Cursieră" },
        { key: "cheap", label: "Sub 1000 lei" },
      ],
      legend: "Stare: A: ca nouă · B: uzură cosmetică ușoară · C: uzată vizibil, corectă mecanic",
      specFrame: "cadru",
      specSpeed: "viteze",
      see: "Vezi",
      more: "Vezi toate bicicletele",
      empty: "Nicio bicicletă în acest filtru deocamdată.",
    },
    sell: {
      eyebrow: "Vinde-ne bicicleta ta",
      h2: "Bicicleta din hol are o valoare",
      p: "O luăm în consignație: încercăm să o vindem, iar tu primești o parte convenită din preț. Fără obligații, ți-o dăm înapoi dacă nu se vinde.",
      steps: [
        { n: "Pasul 1", h3: "Trimite câteva poze", p: "Bicicleta întreagă, transmisia, frânele, seria cadrului. Spune-ne ce știi că e stricat. Sinceritatea îți aduce un preț mai bun, nu unul mai prost." },
        { n: "Pasul 2", h3: "Semnăm contractul", p: "Un atelier partener o evaluează și stabilim partea ta. Prețul nu e inventat de noi." },
        { n: "Pasul 3", h3: "O vindem, ești plătit", p: "Când se vinde, primești partea convenită. Dacă nu se vinde în perioada stabilită, ți-o dăm înapoi." },
      ],
      ctaTitle: "Gata să-i dai un al doilea drum?",
      ctaBtn: "Cere o evaluare",
    },
    footer: {
      blurb: "Biciclete second-hand, cumpărate, reparate și vândute în România. Curând e-bike și trotinete.",
      cols: [
        {
          title: "Cumperi",
          links: [
            { label: "Biciclete în stoc", href: "#bikes" },
            { label: "Verificarea", href: "#check" },
            { label: "Formular de retragere", href: "/formular-retragere" },
          ],
        },
        {
          title: "Vinzi",
          links: [
            { label: "Cere o evaluare", href: "#sell" },
            { label: "Cum funcționează", href: "#sell" },
          ],
        },
        {
          title: "Second Cycle",
          links: [
            { label: "Ce facem", href: "/despre" },
            { label: "Date legale", href: "/date-legale" },
            { label: "Termeni și condiții", href: "/termeni" },
            { label: "Confidențialitate", href: "/confidentialitate" },
            { label: "Cookies", href: "/cookies" },
          ],
        },
      ],
      rightsLine: "Toate drepturile rezervate.",
    },
  },
  en: {
    htmlLang: "en",
    nav: { bikes: "Bikes in stock", sell: "Sell us yours", check: "The check", browse: "Browse bikes" },
    hero: {
      eyebrow: "Used bikes, sold properly",
      h1: { pre: "We buy it back, fix it and put ", em: "our name", post: " on it." },
      sub: "Second-hand bikes across Romania, each one stripped down, repaired and sold with ownership papers. You see the full repair list before you pay.",
      browse: "Browse bikes",
      sell: "Sell us your bike",
      proof: [
        { b: "Inspected", s: "a technical check before it is listed" },
        { b: "With papers", s: "transfer of ownership and invoice" },
        { b: "Under warranty", s: "the legal warranty of conformity" },
      ],
      callouts: [
        { b: "Saddle + grips", s: "checked, replaced if needed" },
        { b: "Wheels", s: "trued, spokes checked" },
        { b: "Brakes", s: "pads and cables" },
        { b: "Tyres", s: "tread checked" },
      ],
      caption: "Frame no. RO-4471 · checked against the national stolen-bike registry",
    },
    strip: ["Legal warranty", "Ownership papers", "Technical inspection", "Delivery in Romania"],
    check: {
      h2: "What we check before you see a price",
      p: "A used bike is only worth buying if someone competent has already looked at it. Each one stays on the stand until it is ready. Whatever we replace is on the bike's tag and stays in your account after you buy.",
      cards: [
        {
          title: "Safety",
          items: ["Brake pads and cables", "Wheel true and spoke tension", "Tyre tread and sidewalls", "Headset and stem", "Frame and fork cracks"],
        },
        {
          title: "Drivetrain",
          items: ["Chain wear", "Cassette and chainrings", "Derailleur alignment", "Bottom bracket play", "Gear index"],
        },
        {
          title: "Comfort and fit",
          items: ["Saddle and seatpost", "Grips or bar tape", "Pedals and bearings", "Lights and bell", "Size matched to your height"],
        },
      ],
      papers: {
        title: "Papers",
        p: "The frame number is photographed and run against the national stolen-bike registry. You get a signed transfer of ownership, the invoice and the warranty in your account, so the bike can be insured and resold later.",
      },
    },
    bikes: {
      h2: "In stock now",
      p: "Every bike is one of one. When it is gone, it is gone.",
      filters: [
        { key: "all", label: "All" },
        { key: "city", label: "City" },
        { key: "mountain", label: "Mountain" },
        { key: "road", label: "Road" },
        { key: "cheap", label: "Under 1000 lei" },
      ],
      legend: "Condition: A: as good as new · B: light cosmetic wear · C: visibly used, mechanically sound",
      specFrame: "frame",
      specSpeed: "speed",
      see: "See it",
      more: "See all bikes",
      empty: "No bikes in this filter yet.",
    },
    sell: {
      eyebrow: "Sell us yours",
      h2: "That bike in the hallway is worth money",
      p: "We take it on consignment: we try to sell it and you get an agreed share of the price. No obligation, and we give it back if it does not sell.",
      steps: [
        { n: "Step 1", h3: "Send a few photos", p: "Whole bike, drivetrain, brakes, frame number. Tell us what you know is broken. Honesty gets you a better price, not a worse one." },
        { n: "Step 2", h3: "We sign the contract", p: "A partner workshop values it and we agree your share. The price is not invented by us." },
        { n: "Step 3", h3: "We sell it, you get paid", p: "When it sells, you get your agreed share. If it does not sell within the set period, we give it back." },
      ],
      ctaTitle: "Ready to give it a second ride?",
      ctaBtn: "Get a valuation",
    },
    footer: {
      blurb: "Second-hand bikes, bought, repaired and sold across Romania. E-bikes and scooters soon.",
      cols: [
        {
          title: "Buy",
          links: [
            { label: "Bikes in stock", href: "#bikes" },
            { label: "The check", href: "#check" },
            { label: "Withdrawal form", href: "/formular-retragere" },
          ],
        },
        {
          title: "Sell",
          links: [
            { label: "Get a valuation", href: "#sell" },
            { label: "How it works", href: "#sell" },
          ],
        },
        {
          title: "Second Cycle",
          links: [
            { label: "What we do", href: "/despre" },
            { label: "Company details", href: "/date-legale" },
            { label: "Terms", href: "/termeni" },
            { label: "Privacy", href: "/confidentialitate" },
            { label: "Cookies", href: "/cookies" },
          ],
        },
      ],
      rightsLine: "All rights reserved.",
    },
  },
};
