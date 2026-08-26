/**
 * Brand logo. The SVGs are pre-coloured for a specific background, so pick the
 * tone that matches the surface it sits on:
 *   light → on Paper / white     dark → on Asphalt     lime → on Hi-Vis
 *
 * `variant="lockup"` is the landscape logo with the wordmark; `variant="mark"`
 * is the square icon only. Plain <img> (SVGs are static assets) with intrinsic
 * dimensions set so there is no layout shift on load.
 */
type Tone = "light" | "dark" | "lime";
type Variant = "lockup" | "mark";

const LOCKUP: Record<Tone, { src: string; w: number; h: number }> = {
  light: { src: "/logos/logo_with_text_on_white.svg", w: 1086, h: 488 },
  dark: { src: "/logos/logo_with_text_on_asphalt.svg", w: 1109, h: 488 },
  lime: { src: "/logos/logo_with_text_on_yellow.svg", w: 1109, h: 488 },
};

const MARK: Record<Tone, { src: string; w: number; h: number }> = {
  light: { src: "/logos/logo_on_white.svg", w: 346, h: 363 },
  dark: { src: "/logos/logo_on_asphalt.svg", w: 346, h: 363 },
  lime: { src: "/logos/logo_on_yellow.svg", w: 346, h: 363 },
};

export function BrandLogo({
  tone = "light",
  variant = "lockup",
  height = 32,
  className,
  priority = false,
}: {
  tone?: Tone;
  variant?: Variant;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const meta = variant === "lockup" ? LOCKUP[tone] : MARK[tone];
  const width = Math.round((height * meta.w) / meta.h);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no optimization needed
    <img
      src={meta.src}
      alt="Second Cycle"
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
