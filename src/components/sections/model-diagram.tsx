import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Business-model diagram for the About page.
 *
 * Built as HTML/CSS (not hand-plotted SVG) so it stays legible and responsive:
 * a left-to-right five-step lifecycle, anchored by a line-drawn bike, with the
 * one fact that matters made unmissable — Second Cycle is the seller throughout,
 * not a marketplace.
 */

const steps = [
  {
    t: "Proprietarul aduce bicicleta",
    d: "În consignație: încercăm să o vindem pentru el, cu o parte convenită din preț.",
  },
  {
    t: "Un atelier partener o evaluează",
    d: "Un preț corect de piață, garantat de atelier.",
  },
  {
    t: "O listăm",
    d: "Serial propriu, notă de condiție și seria cadrului verificată în registru.",
  },
  {
    t: "Cumpărătorul plătește",
    d: "Plătește online prețul afișat. Banii intră în contul Second Cycle.",
  },
  {
    t: "Reparăm și predăm",
    d: "O reparăm, îi punem acte și garanție, apoi o predăm cu proces-verbal.",
  },
];

function BikeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      className={className}
      fill="none"
      stroke="#15181B"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* tyres */}
      <g strokeWidth="5">
        <circle cx="52" cy="96" r="34" />
        <circle cx="188" cy="96" r="34" />
      </g>
      {/* rims, spokes, fender, chainstays */}
      <g strokeWidth="1.4" opacity="0.55">
        <circle cx="52" cy="96" r="27" />
        <circle cx="188" cy="96" r="27" />
        <path d="M25 96h54M32.9 76.9l38.2 38.2M52 69v54M32.9 115.1l38.2-38.2" />
        <path d="M161 96h54M168.9 76.9l38.2 38.2M188 69v54M168.9 115.1l38.2-38.2" />
        <path d="M20 80a38 38 0 0 1 64 0" />
        <circle cx="52" cy="96" r="5" />
        <path d="M120 86L52 91M120 106L52 101" />
      </g>
      {/* frame, bars, crank, pedal */}
      <g strokeWidth="3">
        <path d="M52 96h68M52 96l50-54M120 96l-18-54M120 96l40-30M102 42h50M152 44l8 22M158 64l30 32" />
        <path d="M102 42l-4-12M85 30q13-8 26 0M152 44l-2-10M150 34c-4-4-12-4-16 0" />
        <circle cx="120" cy="96" r="10" />
        <path d="M120 96l8 12M123 110l10-4" />
      </g>
      {/* hubs */}
      <g fill="#15181B" stroke="none">
        <circle cx="52" cy="96" r="3" />
        <circle cx="188" cy="96" r="3" />
      </g>
    </svg>
  );
}

export function ModelDiagram() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <BikeGlyph className="h-auto w-24 shrink-0 sm:w-28" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
            Ciclul unei biciclete
          </p>
          <p className="mt-1 max-w-md text-sm text-foreground/75">
            De la proprietar până la cumpărător, cu noi ca vânzător pe tot parcursul.
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch">
        {steps.map((s, i) => (
          <Fragment key={s.t}>
            <li className="flex flex-1 flex-col rounded border border-border bg-paper p-4">
              <span className="font-mono text-xs font-medium text-blue">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-heading text-[15px] font-semibold leading-tight tracking-tight">
                {s.t}
              </h3>
              <p className="mt-1.5 text-[13px] leading-snug text-foreground/70">{s.d}</p>
            </li>
            {i < steps.length - 1 && (
              <div className="flex items-center justify-center text-steel" aria-hidden="true">
                <ChevronRight className="h-5 w-5 rotate-90 md:rotate-0" />
              </div>
            )}
          </Fragment>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded bg-blue p-5 text-white">
        <p className="max-w-2xl text-[15px] leading-relaxed">
          Pe tot parcursul, Second Cycle e vânzătorul: emite factura, semnează
          contractul și răspunde față de cumpărător.
        </p>
        <span className="rounded bg-lime px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-asphalt">
          Nu e un marketplace
        </span>
      </div>
    </div>
  );
}
