export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="font-mono text-xs uppercase tracking-[0.1em] text-steel">{label}</dt>
      <dd className="text-right text-sm text-foreground/90">{children}</dd>
    </div>
  );
}
