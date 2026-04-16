ALTER TYPE "public"."target_status" ADD VALUE 'descartado';--> statement-breakpoint
CREATE TABLE "stats_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "stats_shares_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "talents" ADD COLUMN "top_geos" jsonb;--> statement-breakpoint
ALTER TABLE "talents" ADD COLUMN "audience_language" text;--> statement-breakpoint
ALTER TABLE "stats_shares" ADD CONSTRAINT "stats_shares_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stats_shares_token_idx" ON "stats_shares" USING btree ("token");