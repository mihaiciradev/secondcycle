-- Conturi de partener (collab) + vouchere. Partenerul scanează/introduce codul
-- unui voucher ca să-l marcheze folosit. Voucherele sunt generice (folosire
-- viitoare in-app), dar azi doar pentru fluxul de colaborare cu partenerii.

ALTER TYPE "role" ADD VALUE IF NOT EXISTS 'partner';

DO $$ BEGIN
  CREATE TYPE "voucher_value_type" AS ENUM ('percent', 'amount');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "voucher_status" AS ENUM ('unused', 'used');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "partners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "contact_name" text,
  "phone" text,
  "email" citext,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "partner_id" uuid
  REFERENCES "partners"("id") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "vouchers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "subtitle" text,
  "explanations" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "value_type" "voucher_value_type" NOT NULL,
  "value_amount" integer NOT NULL,
  "valid_from" timestamptz,
  "valid_until" timestamptz NOT NULL,
  "status" "voucher_status" NOT NULL DEFAULT 'unused',
  "partner_id" uuid REFERENCES "partners"("id") ON DELETE SET NULL,
  "recipient_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "assigned_at" timestamptz,
  "used_at" timestamptz,
  "used_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "vouchers_partner_idx" ON "vouchers" ("partner_id");
CREATE INDEX IF NOT EXISTS "vouchers_recipient_idx" ON "vouchers" ("recipient_user_id");
