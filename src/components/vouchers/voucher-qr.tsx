"use client";

import { useEffect, useState } from "react";

/** Render the voucher code as a QR the partner can scan. Lazy-loads qrcode. */
export function VoucherQr({ code, size = 132 }: { code: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    import("qrcode")
      .then((m) => m.toDataURL(code, { margin: 1, width: size * 2 }))
      .then((url) => {
        if (alive) setSrc(url);
      })
      .catch(() => {
        /* QR is a convenience; the printed code still works */
      });
    return () => {
      alive = false;
    };
  }, [code, size]);

  return (
    <div
      className="flex items-center justify-center rounded-lg border border-border bg-white p-2"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Cod ${code}`} width={size - 16} height={size - 16} />
      ) : (
        <span className="font-mono text-[0.6rem] text-steel">QR…</span>
      )}
    </div>
  );
}
