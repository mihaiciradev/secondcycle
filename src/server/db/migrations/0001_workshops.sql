ALTER TYPE "public"."role" ADD VALUE 'workshop';--> statement-breakpoint
ALTER TABLE "bikes" ADD COLUMN "workshop_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "workshop_id" uuid;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "work_hours" text;--> statement-breakpoint
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE set null ON UPDATE no action;