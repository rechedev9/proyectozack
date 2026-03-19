CREATE TABLE "talent_metric_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"platform" text NOT NULL,
	"metric_type" text NOT NULL,
	"value" integer NOT NULL,
	"snapshot_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tms_unique_snapshot" UNIQUE("talent_id","platform","metric_type","snapshot_date")
);
--> statement-breakpoint
ALTER TABLE "talent_socials" ADD COLUMN "platform_id" varchar(200);--> statement-breakpoint
ALTER TABLE "talent_metric_snapshots" ADD CONSTRAINT "talent_metric_snapshots_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tms_talent_date_idx" ON "talent_metric_snapshots" USING btree ("talent_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "tms_platform_idx" ON "talent_metric_snapshots" USING btree ("platform");