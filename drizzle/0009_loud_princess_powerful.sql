CREATE TYPE "public"."visibility" AS ENUM('public', 'internal');--> statement-breakpoint
ALTER TABLE "talents" ADD COLUMN "visibility" "visibility" DEFAULT 'public' NOT NULL;