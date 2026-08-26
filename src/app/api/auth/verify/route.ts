export const runtime = "nodejs";

import { db } from "@/server/db/client";
import { verifyEmail } from "@/server/services/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const ok = token.length > 0 && (await verifyEmail(db, token));
  const to = ok ? "/login?verified=1" : "/verify-email?error=1";
  return Response.redirect(new URL(to, url.origin), 302);
}
