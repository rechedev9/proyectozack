CREATE TABLE "creator_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"code" varchar(100) NOT NULL,
	"brand_name" varchar(150) NOT NULL,
	"brand_logo" varchar(500),
	"redirect_url" text NOT NULL,
	"description" varchar(300),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_codes" ADD CONSTRAINT "creator_codes_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creator_codes_talent_id_idx" ON "creator_codes" USING btree ("talent_id");