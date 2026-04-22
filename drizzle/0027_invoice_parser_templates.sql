CREATE TABLE "invoice_parser_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"issuer_nif" varchar(20) NOT NULL,
	"issuer_name" varchar(200),
	"regions" jsonb NOT NULL,
	"hints" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_parser_templates_issuer_nif_unique" UNIQUE("issuer_nif")
);
