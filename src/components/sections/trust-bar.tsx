import { trustBar } from "@/lib/content/home";
import { Container } from "@/components/site/section";

/**
 * Static trust strip. No motion of any kind, it wraps on narrow screens
 * rather than scrolling. A previous ticker version was rejected: motion that
 * carries information is a defect here.
 */
export function TrustBar() {
  return (
    <div className="border-b border-border/80 bg-card">
      <Container className="py-6">
        <ul className="flex flex-wrap gap-x-10 gap-y-5">
          {trustBar.map((item) => (
            <li key={item.label} className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {item.label}
              </span>
              <span className="text-sm text-steel">{item.detail}</span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
