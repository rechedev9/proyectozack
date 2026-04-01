CREATE TABLE "brand_target_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_user_id" text NOT NULL,
	"target_id" integer NOT NULL,
	"status" "target_status" DEFAULT 'pendiente' NOT NULL,
	"notes" text,
	"contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_target_assignments_brand_target_key" UNIQUE("brand_user_id","target_id")
);
--> statement-breakpoint
ALTER TABLE "brand_target_assignments" ADD CONSTRAINT "brand_target_assignments_brand_user_id_user_id_fk" FOREIGN KEY ("brand_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_target_assignments" ADD CONSTRAINT "brand_target_assignments_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_target_assignments_brand_idx" ON "brand_target_assignments" USING btree ("brand_user_id");--> statement-breakpoint
CREATE INDEX "brand_target_assignments_target_idx" ON "brand_target_assignments" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "brand_target_assignments_status_idx" ON "brand_target_assignments" USING btree ("status");