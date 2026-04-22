ALTER TABLE "invoice_imports" DROP CONSTRAINT "invoice_imports_file_hash_unique";--> statement-breakpoint
ALTER TABLE "invoice_imports" ADD COLUMN "source_row_index" integer DEFAULT -1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_imports_hash_row_uniq" ON "invoice_imports" USING btree ("file_hash","source_row_index");