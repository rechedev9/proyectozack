ALTER TYPE "public"."status" ADD VALUE 'inactive';--> statement-breakpoint
ALTER TABLE "talent_socials" ADD COLUMN "top_geos" jsonb;