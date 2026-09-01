"use client";

import { useCallback, useEffect, useState } from "react";

export function BikeGallery({
  photos,
  alt,
  sku,
}: {
  photos: string[];
  alt: string;
  sku: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const count = photos.length;

  const go = useCallback(
    (dir: number) => {
      if (count === 0) return;
      setZoom(false);
      setActive((i) => (i + dir + count) % count);
    },
    [count]
  );

  // Keyboard nav while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    // Lock body scroll behind the overlay.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  // Touch swipe (main image and lightbox).
  const [touchX, setTouchX] = useState<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    setTouchX(e.changedTouches[0]?.clientX ?? null);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    setTouchX(null);
  }

  if (count === 0) {
    return (
      <div className="overflow-hidden rounded border border-border bg-manila/40">
        <div className="flex aspect-[4/3] items-center justify-center font-mono text-lg text-asphalt/40">
          {sku}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label="Mărește imaginea"
        className="group block w-full cursor-zoom-in overflow-hidden rounded border border-border bg-manila/40"
      >
        <div className="aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[active]}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      </button>

      {/* Thumbnails */}
      {count > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Imaginea ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded border transition-colors ${
                i === active ? "border-asphalt" : "border-border hover:border-asphalt/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Închide"
            className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            ✕
          </button>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Imaginea anterioară"
                className="absolute left-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Imaginea următoare"
                className="absolute right-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20"
              >
                ›
              </button>
            </>
          ) : null}

          <div
            className="max-h-full max-w-6xl overflow-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[active]}
              alt={alt}
              onClick={() => setZoom((z) => !z)}
              className={`mx-auto max-h-[86vh] w-auto select-none object-contain transition-transform duration-200 ${
                zoom ? "scale-[1.8] cursor-zoom-out" : "cursor-zoom-in"
              }`}
            />
          </div>

          {count > 1 ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white">
              {active + 1} / {count}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
