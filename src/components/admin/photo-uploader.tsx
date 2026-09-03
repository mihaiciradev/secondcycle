"use client";

import { useRef, useState } from "react";
import {
  attachPhotosAction,
  deletePhotoAction,
  requestPhotoUploadsAction,
  setCoverPhotoAction,
} from "@/server/actions/admin/photos";

type Photo = { key: string; url: string };

export function PhotoUploader({
  bikeId,
  initial,
  storageEnabled,
}: {
  bikeId: string;
  initial: Photo[];
  storageEnabled: boolean;
}) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!storageEnabled) {
    return (
      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
        Stocarea foto (R2) nu e configurată în acest mediu. Completează variabilele R2_* ca să poți
        încărca poze.
      </div>
    );
  }

  async function onFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setBusy(true);
    setError(null);
    try {
      const meta = files.map((f) => ({ name: f.name, type: f.type, size: f.size }));
      const req = await requestPhotoUploadsAction(bikeId, meta);
      if (!req.ok) {
        setError(req.error);
        return;
      }
      // Upload each file straight to R2 with its presigned PUT.
      await Promise.all(
        req.uploads.map((u, i) =>
          fetch(u.url, {
            method: "PUT",
            body: files[i],
            headers: { "Content-Type": files[i].type },
          }).then((r) => {
            if (!r.ok) throw new Error(`Încărcare eșuată (${r.status})`);
          })
        )
      );
      const attach = await attachPhotosAction(
        bikeId,
        req.uploads.map((u) => u.key)
      );
      if (!attach.ok) {
        setError(attach.error);
        return;
      }
      // Merge server order with the URLs we know (new + existing).
      const urlByKey = new Map<string, string>([
        ...photos.map((p) => [p.key, p.url] as const),
        ...req.uploads.map((u) => [u.key, u.publicUrl] as const),
      ]);
      setPhotos(attach.photos.map((k) => ({ key: k, url: urlByKey.get(k) ?? "" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Încărcare eșuată");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(key: string) {
    setBusy(true);
    setError(null);
    const res = await deletePhotoAction(bikeId, key);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const urlByKey = new Map(photos.map((p) => [p.key, p.url] as const));
    setPhotos(res.photos.map((k) => ({ key: k, url: urlByKey.get(k) ?? "" })));
  }

  async function makeCover(key: string) {
    setBusy(true);
    setError(null);
    const res = await setCoverPhotoAction(bikeId, key);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const urlByKey = new Map(photos.map((p) => [p.key, p.url] as const));
    setPhotos(res.photos.map((k) => ({ key: k, url: urlByKey.get(k) ?? "" })));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex h-10 cursor-pointer items-center rounded-full bg-asphalt px-5 text-sm font-semibold text-paper transition-colors hover:bg-asphalt/90 disabled:opacity-60"
        >
          {busy ? "Se încarcă…" : "Încarcă poze"}
        </button>
        <span className="text-xs text-steel">JPG / PNG / WebP · max 15MB · până la 12 poze</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {photos.length === 0 ? (
        <p className="mt-4 text-sm text-steel">Nicio poză încă.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p, i) => (
            <li
              key={p.key}
              className="group relative overflow-hidden rounded-lg border border-border bg-manila/40"
            >
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </div>
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded bg-asphalt px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold text-paper">
                  COPERTĂ
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-asphalt/70 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 ? (
                  <button
                    type="button"
                    onClick={() => makeCover(p.key)}
                    disabled={busy}
                    className="cursor-pointer text-[0.65rem] font-medium text-paper hover:underline"
                  >
                    Fă copertă
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => remove(p.key)}
                  disabled={busy}
                  className="cursor-pointer text-[0.65rem] font-medium text-red-300 hover:underline"
                >
                  Șterge
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
