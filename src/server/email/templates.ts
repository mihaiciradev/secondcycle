import { formatLei } from "@/lib/money";
import { company } from "@/lib/content/site";
import { techSheetEntries, type TechSheet } from "@/lib/tech-sheet";

/** Escape user/DB text before putting it into email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal branded transactional emails. Plain, documentation voice. */
function shell(
  title: string,
  body: string,
  cta: { href: string; label: string },
  footer = "Dacă nu ai cerut acest e-mail, îl poți ignora."
): string {
  return `<!doctype html><html lang="ro"><body style="margin:0;background:#edefea;font-family:Arial,Helvetica,sans-serif;color:#15181b">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <p style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#727a75;margin:0 0 16px">Second Cycle</p>
    <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#2b3033">${body}</div>
    <p style="margin:28px 0">
      <a href="${cta.href}" style="display:inline-block;background:#0c4da2;color:#fff;text-decoration:none;padding:12px 22px;border-radius:99px;font-weight:600">${cta.label}</a>
    </p>
    <p style="font-size:13px;color:#727a75">${footer}</p>
  </div></body></html>`;
}

export function verifyEmailTemplate(link: string) {
  return {
    subject: "Confirmă adresa de e-mail | Second Cycle",
    html: shell(
      "Confirmă adresa de e-mail",
      "<p>Bine ai venit. Confirmă adresa de e-mail ca să îți activezi contul Second Cycle.</p>",
      { href: link, label: "Confirmă adresa" }
    ),
  };
}

export function passwordResetTemplate(link: string) {
  return {
    subject: "Resetare parolă | Second Cycle",
    html: shell(
      "Resetare parolă",
      "<p>Ai cerut resetarea parolei. Linkul este valabil o oră.</p>",
      { href: link, label: "Setează o parolă nouă" }
    ),
  };
}

export function orderConfirmedTemplate(input: {
  orderNumber: string;
  items: {
    title: string;
    sku: string;
    priceCents: number;
    warrantyMonths: number | null;
    techSheet: TechSheet | null;
  }[];
  totalCents: number;
  link: string;
  withdrawalLink: string;
}) {
  const rows = input.items
    .map(
      (it) =>
        `<tr><td style="padding:7px 0;color:#2b3033">${esc(it.title)} <span style="color:#727a75;font-size:13px">${esc(it.sku)}</span></td><td style="padding:7px 0;text-align:right;white-space:nowrap;color:#2b3033">${formatLei(it.priceCents)}</td></tr>`
    )
    .join("");

  // Certificat de garanție: perioada + fișa tehnică (snapshot din comandă).
  const certs = input.items
    .map((it) => {
      const entries = techSheetEntries(it.techSheet)
        .map(
          (e) =>
            `<tr><td style="padding:3px 10px 3px 0;color:#727a75;font-size:12px;vertical-align:top;white-space:nowrap">${esc(e.label)}</td><td style="padding:3px 0;color:#2b3033;font-size:13px">${esc(e.value)}</td></tr>`
        )
        .join("");
      return `<div style="border:1px solid #d9dcd6;border-radius:8px;padding:14px 16px;margin:10px 0">
        <p style="margin:0;font-weight:700">${esc(it.title)} <span style="color:#727a75;font-weight:400;font-size:13px">${esc(it.sku)}</span></p>
        <p style="margin:4px 0 0;font-size:13px;color:#2b3033">Garanție legală de conformitate: <strong>${it.warrantyMonths ?? 12} luni</strong> (produs second-hand).</p>
        ${entries ? `<table style="width:100%;border-collapse:collapse;margin-top:8px">${entries}</table>` : ""}
      </div>`;
    })
    .join("");

  const body = `
    <p>Îți mulțumim! Plata pentru comanda <strong>${esc(input.orderNumber)}</strong> a fost confirmată.</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0">
      ${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #d9dcd6;font-weight:700">Total</td><td style="padding-top:10px;border-top:1px solid #d9dcd6;text-align:right;font-weight:700">${formatLei(input.totalCents)}</td></tr>
    </table>
    <p>Te contactăm în curând pentru livrare sau ridicare. Poți vedea comanda oricând în contul tău.</p>

    <h2 style="font-size:17px;margin:26px 0 6px">Certificat de garanție</h2>
    ${certs}

    <h2 style="font-size:17px;margin:26px 0 6px">Drept de retragere (14 zile)</h2>
    <p style="font-size:14px;line-height:1.6;color:#2b3033;margin:0 0 8px">
      Fiind o achiziție la distanță, te poți retrage din contract în 14 zile de la primirea
      bicicletei, fără să dai un motiv. Formularul de retragere pentru comanda ta:
    </p>
    <p style="margin:0 0 4px">
      <a href="${input.withdrawalLink}" style="color:#0c4da2">Deschide formularul de retragere</a>
    </p>`;
  return {
    subject: `Comanda ${input.orderNumber} e confirmată | Second Cycle`,
    html: shell(
      "Comandă confirmată",
      body,
      { href: input.link, label: "Vezi comanda" },
      `Ai întrebări? Scrie-ne la ${company.contact.inboxEmail}.`
    ),
  };
}

export function returnRequestTemplate(input: {
  items: { brand: string; model: string; sku: string; orderNumber: string }[];
  reason: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  link: string;
}) {
  const rows = input.items
    .map(
      (it) =>
        `<tr><td style="padding:7px 0;color:#2b3033">${it.brand} ${it.model} <span style="color:#727a75;font-size:13px">${it.sku}</span></td><td style="padding:7px 0;text-align:right;white-space:nowrap;color:#727a75;font-size:13px">${it.orderNumber}</td></tr>`
    )
    .join("");
  const body = `
    <p>Un client a cerut retragerea din contract (retur) pentru:</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0">${rows}</table>
    <p><strong>Client:</strong> ${input.contactName}<br>
    <strong>E-mail:</strong> ${input.contactEmail}${input.contactPhone ? `<br><strong>Telefon:</strong> ${input.contactPhone}` : ""}</p>
    <p><strong>Motiv:</strong> ${input.reason ? input.reason : "(niciunul, nu este obligatoriu)"}</p>
    <p>Termenul legal de rambursare este de 14 zile de la anunț. Tratează cererea în panou.</p>`;
  return {
    subject: `Cerere de retur | Second Cycle`,
    html: shell(
      "Cerere de retur",
      body,
      { href: input.link, label: "Vezi în panou" },
      "E-mail intern, generat automat de site."
    ),
  };
}

export function prebookRequestTemplate(input: {
  bikeLabel: string;
  bikeSku: string;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  link: string;
}) {
  const body = `
    <p>Cineva a făcut un <strong>prebook</strong> pentru:</p>
    <p style="font-size:16px;margin:10px 0"><strong>${input.bikeLabel}</strong>
      <span style="color:#727a75;font-size:13px">${input.bikeSku}</span></p>
    <p><strong>Client:</strong> ${input.name}<br>
    <strong>E-mail:</strong> ${input.email}${input.phone ? `<br><strong>Telefon:</strong> ${input.phone}` : ""}</p>
    ${input.note ? `<p><strong>Mesaj:</strong> ${input.note}</p>` : ""}
    <p>Contacteaz-o persoana ca sa finalizati vanzarea. Bicicleta NU este blocata.</p>`;
  return {
    subject: `Prebook: ${input.bikeLabel} | Second Cycle`,
    html: shell(
      "Prebook nou",
      body,
      { href: input.link, label: "Vezi în panou" },
      "E-mail intern, generat automat de site."
    ),
  };
}

export function bikeAvailableTemplate(input: {
  bikeLabel: string;
  link: string;
}) {
  return {
    subject: `Din nou disponibilă: ${input.bikeLabel} | Second Cycle`,
    html: shell(
      "Bicicleta e din nou disponibilă",
      `<p><strong>${input.bikeLabel}</strong> pe care o urmăreai s-a eliberat și poate fi cumpărată acum. Fiind unicat, primul care finalizează comanda o ia.</p>`,
      { href: input.link, label: "Vezi bicicleta" }
    ),
  };
}
