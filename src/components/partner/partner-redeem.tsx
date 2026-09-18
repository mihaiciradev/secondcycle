"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { redeemVoucherAction } from "@/server/actions/partner/vouchers";
import { fieldClass } from "@/components/auth/auth-shell";

type ScanState = "idle" | "starting" | "scanning" | "unsupported";

export function PartnerRedeem() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const [scan, setScan] = useState<ScanState>("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  async function submit(rawCode: string) {
    const value = rawCode.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    setDone(null);
    const res = await redeemVoucherAction({ code: value });
    setLoading(false);
    if (res.ok) {
      setDone(`„${res.title}” marcat ca folosit.`);
      setCode("");
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScan("idle");
  }

  // Clean up the camera when the component unmounts.
  useEffect(() => () => stopCamera(), []);

  async function startCamera() {
    // BarcodeDetector is the zero-dependency path (Android Chrome, desktop
    // Chromium). Unsupported browsers (e.g. iOS Safari) fall back to typing.
    const Detector = (window as unknown as { BarcodeDetector?: new (o?: unknown) => { detect: (s: unknown) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setScan("unsupported");
      return;
    }
    setScan("starting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScan("scanning");
      const detector = new Detector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes[0]?.rawValue) {
            const found = codes[0].rawValue;
            stopCamera();
            setCode(found);
            submit(found);
            return;
          }
        } catch {
          /* transient detect error; keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Nu am putut porni camera. Scrie codul manual.");
      stopCamera();
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold tracking-tight">Scanează un voucher</h2>
      <p className="mt-1 text-sm text-steel">
        Scanează codul QR sau scrie codul de pe voucher, apoi marchează-l ca folosit.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(code);
        }}
        className="mt-4 flex flex-wrap gap-2"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SC-XXXX-XXXX"
          className={`${fieldClass} flex-1 font-mono uppercase`}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full bg-asphalt px-5 text-sm font-semibold text-paper transition-colors hover:bg-asphalt/90 disabled:opacity-60"
        >
          {loading ? "Se marchează…" : "Marchează folosit"}
        </button>
        <button
          type="button"
          onClick={scan === "idle" || scan === "unsupported" ? startCamera : stopCamera}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full border border-asphalt/25 px-4 text-sm font-medium text-foreground transition-colors hover:border-asphalt/50"
        >
          {scan === "scanning" || scan === "starting" ? "Oprește camera" : "Scanează cu camera"}
        </button>
      </form>

      {scan === "unsupported" ? (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          Scanarea cu camera nu e suportată pe acest browser. Scrie codul manual (merge oricând).
        </p>
      ) : null}

      {scan === "starting" || scan === "scanning" ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} className="mx-auto max-h-72 w-full object-contain" playsInline muted />
        </div>
      ) : null}

      {done ? (
        <p className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.08] px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {done}
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
