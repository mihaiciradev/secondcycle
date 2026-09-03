"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";
import { getBikeById, setBikePhotos } from "@/server/services/bikes";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_PHOTO_BYTES,
  bikePhotoKey,
  deleteObject,
  isStorageEnabled,
  presignPhotoUpload,
  publicUrl,
} from "@/server/storage/r2";
import { actionError } from "@/server/errors";

const MAX_PHOTOS = 12;

const filesSchema = z
  .array(
    z.object({
      name: z.string().max(255),
      type: z.enum(ALLOWED_IMAGE_TYPES as [string, ...string[]]),
      size: z.number().int().positive().max(MAX_PHOTO_BYTES),
    })
  )
  .min(1)
  .max(MAX_PHOTOS);

type Upload = { key: string; url: string; publicUrl: string };

/** Presign one PUT per file so the browser can upload straight to R2. */
export async function requestPhotoUploadsAction(
  bikeId: string,
  files: unknown
): Promise<{ ok: true; uploads: Upload[] } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    if (!isStorageEnabled()) return { ok: false, error: "Stocarea foto nu e configurată." };

    const parsed = filesSchema.safeParse(files);
    if (!parsed.success) return { ok: false, error: "Fișiere invalide (doar imagini, max 15MB)." };

    const bike = await getBikeById(db, bikeId);
    if (!bike) return { ok: false, error: "Bicicleta nu există." };
    if (bike.photos.length + parsed.data.length > MAX_PHOTOS) {
      return { ok: false, error: `Maxim ${MAX_PHOTOS} poze per bicicletă.` };
    }

    const uploads: Upload[] = [];
    for (const f of parsed.data) {
      const key = bikePhotoKey(bikeId, f.type);
      const url = await presignPhotoUpload({ key, contentType: f.type });
      uploads.push({ key, url, publicUrl: publicUrl(key) });
    }
    return { ok: true, uploads };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

/** After the browser finishes the PUTs, persist the new keys onto the bike. */
export async function attachPhotosAction(
  bikeId: string,
  keys: string[]
): Promise<{ ok: true; photos: string[] } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const bike = await getBikeById(db, bikeId);
    if (!bike) return { ok: false, error: "Bicicleta nu există." };

    // Only accept keys that belong to this bike (defense-in-depth).
    const marker = `/bikes/${bikeId}/`;
    const incoming = keys.filter((k) => k.includes(marker) && !bike.photos.includes(k));
    const next = [...bike.photos, ...incoming].slice(0, MAX_PHOTOS);
    await setBikePhotos(db, bikeId, next);
    revalidatePath(`/admin/bikes/${bikeId}`);
    return { ok: true, photos: next };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

export async function deletePhotoAction(
  bikeId: string,
  key: string
): Promise<{ ok: true; photos: string[] } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const bike = await getBikeById(db, bikeId);
    if (!bike) return { ok: false, error: "Bicicleta nu există." };
    if (!bike.photos.includes(key)) return { ok: true, photos: bike.photos };

    await deleteObject(key).catch(() => {}); // best-effort: DB is the source of truth
    const next = bike.photos.filter((k) => k !== key);
    await setBikePhotos(db, bikeId, next);
    revalidatePath(`/admin/bikes/${bikeId}`);
    return { ok: true, photos: next };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}

/** Move a photo to the front so it becomes the cover. */
export async function setCoverPhotoAction(
  bikeId: string,
  key: string
): Promise<{ ok: true; photos: string[] } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const bike = await getBikeById(db, bikeId);
    if (!bike) return { ok: false, error: "Bicicleta nu există." };
    if (!bike.photos.includes(key)) return { ok: false, error: "Poza nu există." };

    const next = [key, ...bike.photos.filter((k) => k !== key)];
    await setBikePhotos(db, bikeId, next);
    revalidatePath(`/admin/bikes/${bikeId}`);
    return { ok: true, photos: next };
  } catch (e) {
    return { ok: false, error: actionError(e) };
  }
}
