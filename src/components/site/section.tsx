import { cn } from "@/lib/utils";

/** Consistent page container width and gutters. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Section({
  id,
  className,
  children,
  tone = "paper",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "paper" | "ink";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-16 sm:py-24",
        tone === "ink" && "bg-asphalt text-paper",
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** A monospace kicker, the "documentation voice" for machine-readable labels. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.14em] text-steel",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  className,
  tone = "paper",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
  tone?: "paper" | "ink";
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            tone === "ink" ? "text-paper/80" : "text-foreground/80"
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
