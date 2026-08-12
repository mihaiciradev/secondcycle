"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./home.css";
import { messages, bikes, type Locale } from "@/lib/content/home";
import { company } from "@/lib/content/site";

function Logo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M15.99 5.03A15.5 15.5 0 0 1 32.70 28.89" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M24.01 34.97A15.5 15.5 0 0 1 7.30 11.11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M29.83 32.99L36.84 29.95L30.28 25.37Z" fill="currentColor" />
      <path d="M10.17 7.01L3.16 10.05L9.72 14.63Z" fill="currentColor" />
      <circle cx="20" cy="20" r="7.6" stroke="currentColor" strokeWidth="2" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M21.84 18.16L25.37 14.63M18.16 18.16L14.63 14.63M18.16 21.84L14.63 25.37M21.84 21.84L25.37 25.37" />
      </g>
      <circle cx="20" cy="20" r="2.6" fill="#D9F24B" />
    </svg>
  );
}

/**
 * Reusable line-drawn bikes, defined once and referenced with <use>.
 *
 * Stroke/fill are set as INLINE presentation attributes (grouped by stroke
 * width), not CSS classes: CSS classes do not cross into <use> shadow clones,
 * so class-styled symbols paint as solid-black defaults. Inline attributes are
 * copied into the clone and render correctly.
 */
function BikeSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="bike-city" viewBox="0 0 240 140">
        <g fill="none" stroke="#15181B" strokeLinecap="round" strokeLinejoin="round">
          {/* tyres */}
          <g strokeWidth="5">
            <circle cx="52" cy="96" r="34" />
            <circle cx="188" cy="96" r="34" />
          </g>
          {/* rims, spokes, fender, chainstays */}
          <g strokeWidth="1.4" opacity="0.55">
            <circle cx="52" cy="96" r="27" />
            <circle cx="188" cy="96" r="27" />
            <path d="M25 96h54M32.9 76.9l38.2 38.2M52 69v54M32.9 115.1l38.2-38.2" />
            <path d="M161 96h54M168.9 76.9l38.2 38.2M188 69v54M168.9 115.1l38.2-38.2" />
            <path d="M20 80a38 38 0 0 1 64 0" />
            <circle cx="52" cy="96" r="5" />
            <path d="M120 86L52 91M120 106L52 101" />
          </g>
          {/* frame, bars, crank, pedal */}
          <g strokeWidth="3">
            <path d="M52 96h68M52 96l50-54M120 96l-18-54M120 96l40-30M102 42h50M152 44l8 22M158 64l30 32" />
            <path d="M102 42l-4-12M85 30q13-8 26 0M152 44l-2-10M150 34c-4-4-12-4-16 0" />
            <circle cx="120" cy="96" r="10" />
            <path d="M120 96l8 12M123 110l10-4" />
          </g>
          <g fill="#15181B" stroke="none">
            <circle cx="52" cy="96" r="3" />
            <circle cx="188" cy="96" r="3" />
          </g>
        </g>
      </symbol>

      <symbol id="bike-road" viewBox="0 0 240 140">
        <g fill="none" stroke="#15181B" strokeLinecap="round" strokeLinejoin="round">
          {/* thin road tyres */}
          <g strokeWidth="3">
            <circle cx="52" cy="96" r="34" />
            <circle cx="188" cy="96" r="34" />
          </g>
          <g strokeWidth="1.4" opacity="0.55">
            <circle cx="52" cy="96" r="27" />
            <circle cx="188" cy="96" r="27" />
            <path d="M25 96h54M32.9 76.9l38.2 38.2M52 69v54M32.9 115.1l38.2-38.2" />
            <path d="M161 96h54M168.9 76.9l38.2 38.2M188 69v54M168.9 115.1l38.2-38.2" />
            <circle cx="52" cy="96" r="5" />
            <path d="M120 86L52 91M120 106L52 101" />
          </g>
          <g strokeWidth="3">
            <path d="M52 96h68M52 96l52-50M120 96l-16-50M120 96l42-32M104 46h56M160 44l4 20M160 62l28 34" />
            <path d="M104 46l-4-14M87 32q13-8 26 0M160 44v-8M160 36h-14c-6 0-9 5-9 9s4 8 9 6" />
            <circle cx="120" cy="96" r="10" />
            <path d="M120 96l8 12M123 110l10-4" />
          </g>
          <g fill="#15181B" stroke="none">
            <circle cx="52" cy="96" r="3" />
            <circle cx="188" cy="96" r="3" />
          </g>
        </g>
      </symbol>

      <symbol id="bike-mtb" viewBox="0 0 240 140">
        <g fill="none" stroke="#15181B" strokeLinecap="round" strokeLinejoin="round">
          {/* fat tyres */}
          <g strokeWidth="5">
            <circle cx="52" cy="96" r="34" />
            <circle cx="188" cy="96" r="34" />
          </g>
          <g strokeWidth="1.4" opacity="0.55">
            <circle cx="52" cy="96" r="26" />
            <circle cx="188" cy="96" r="26" />
            <path d="M26 96h52M33.6 77.6l36.8 36.8M52 70v52M33.6 114.4l36.8-36.8" />
            <path d="M162 96h52M169.6 77.6l36.8 36.8M188 70v52M169.6 114.4l36.8-36.8" />
            <circle cx="52" cy="96" r="6" />
            <path d="M120 86L52 90M120 106L52 102" />
          </g>
          <g strokeWidth="3">
            <path d="M52 96h68M52 96l50-48M120 96l-18-48M120 96l42-34M102 48h56M158 46l6 18" />
            <path d="M102 48l-6-16M83 32q13-8 26 0M158 46l-2-12M140 34h30" />
            <circle cx="120" cy="96" r="10" />
            <path d="M120 96l8 12M123 110l10-4" />
          </g>
          {/* suspension fork lowers, heavier line */}
          <path d="M162 60l4 14M166 74l22 22" strokeWidth="4" />
          <g fill="#15181B" stroke="none">
            <circle cx="52" cy="96" r="3" />
            <circle cx="188" cy="96" r="3" />
          </g>
        </g>
      </symbol>
    </svg>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Locale>("ro");
  const [filter, setFilter] = useState("all");
  const t = messages[lang];
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);

  // Sticky-nav border on scroll.
  useEffect(() => {
    const nav = rootRef.current?.querySelector(".nav");
    const onScroll = () => nav?.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // One-off reveal on scroll (disabled under reduced motion).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 3, 3) * 70}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const shown = bikes.filter((b) => {
    if (filter === "all") return true;
    if (filter === "cheap") return b.price < 1000;
    return b.category === filter;
  });

  const price = (n: number) => `${n.toLocaleString("ro-RO")} lei`;

  return (
    <div className="home" ref={rootRef}>
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[var(--asphalt)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--paper)]"
      >
        {lang === "ro" ? "Sari la conținut" : "Skip to content"}
      </a>

      <BikeSprite />

      <header className="nav">
        <div className="wrap nav__in">
          <a className="logo" href="#" aria-label="Second Cycle">
            <Logo />
            <span className="logo__w">
              <span>Second</span>
              <b>Cycle</b>
            </span>
          </a>
          <nav className="nav__links" aria-label={lang === "ro" ? "Navigare" : "Navigation"}>
            <a href="#bikes">{t.nav.bikes}</a>
            <a href="#sell">{t.nav.sell}</a>
            <a href="#check">{t.nav.check}</a>
          </nav>
          <div className="nav__end">
            <span className="lang" role="group" aria-label={lang === "ro" ? "Limbă" : "Language"}>
              <button type="button" aria-pressed={lang === "ro"} onClick={() => setLang("ro")}>
                RO
              </button>
              <span aria-hidden="true" style={{ opacity: 0.4 }}>
                /
              </span>
              <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
            </span>
            <a className="btn btn--fill" href="#bikes">
              {t.nav.browse}
            </a>
          </div>
        </div>
      </header>

      <main id="continut">
        {/* Hero */}
        <section className="hero">
          <div className="wrap hero__grid">
            <div>
              <span className="eyebrow mono">{t.hero.eyebrow}</span>
              <h1>
                {t.hero.h1.pre}
                <em>{t.hero.h1.em}</em>
                {t.hero.h1.post}
              </h1>
              <p className="hero__sub">{t.hero.sub}</p>
              <div className="hero__cta">
                <a className="btn btn--fill" href="#bikes">
                  {t.hero.browse}
                </a>
                <a className="btn btn--line" href="#sell">
                  {t.hero.sell}
                </a>
              </div>
              <ul className="hero__proof">
                {t.hero.proof.map((p) => (
                  <li key={p.b}>
                    <b>{p.b}</b>
                    <span>{p.s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="figure">
              <div className="figure__stage">
                <svg
                  viewBox="0 0 760 420"
                  role="img"
                  aria-label={
                    lang === "ro"
                      ? "Bicicletă de oraș recondiționată, cu piesele înlocuite marcate"
                      : "Refurbished city bike with the replaced parts marked"
                  }
                >
                  <g className="grp-bike">
                    <g transform="translate(230,140) scale(1.55)">
                      <use href="#bike-city" width="240" height="140" />
                    </g>
                  </g>
                  <line x1="240" y1="344.6" x2="600" y2="344.6" stroke="var(--asphalt)" strokeWidth="1" opacity=".22" />
                  <polyline className="lead l1" pathLength="1" points="190,118 330,118 380,179" />
                  <polyline className="lead l2" pathLength="1" points="190,340 240,340 265,320" />
                  <polyline className="lead l3" pathLength="1" points="598,140 556,140 514,236" />
                  <polyline className="lead l4" pathLength="1" points="598,340 586,340 569,311" />
                  <circle className="lead-dot d1" cx="382" cy="180" r="3.6" />
                  <circle className="lead-dot d2" cx="267" cy="319" r="3.6" />
                  <circle className="lead-dot d3" cx="512" cy="237" r="3.6" />
                  <circle className="lead-dot d4" cx="569" cy="311" r="3.6" />
                </svg>
                <span className="callout callout--l c1" style={{ top: "28.1%" }}>
                  <b>{t.hero.callouts[0].b}</b>
                  {t.hero.callouts[0].s}
                </span>
                <span className="callout callout--l c2" style={{ top: "81%" }}>
                  <b>{t.hero.callouts[1].b}</b>
                  {t.hero.callouts[1].s}
                </span>
                <span className="callout callout--r c3" style={{ top: "33.3%" }}>
                  <b>{t.hero.callouts[2].b}</b>
                  {t.hero.callouts[2].s}
                </span>
                <span className="callout callout--r c4" style={{ top: "81%" }}>
                  <b>{t.hero.callouts[3].b}</b>
                  {t.hero.callouts[3].s}
                </span>
              </div>
              <p className="figure__cap mono">
                <i></i>
                {t.hero.caption}
              </p>
              <ul className="callouts-m">
                {t.hero.callouts.map((c) => (
                  <li key={c.b}>
                    {c.b}: {c.s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <div className="strip">
          <div className="wrap">
            <ul>
              {t.strip.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* The check */}
        <section className="sec" id="check">
          <div className="wrap">
            <div className="sec__head" data-reveal>
              <h2>{t.check.h2}</h2>
              <p>{t.check.p}</p>
            </div>
            <div className="checks" data-reveal>
              {t.check.cards.map((card) => (
                <div className="check" key={card.title}>
                  <h3>{card.title}</h3>
                  <ul>
                    {card.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="check check--out">
                <h3>{t.check.papers.title}</h3>
                <p>{t.check.papers.p}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bikes */}
        <section className="sec" id="bikes" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec__head" data-reveal>
              <h2>{t.bikes.h2}</h2>
              <p>{t.bikes.p}</p>
            </div>
            <div className="bar" data-reveal>
              {t.bikes.filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className="chip"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="legend mono" data-reveal>
              {t.bikes.legend}
            </p>

            <div className="grid">
              {shown.map((b) => (
                <article className="tag" data-reveal key={b.serial}>
                  <div className="tag__head">
                    <span className="mono">{b.serial}</span>
                    <span className={`grade grade--${b.grade}`}>{b.grade.toUpperCase()}</span>
                  </div>
                  <div className="tag__img">
                    <svg viewBox="0 0 240 140">
                      <use href={`#${b.symbol}`} width="240" height="140" />
                    </svg>
                  </div>
                  <h3>{b.model}</h3>
                  <span className="tag__spec mono">
                    {b.year} · {t.bikes.specFrame} {b.frame} · {b.wheel}&quot; · {b.speed} {t.bikes.specSpeed}
                  </span>
                  <ul className="tag__work">
                    {b.work[lang].map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  <div className="tag__foot">
                    <div className="price">{price(b.price)}</div>
                    <a className="btn btn--line btn--sm" href="#bikes">
                      {t.bikes.see}
                    </a>
                  </div>
                </article>
              ))}
            </div>
            {shown.length === 0 && (
              <p className="legend mono" style={{ marginTop: 24 }}>
                {t.bikes.empty}
              </p>
            )}
            <div className="more">
              <a className="btn btn--line" href="#bikes">
                {t.bikes.more}
              </a>
            </div>
          </div>
        </section>

        {/* Sell */}
        <section className="dark sec" id="sell">
          <div className="wrap">
            <div className="sec__head" data-reveal>
              <div>
                <span className="eyebrow mono">{t.sell.eyebrow}</span>
                <h2 style={{ marginTop: 18 }}>{t.sell.h2}</h2>
              </div>
              <p>{t.sell.p}</p>
            </div>
            <div className="steps" data-reveal>
              {t.sell.steps.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step__n">{s.n}</span>
                  <h3>{s.h3}</h3>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
            <div className="sell-cta" data-reveal>
              <h3>{t.sell.ctaTitle}</h3>
              <a className="btn btn--hivis" href="#sell">
                {t.sell.ctaBtn}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot__top">
            <div>
              <a className="logo" href="#">
                <Logo />
                <span className="logo__w">
                  <span>Second</span>
                  <b>Cycle</b>
                </span>
              </a>
              <p className="foot__blurb">{t.footer.blurb}</p>
            </div>
            {t.footer.cols.map((col) => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link href={l.href}>{l.label}</Link>
                      ) : (
                        <a href={l.href}>{l.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="foot__bot">
            <span className="mono">
              {company.legal.entityName} · {company.legal.cui} · {company.legal.tradeRegister} ·{" "}
              {company.contact.email} · {company.contact.phone}
            </span>
            <span>
              © {new Date().getFullYear()} {company.name} · {t.footer.rightsLine}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
