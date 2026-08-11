import { repairTiers } from "@/lib/content/home";
import { Section, SectionHeader } from "@/components/site/section";

export function RepairTiers() {
  return (
    <Section id={repairTiers.id}>
      <SectionHeader
        eyebrow="La cumpărare"
        title={repairTiers.title}
        intro={repairTiers.intro}
      />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {repairTiers.tiers.map((tier, i) => (
          <div
            key={tier.id}
            className="flex flex-col rounded border border-border bg-card p-6"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-heading text-xl font-semibold tracking-tight">
                {tier.name}
              </h3>
              <span className="font-mono text-xs text-steel" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-blue">{tier.summary}</p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
              {tier.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 font-mono text-sm text-steel">{repairTiers.priceNote}</p>
    </Section>
  );
}
