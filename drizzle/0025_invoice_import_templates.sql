CREATE TABLE "invoice_import_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"source_type" "invoice_import_source" NOT NULL,
	"column_mapping" jsonb NOT NULL,
	"sample_headers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_import_templates_name_source_uniq" ON "invoice_import_templates" USING btree ("source_type","name");