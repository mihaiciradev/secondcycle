import { BrandLogo } from "./brand-logo";

/**
 * Full-screen branded loading state: the mark inside a spinning ring (a nod to
 * a turning wheel), on the Paper background. Motion is disabled under
 * prefers-reduced-motion.
 */
export function BrandLoader({ label = "Se încarcă" }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-paper"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid size-24 place-items-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-blue/15 border-t-blue animate-spin motion-reduce:animate-none"
          />
          <BrandLogo variant="mark" tone="light" height={44} priority className="motion-safe:animate-pulse" />
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-steel">{label}</span>
      </div>
    </div>
  );
}
