"use client";

import { useEffect, useState } from "react";

/** Live "locked for you" countdown to the reservation expiry (ISO string). */
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = target - now;
  if (ms <= 0) {
    return (
      <p className="text-sm text-steel">
        Rezervarea a expirat. Bicicletele au revenit în stoc; reia din coș dacă mai sunt disponibile.
      </p>
    );
  }
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60);
  const ss = String(total % 60).padStart(2, "0");

  return (
    <p className="text-sm text-foreground/70">
      Blocate pentru tine încă{" "}
      <span className="font-mono font-semibold text-foreground tabular-nums">
        {mm}:{ss}
      </span>
      . Finalizează plata până atunci.
    </p>
  );
}
