/**
 * Business-model diagram for the About page. A single static SVG that explains,
 * at a glance, the consignment lifecycle and the one fact that matters most:
 * Second Cycle is the seller, not a marketplace.
 *
 * Wrapped in an overflow-x container so it scrolls on narrow screens instead of
 * shrinking to unreadable. No motion.
 */
export function ModelDiagram() {
  const sans = "var(--font-plex-sans)";
  const mono = "var(--font-plex-mono)";
  const asphalt = "#15181b";
  const blue = "#0c4da2";
  const lime = "#d9f24b";
  const steel = "#727a75";
  const border = "#d5d8cf";

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 960 520"
        role="img"
        aria-labelledby="model-title model-desc"
        className="h-auto w-full min-w-[720px]"
      >
        <title id="model-title">Modelul Second Cycle</title>
        <desc id="model-desc">
          Proprietarul aduce bicicleta în consignație. Un atelier partener o
          evaluează. Second Cycle o listează, o vinde în nume propriu,
          cumpărătorul alege un nivel de reparație și plătește, apoi bicicleta
          este reparată și predată cu proces-verbal.
        </desc>

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L7,3 L0,6 Z" fill={steel} />
          </marker>
        </defs>

        {/* Inputs on the left */}
        <g fontFamily={sans}>
          {/* Owner */}
          <rect x="20" y="90" width="220" height="96" rx="4" fill="#fff" stroke={border} />
          <text x="40" y="122" fontFamily={mono} fontSize="12" fill={steel}>
            INTRARE
          </text>
          <text x="40" y="148" fontSize="17" fontWeight="600" fill={asphalt}>
            Proprietarul
          </text>
          <text x="40" y="170" fontSize="14" fill={asphalt} opacity="0.75">
            aduce bicicleta
          </text>

          {/* Workshop */}
          <rect x="20" y="334" width="220" height="96" rx="4" fill="#fff" stroke={border} />
          <text x="40" y="366" fontFamily={mono} fontSize="12" fill={steel}>
            EVALUARE
          </text>
          <text x="40" y="392" fontSize="17" fontWeight="600" fill={asphalt}>
            Atelier partener
          </text>
          <text x="40" y="414" fontSize="14" fill={asphalt} opacity="0.75">
            stabilește prețul corect
          </text>
        </g>

        {/* Arrows from inputs into the hub */}
        <path d="M240,138 C300,138 300,230 330,240" fill="none" stroke={steel} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M240,382 C300,382 300,290 330,280" fill="none" stroke={steel} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <text x="250" y="180" fontFamily={mono} fontSize="12" fill={steel}>
          consignație
        </text>

        {/* The hub: Second Cycle, the seller */}
        <g fontFamily={sans}>
          <rect x="330" y="160" width="300" height="200" rx="6" fill={blue} />
          <text x="356" y="204" fontFamily={mono} fontSize="12" fill="#fff" opacity="0.8">
            VÂNZĂTORUL
          </text>
          <text x="356" y="238" fontSize="26" fontWeight="700" fill="#fff">
            Second Cycle
          </text>
          <text x="356" y="270" fontSize="14" fill="#fff" opacity="0.9">
            Cumpără, repară și vinde
          </text>
          <text x="356" y="290" fontSize="14" fill="#fff" opacity="0.9">
            în nume propriu.
          </text>
          {/* Lime callout: not a marketplace */}
          <rect x="356" y="308" width="232" height="34" rx="4" fill={lime} />
          <text x="372" y="330" fontSize="13" fontWeight="600" fill={asphalt}>
            Nu e un marketplace.
          </text>
        </g>

        {/* Output pipeline on the right */}
        <g fontFamily={sans}>
          {[
            { n: "01", t: "Listare", s: "serial, notă de condiție, seria verificată" },
            { n: "02", t: "Cumpărătorul plătește", s: "alege nivelul de reparație, plătește cu cardul" },
            { n: "03", t: "Reparație și predare", s: "reparăm, apoi predăm cu proces-verbal" },
          ].map((step, i) => {
            const y = 40 + i * 150;
            return (
              <g key={step.n}>
                <rect x="720" y={y} width="220" height="110" rx="4" fill="#fff" stroke={border} />
                <text x="740" y={y + 30} fontFamily={mono} fontSize="12" fill={blue}>
                  {step.n}
                </text>
                <text x="740" y={y + 56} fontSize="16" fontWeight="600" fill={asphalt}>
                  {step.t}
                </text>
                <text x="740" y={y + 80} fontSize="13" fill={asphalt} opacity="0.72">
                  <tspan x="740" dy="0">{step.s}</tspan>
                </text>
              </g>
            );
          })}
        </g>

        {/* Arrows: hub to step 1, then down the pipeline */}
        <path d="M630,240 C670,220 680,150 720,110" fill="none" stroke={steel} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M830,150 L830,185" fill="none" stroke={steel} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M830,300 L830,335" fill="none" stroke={steel} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
      </svg>
    </div>
  );
}
