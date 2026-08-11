import { selling } from "@/lib/content/home";
import { Section, SectionHeader } from "@/components/site/section";
import { StepGrid } from "@/components/site/step-grid";
import { Cta } from "@/components/site/cta";

export function HowSelling() {
  return (
    <Section id={selling.id} tone="ink">
      <SectionHeader
        eyebrow="Consignație"
        title={selling.title}
        intro={selling.intro}
        tone="ink"
      />
      <StepGrid
        steps={selling.steps}
        className="mt-10 [&_li]:border-paper/15 [&_li]:bg-paper/5 [&_h3]:text-paper [&_p]:text-paper/70 [&_span]:text-lime"
      />
      <div className="mt-10 flex flex-col items-start gap-6 rounded border border-paper/15 bg-paper/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-lg text-paper/90">{selling.reassurance}</p>
        <Cta href="#contact" variant="accent" size="md" className="shrink-0">
          Vinde-ne bicicleta ta
        </Cta>
      </div>
    </Section>
  );
}
