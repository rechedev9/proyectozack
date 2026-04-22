CREATE TYPE "public"."crm_task_related_type" AS ENUM('brand', 'talent', 'invoice');--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD COLUMN "related_type" "crm_task_related_type";--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD COLUMN "related_id" integer;--> statement-breakpoint
CREATE INDEX "crm_tasks_related_idx" ON "crm_tasks" USING btree ("related_type","related_id");