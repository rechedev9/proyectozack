ALTER TABLE "targets" ADD COLUMN "brand_user_id" text;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_brand_user_id_user_id_fk" FOREIGN KEY ("brand_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "targets" AS t
SET
	"brand_user_id" = a."brand_user_id",
	"status" = a."status",
	"notes" = COALESCE(a."notes", t."notes"),
	"contacted_at" = COALESCE(a."contacted_at", t."contacted_at"),
	"updated_at" = GREATEST(t."updated_at", a."updated_at")
FROM "brand_target_assignments" AS a
WHERE a."target_id" = t."id";--> statement-breakpoint
ALTER TABLE "brand_target_assignments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "brand_target_assignments" CASCADE;--> statement-breakpoint
CREATE INDEX "targets_brand_user_idx" ON "targets" USING btree ("brand_user_id");
