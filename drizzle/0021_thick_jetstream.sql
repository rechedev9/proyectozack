CREATE TYPE "public"."crm_task_priority" AS ENUM('alta', 'media', 'baja');--> statement-breakpoint
CREATE TYPE "public"."crm_task_status" AS ENUM('pendiente', 'en_progreso', 'completada');--> statement-breakpoint
CREATE TABLE "crm_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"due_date" date,
	"priority" "crm_task_priority" DEFAULT 'media' NOT NULL,
	"status" "crm_task_status" DEFAULT 'pendiente' NOT NULL,
	"category" varchar(40) NOT NULL,
	"week_label" varchar(8) NOT NULL,
	"rolled_over" boolean DEFAULT false NOT NULL,
	"rolled_from_week" varchar(8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crm_tasks_owner_idx" ON "crm_tasks" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "crm_tasks_week_idx" ON "crm_tasks" USING btree ("week_label");--> statement-breakpoint
CREATE INDEX "crm_tasks_status_idx" ON "crm_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_tasks_week_owner_idx" ON "crm_tasks" USING btree ("week_label","owner_id");--> statement-breakpoint
CREATE INDEX "crm_tasks_week_status_idx" ON "crm_tasks" USING btree ("week_label","status");