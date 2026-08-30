import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 (S3-compatible) storage for bike photos.
 *
 * - Uploads are presigned PUTs so the browser sends the file straight to R2
 *   (no Vercel body-size limit, and the secret key never leaves the server).
 * - Objects are namespaced by environment prefix (dev/preprod/prod) so one
 *   bucket is safely shared across environments.
 * - Public reads go through R2_PUBLIC_URL (r2.dev or a custom domain).
 */

export function isStorageEnabled(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_BUCKET &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_PUBLIC_URL
  );
}

const bucket = () => process.env.R2_BUCKET as string;
const envPrefix = () => (process.env.R2_ENV_PREFIX || "dev").replace(/\/+$/, "");

let cached: S3Client | null = null;
function client(): S3Client {
  if (!isStorageEnabled()) throw new Error("R2 storage is not configured");
  if (!cached) {
    cached = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      forcePathStyle: true, // most reliable against R2's account/jurisdiction host
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      },
    });
  }
  return cached;
}

/** Public URL a browser uses to fetch a stored object. */
export function publicUrl(key: string): string {
  return `${(process.env.R2_PUBLIC_URL as string).replace(/\/+$/, "")}/${key}`;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const ALLOWED_IMAGE_TYPES = Object.keys(EXT);
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15 MB

/** Build a namespaced object key for a bike photo. */
export function bikePhotoKey(bikeId: string, contentType: string): string {
  const ext = EXT[contentType] ?? "bin";
  return `${envPrefix()}/bikes/${bikeId}/${randomUUID()}.${ext}`;
}

/** Presign a PUT so the client can upload one photo directly to R2. */
export async function presignPhotoUpload(input: {
  key: string;
  contentType: string;
}): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: input.key,
    ContentType: input.contentType,
  });
  return getSignedUrl(client(), cmd, { expiresIn: 300 });
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/**
 * Live storage usage for this environment's prefix: object count + total bytes.
 * Best-effort - returns null if R2 is off or errors, so it never blocks a page.
 */
export async function getStorageStats(): Promise<{
  objects: number;
  bytes: number;
  prefix: string;
} | null> {
  if (!isStorageEnabled()) return null;
  try {
    const prefix = `${envPrefix()}/`;
    let token: string | undefined;
    let objects = 0;
    let bytes = 0;
    // Cap pagination so a huge bucket can't stall the dashboard.
    for (let page = 0; page < 20; page++) {
      const res = await client().send(
        new ListObjectsV2Command({ Bucket: bucket(), Prefix: prefix, ContinuationToken: token })
      );
      for (const o of res.Contents ?? []) {
        objects += 1;
        bytes += o.Size ?? 0;
      }
      if (!res.IsTruncated) break;
      token = res.NextContinuationToken;
    }
    return { objects, bytes, prefix };
  } catch {
    return null;
  }
}
