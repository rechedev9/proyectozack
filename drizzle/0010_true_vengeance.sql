CREATE TABLE "giveaways" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"brand_name" varchar(150) NOT NULL,
	"brand_logo" varchar(500),
	"value" varchar(50),
	"redirect_url" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "giveaways" ADD CONSTRAINT "giveaways_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "giveaways_talent_id_idx" ON "giveaways" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "giveaways_ends_at_idx" ON "giveaways" USING btree ("ends_at");