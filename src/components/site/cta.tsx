import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Call-to-action link styled as a full pill (the one brand exception to the
 * 4px radius). Rendered as an anchor for correct semantics and keyboard use.
 */
const styles = {
  base: "inline-flex items-center justify-center rounded-full border px-6 text-[0.95rem] font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
  size: {
    md: "h-11",
    lg: "h-12 px-7 text-base",
  },
  variant: {
    primary: "border-transparent bg-blue text-white hover:bg-blue/90",
    // Lime is a solid shape carrying dark text, never text-on-light lime.
    accent: "border-transparent bg-lime text-asphalt hover:brightness-95",
    outline: "border-asphalt/20 bg-transparent text-foreground hover:bg-asphalt/5",
    ghostOnInk: "border-paper/25 bg-transparent text-paper hover:bg-paper/10",
  },
} as const;

export function Cta({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof styles.variant;
  size?: keyof typeof styles.size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(styles.base, styles.size[size], styles.variant[variant], className)}
    >
      {children}
    </Link>
  );
}
