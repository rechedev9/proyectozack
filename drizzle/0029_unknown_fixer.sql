CREATE TABLE "crm_brand_followups" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"created_by_user_id" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"note" text NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_brand_contacts" ADD COLUMN "discord" varchar(80);--> statement-breakpoint
ALTER TABLE "crm_brands" ADD COLUMN "tipo" varchar(20);--> statement-breakpoint
ALTER TABLE "crm_brands" ADD COLUMN "geo" varchar(30);--> statement-breakpoint
ALTER TABLE "crm_brand_followups" ADD CONSTRAINT "crm_brand_followups_brand_id_crm_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."crm_brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_brand_followups" ADD CONSTRAINT "crm_brand_followups_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crm_brand_followups_brand_idx" ON "crm_brand_followups" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "crm_brand_followups_scheduled_idx" ON "crm_brand_followups" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "crm_brand_followups_completed_idx" ON "crm_brand_followups" USING btree ("completed_at");