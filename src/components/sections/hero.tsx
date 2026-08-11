import { hero } from "@/lib/content/home";
import { Container, Eyebrow } from "@/components/site/section";
import { Cta } from "@/components/site/cta";

/**
 * Sample service tag. Manila is reserved exclusively for bike service tags.
 * This shows the format every bike carries, captioned as an example so it
 * reads as documentation, not as a live listing or stock claim.
 */
function ServiceTagSample() {
  return (
    <figure className="w-full max-w-sm">
      <div className="rounded border border-asphalt/15 bg-manila p-5 text-asphalt shadow-none">
        <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.18em]">
          <span>Second Cycle</span>
          <span>Fișă</span>
        </div>
        <p className="mt-4 font-mono text-3xl font-semibold tracking-tight">RO-4471</p>
        <dl className="mt-5 space-y-2 font-mono text-sm">
          <div className="flex justify-between gap-4 border-t border-asphalt/15 pt-2">
            <dt className="text-asphalt/60">Mărime cadru</dt>
            <dd>M / 54</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-asphalt/15 pt-2">
            <dt className="text-asphalt/60">Notă de condiție</dt>
            <dd>B</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-asphalt/15 pt-2">
            <dt className="text-asphalt/60">Seria cadrului</dt>
            <dd>verificată</dd>
          </div>
        </dl>
      </div>
      <figcaption className="mt-3 text-sm text-steel">
        Așa arată fișa fiecărei biciclete. Fiecare e unicat, cu serial propriu.
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section className="border-b border-border/80 py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/80">
            {hero.body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Cta href={hero.primaryCta.href} variant="primary" size="lg">
              {hero.primaryCta.label}
            </Cta>
            <Cta href={hero.secondaryCta.href} variant="outline" size="lg">
              {hero.secondaryCta.label}
            </Cta>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <ServiceTagSample />
        </div>
      </Container>
    </section>
  );
}
