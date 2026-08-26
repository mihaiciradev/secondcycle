This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Backend

The backend lives inside this Next.js app (App Router). Business logic is in
`src/server/services/` as pure functions that receive a Drizzle db/transaction
handle; Server Actions, route handlers and cron endpoints are thin shells
(authenticate → validate with zod → call the service). Data model and
migrations are Drizzle + drizzle-kit against Postgres on Neon.

### Layout

- `src/server/db/` — Drizzle client singleton (`client.ts`), `schema.ts`,
  and `migrations/` (drizzle-kit output).
- `src/server/constants/` — RO counties, CUI checksum, status transitions,
  app constants (`WARRANTY_MONTHS`, TTLs, `TERMS_VERSION`).
- `src/server/services/`, `src/server/auth/`, `src/server/email/` — added per
  slice.
- `tests/` mirrors the server layout; services are tested against real Postgres
  via testcontainers.

### Environment

Copy `.env.example` to `.env.local` (never committed) and fill it in. Key rule:

- **`DATABASE_URL`** — the **pooled** Neon string (host contains `-pooler`).
  Used by the app at runtime.
- **`DATABASE_URL_UNPOOLED`** — the **direct** string (same host without
  `-pooler`). Used **only** by drizzle-kit for migrations.

Every other variable is documented in `.env.example`.

### Database & migrations

```bash
npm run db:generate   # generate a new migration from schema.ts changes
npm run db:migrate    # apply pending migrations (uses DATABASE_URL_UNPOOLED)
npm run db:studio     # browse the DB with Drizzle Studio
npm run seed          # create/ensure the admin user (idempotent) — added later
```

Never `db push` against Neon; every schema change is a committed migration. The
initial migration also creates the `citext` extension and the `order_number_seq`
sequence used for human order numbers (`SC-2026-000123`).

### Tests

Vitest + `@testcontainers/postgresql` run the services against a **real**
Postgres container (SQLite/pglite are not used — the row-locking semantics are
load-bearing).

```bash
npm test          # one-shot
npm run test:watch
```

**Docker must be running** (Docker Desktop on Windows/Mac). Each test file boots
a Postgres container and applies the drizzle-kit migrations before running.

> Node: use **Node 20.19+ or 22 LTS**. On older 20.x, `vitest` and
> `testcontainers` are pinned to versions that still work (v3 / v10).

### Cron (dev)

Cron endpoints live under `src/app/api/cron/*` and require
`Authorization: Bearer $CRON_SECRET`. In production they are wired via
`vercel.json`. Locally, trigger them by hand, e.g.:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3055/api/cron/expire-reservations
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
