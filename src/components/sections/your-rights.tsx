import Link from "next/link";
import { rights } from "@/lib/content/home";
import { Section, SectionHeader } from "@/components/site/section";

function Points({ points }: { points: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {points.map((p) => (
        <li key={p} className="flex gap-2.5 text-[0.95rem] leading-relaxed text-foreground/80">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

export function YourRights() {
  return (
    <Section id={rights.id}>
      <SectionHeader eyebrow="Drepturile tale" title={rights.title} intro={rights.intro} />

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {/* Withdrawal, 14 days. A separate heading, never merged with warranty. */}
        <div className="flex flex-col rounded border border-border bg-card p-6">
          <span className="w-fit rounded bg-lime px-2 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-asphalt">
            14 zile
          </span>
          <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
            {rights.withdrawal.title}
          </h3>
          <p className="mt-2 text-lg text-steel">{rights.withdrawal.lead}</p>
          <Points points={rights.withdrawal.points} />
          <div className="mt-6 border-t border-border pt-5">
            <Link
              href={rights.withdrawal.formHref}
              className="inline-flex items-center gap-2 rounded-full border border-asphalt/20 px-5 h-10 text-sm font-medium transition-colors hover:bg-asphalt/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {rights.withdrawal.formLabel}
            </Link>
            <p className="mt-3 text-sm text-steel">{rights.withdrawal.formNote}</p>
          </div>
        </div>

        {/* Warranty. Different thing, different heading. No period stated. */}
        <div className="flex flex-col rounded border border-border bg-card p-6">
          <span className="w-fit rounded bg-blue px-2 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-white">
            La un defect
          </span>
          <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
            {rights.warranty.title}
          </h3>
          <p className="mt-2 text-lg text-steel">{rights.warranty.lead}</p>
          <Points points={rights.warranty.points} />
        </div>
      </div>
    </Section>
  );
}
