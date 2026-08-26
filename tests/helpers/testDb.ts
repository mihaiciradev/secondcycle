import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "@/server/db/schema";

/**
 * Real Postgres per test file via testcontainers, migrated with the actual
 * drizzle-kit migrations. The reservation/order locking semantics are
 * load-bearing, so tests never run against SQLite/pglite.
 */
export type TestDb = {
  db: ReturnType<typeof drizzle<typeof schema>>;
  pool: Pool;
  container: StartedPostgreSqlContainer;
};

export async function setupTestDb(): Promise<TestDb> {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const pool = new Pool({ connectionString: container.getConnectionUri() });
  const db = drizzle(pool, { schema });
  await migrate(db, { migrationsFolder: "src/server/db/migrations" });
  return { db, pool, container };
}

export async function teardownTestDb(t: TestDb): Promise<void> {
  await t.pool.end();
  await t.container.stop();
}

/** Empty every table between tests (keeps sequences reset for stable assertions). */
export async function truncateAll(pool: Pool): Promise<void> {
  await pool.query(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> '__drizzle_migrations'
      ) LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
      END LOOP;
    END $$;
  `);
  await pool.query("ALTER SEQUENCE order_number_seq RESTART WITH 1");
}
