ALTER TABLE "invoices" ADD COLUMN "withholding_pct" numeric(5, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "series" varchar(20) DEFAULT 'A' NOT NULL;--> statement-breakpoint
CREATE INDEX "invoices_series_idx" ON "invoices" USING btree ("series");