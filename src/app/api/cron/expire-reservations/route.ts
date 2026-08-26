export const runtime = "nodejs";

import { db } from "@/server/db/client";
import { expireOverdueReservations } from "@/server/services/reservations";

export async function GET(request: Request) {
  const authz = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authz !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const expired = await expireOverdueReservations(db);
  return Response.json({ expired });
}
