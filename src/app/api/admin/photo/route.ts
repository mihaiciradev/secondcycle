import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/guards";
import { isStorageEnabled, publicUrl } from "@/server/storage/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only download proxy for a bike photo. Fetches the object from R2
 * server-side (no browser CORS) and returns it as an attachment, so the admin
 * can save the original file. The client uses this to "download all photos".
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
  if (!isStorageEnabled()) return new Response("Storage indisponibil", { status: 400 });

  const key = req.nextUrl.searchParams.get("key") ?? "";
  // Only our own bike-photo keys: <envPrefix>/bikes/<uuid>/<file>. Blocks
  // path traversal and arbitrary fetches through this proxy.
  if (key.includes("..") || !/^[A-Za-z0-9._-]+\/bikes\/[a-f0-9-]+\/[A-Za-z0-9._-]+$/i.test(key)) {
    return new Response("Cheie invalidă", { status: 400 });
  }

  const upstream = await fetch(publicUrl(key), { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("Poza nu există", { status: 404 });

  const filename = key.split("/").pop() || "poza";
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Cache-Control", "private, no-store");
  return new Response(upstream.body, { headers });
}
