import { inspection } from "@/lib/content/home";
import { Section, SectionHeader } from "@/components/site/section";

export function Inspection() {
  return (
    <Section id={inspection.id}>
      <SectionHeader
        eyebrow="Verificare tehnică"
        title={inspection.title}
        intro={inspection.intro}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inspection.groups.map((group) => (
          <div key={group.title} className="rounded border border-border bg-card p-5">
            <h3 className="font-heading text-base font-semibold tracking-tight">
              {group.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 font-mono text-sm text-foreground/80"
                >
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-2xl border-l-2 border-lime pl-4 text-lg text-foreground/80">
        {inspection.note}
      </p>
    </Section>
  );
}
