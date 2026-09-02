-- SoftPro invoicing: numeric partner id per user + invoice tracking on orders.
CREATE SEQUENCE IF NOT EXISTS "users_partner_no_seq" START 1000;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "partner_no" bigint;
UPDATE "users" SET "partner_no" = nextval('users_partner_no_seq') WHERE "partner_no" IS NULL;
ALTER TABLE "users" ALTER COLUMN "partner_no" SET DEFAULT nextval('users_partner_no_seq');
ALTER TABLE "users" ALTER COLUMN "partner_no" SET NOT NULL;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sp_invoice_status" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sp_invoice_info" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sp_invoiced_at" timestamptz;
