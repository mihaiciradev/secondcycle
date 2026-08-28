import type { ReactNode } from "react";

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{children}</h2>
      {hint ? <span className="font-mono text-xs text-steel">{hint}</span> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "accent" | "warn";
}) {
  const ring =
    tone === "accent"
      ? "border-blue/30 bg-blue/[0.04]"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/[0.06]"
        : "border-border bg-card";
  return (
    <div className={`rounded-xl border ${ring} p-4`}>
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-xs text-steel">{sub}</p> : null}
    </div>
  );
}

/** A labelled usage bar (used / limit) for free-tier tracking. */
export function UsageBar({
  label,
  used,
  limit,
  unit,
  format,
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  format?: (n: number) => string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const fmt = format ?? ((n: number) => n.toLocaleString("ro-RO"));
  const bar = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-foreground/80">{label}</span>
        <span className="font-mono text-xs text-steel">
          {fmt(used)} / {fmt(limit)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-asphalt/10">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Horizontal monthly bars scaled to the series max. */
export function MiniBars({
  data,
  format,
}: {
  data: { label: string; value: number; caption?: string }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = format ?? ((n: number) => String(n));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-xs text-steel">{d.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-asphalt/[0.06]">
            <div
              className="flex h-full items-center justify-end rounded bg-blue/80 px-2"
              style={{ width: `${Math.max(6, (d.value / max) * 100)}%` }}
            >
              <span className="font-mono text-[0.65rem] font-medium text-white">
                {d.caption ?? fmt(d.value)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Last 6 month buckets (oldest→newest) from a YYYY-MM series, gaps filled 0. */
export function lastSixMonths(series: { month: string; cents: number; n: number }[]) {
  const map = new Map(series.map((s) => [s.month, s]));
  const out: { label: string; cents: number; n: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const hit = map.get(key);
    out.push({
      label: d.toLocaleDateString("ro-RO", { month: "short" }),
      cents: hit?.cents ?? 0,
      n: hit?.n ?? 0,
    });
  }
  return out;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
