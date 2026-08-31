import { formatLei } from "@/lib/money";

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
  items: { brand: string; model: string; sku: string; priceCents: number }[];
  totalCents: number;
  link: string;
}) {
  const rows = input.items
    .map(
      (it) =>
        `<tr><td style="padding:7px 0;color:#2b3033">${it.brand} ${it.model} <span style="color:#727a75;font-size:13px">${it.sku}</span></td><td style="padding:7px 0;text-align:right;white-space:nowrap;color:#2b3033">${formatLei(it.priceCents)}</td></tr>`
    )
    .join("");
  const body = `
    <p>Îți mulțumim! Plata pentru comanda <strong>${input.orderNumber}</strong> a fost confirmată.</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0">
      ${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #d9dcd6;font-weight:700">Total</td><td style="padding-top:10px;border-top:1px solid #d9dcd6;text-align:right;font-weight:700">${formatLei(input.totalCents)}</td></tr>
    </table>
    <p>Te contactăm în curând pentru livrare sau ridicare. Poți vedea comanda oricând în contul tău.</p>`;
  return {
    subject: `Comanda ${input.orderNumber} e confirmată | Second Cycle`,
    html: shell("Comandă confirmată", body, { href: input.link, label: "Vezi comanda" }, "Ai întrebări? Răspunde la acest e-mail."),
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
