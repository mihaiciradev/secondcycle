import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * One Drizzle client per process (a module singleton, cached on globalThis so
 * Next's dev HMR doesn't open a new pool on every reload).
 *
 * App queries use the POOLED connection (DATABASE_URL). Migrations use the
 * DIRECT connection (DATABASE_URL_UNPOOLED) and go through drizzle-kit, not
 * this client.
 */
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Drop `sslmode` from the URL: we set TLS explicitly below (with certificate
// verification). This also silences pg-connection-string's warning that legacy
// sslmode values will change meaning in a future major.
function stripSslMode(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    return url;
  }
}
const connectionString = stripSslMode(rawUrl);

const globalForDb = globalThis as unknown as { __scPool?: Pool };

const pool =
  globalForDb.__scPool ??
  new Pool({
    connectionString,
    max: 10,
    // Encrypted AND authenticated: verify Neon's certificate (chains to a public
    // CA) to prevent man-in-the-middle. Do not set rejectUnauthorized:false.
    ssl: { rejectUnauthorized: true },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__scPool = pool;
}

export const db = drizzle(pool, { schema });
export type DB = typeof db;

/** Transaction handle type for services that receive a tx. */
export type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

/** A db-or-transaction handle: services accept either. */
export type DbOrTx = DB | Tx;
