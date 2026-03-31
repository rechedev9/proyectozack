CREATE TYPE "public"."target_platform" AS ENUM('instagram', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."target_status" AS ENUM('pendiente', 'contactado', 'finalizado');--> statement-breakpoint
CREATE TABLE "targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(200) NOT NULL,
	"full_name" varchar(300),
	"platform" "target_platform" NOT NULL,
	"profile_url" text NOT NULL,
	"profile_pic_url" text,
	"followers" integer DEFAULT 0 NOT NULL,
	"following" integer,
	"posts" integer,
	"bio" text,
	"external_url" text,
	"is_private" boolean,
	"is_verified" boolean,
	"is_business" boolean,
	"is_creator" boolean,
	"business_category" varchar(200),
	"status" "target_status" DEFAULT 'pendiente' NOT NULL,
	"notes" text,
	"discovered_via" varchar(200),
	"import_batch_id" varchar(50),
	"enriched_at" timestamp with time zone,
	"contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "targets_platform_username_key" UNIQUE("platform","username")
);
--> statement-breakpoint
CREATE INDEX "targets_platform_idx" ON "targets" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "targets_status_idx" ON "targets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "targets_followers_idx" ON "targets" USING btree ("followers");--> statement-breakpoint
CREATE INDEX "targets_created_at_idx" ON "targets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "targets_import_batch_idx" ON "targets" USING btree ("import_batch_id");