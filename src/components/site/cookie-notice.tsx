"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "sc_cookie_ack_v1";

/**
 * Slim, non-blocking cookie notice. The site uses only strictly-necessary
 * cookies + functional local storage, so this is an informational notice (no
 * consent gate is legally required for essential cookies) rather than an
 * intrusive accept/reject wall. Shown once, then remembered.
 */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setEnter(true), 40);
    return () => clearTimeout(t);
  }, [show]);

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setEnter(false);
    setTimeout(() => setShow(false), 280);
  }

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Notă despre cookie-uri"
      className={`fixed inset-x-4 bottom-4 z-[70] transition-all duration-300 ease-out sm:inset-x-auto sm:left-6 sm:max-w-sm ${
        enter ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-xl leading-none">
            🍪
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-foreground/85">
              Folosim doar cookie-uri esențiale, pentru autentificare și coșul tău. Nu te urmărim și
              nu folosim cookie-uri de marketing.{" "}
              <Link href="/cookies" className="font-medium text-blue underline-offset-2 hover:underline">
                Detalii
              </Link>
              .
            </p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex h-9 cursor-pointer items-center rounded-full bg-asphalt px-5 text-sm font-semibold text-paper transition-colors hover:bg-asphalt/90"
              >
                Am înțeles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
