import { cn } from "@/lib/utils";

export interface Step {
  k: string;
  title: string;
  body: string;
}

/** Numbered steps as documentation records, mono index, plain description. */
export function StepGrid({
  steps,
  className,
}: {
  steps: readonly Step[];
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {steps.map((step) => (
        <li
          key={step.k}
          className="flex flex-col rounded border border-border bg-card p-5"
        >
          <span className="font-mono text-sm text-blue" aria-hidden="true">
            {step.k}
          </span>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
