import { buying } from "@/lib/content/home";
import { Section, SectionHeader } from "@/components/site/section";
import { StepGrid } from "@/components/site/step-grid";

export function HowBuying() {
  return (
    <Section id={buying.id}>
      <SectionHeader eyebrow="Cum cumperi" title={buying.title} intro={buying.intro} />
      <StepGrid steps={buying.steps} className="mt-10" />
    </Section>
  );
}
