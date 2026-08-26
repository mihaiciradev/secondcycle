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
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForDb = globalThis as unknown as { __scPool?: Pool };

const pool =
  globalForDb.__scPool ??
  new Pool({
    connectionString,
    max: 10,
    // Neon requires TLS; the connection string carries sslmode=require.
    ssl: { rejectUnauthorized: false },
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
