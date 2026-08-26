import { sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";

/**
 * Fixed-window rate limit via a single upsert. Returns true if the call is
 * ALLOWED (count within max for the current window), false if it should be
 * rejected. Windows are aligned to windowSec boundaries; old rows are swept by
 * the cleanup cron.
 */
export async function rateLimit(
  db: DB,
  key: string,
  max: number,
  windowSec: number
): Promise<boolean> {
  const windowMs = windowSec * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  return row.count <= max;
}
