-- Bikes: optional specs (unknown for very old bikes), a fallback display name,
-- and internal admin notes.
ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "admin_notes" text;

ALTER TABLE "bikes" ALTER COLUMN "brand" DROP NOT NULL;
ALTER TABLE "bikes" ALTER COLUMN "model" DROP NOT NULL;
ALTER TABLE "bikes" ALTER COLUMN "frame_number" DROP NOT NULL;
ALTER TABLE "bikes" ALTER COLUMN "frame_size" DROP NOT NULL;
ALTER TABLE "bikes" ALTER COLUMN "wheel_size" DROP NOT NULL;
