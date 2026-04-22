CREATE TYPE "public"."invoice_import_source" AS ENUM('xlsx', 'csv', 'pdf-text', 'facturae-xml', 'ubl-xml', 'manual');--> statement-breakpoint
CREATE TYPE "public"."invoice_import_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "invoice_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" "invoice_import_source" NOT NULL,
	"source_filename" varchar(300) NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"file_url" text,
	"file_path" text,
	"parsed_draft" jsonb,
	"confidence" integer,
	"status" "invoice_import_status" DEFAULT 'pending' NOT NULL,
	"warnings" jsonb,
	"invoice_id" integer,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "invoice_imports_file_hash_unique" UNIQUE("file_hash")
);
--> statement-breakpoint
ALTER TABLE "invoice_imports" ADD CONSTRAINT "invoice_imports_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_imports" ADD CONSTRAINT "invoice_imports_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoice_imports_status_idx" ON "invoice_imports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_imports_source_idx" ON "invoice_imports" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "invoice_imports_created_at_idx" ON "invoice_imports" USING btree ("created_at");