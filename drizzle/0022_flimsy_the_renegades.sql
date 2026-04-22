CREATE TYPE "public"."crm_brand_status" AS ENUM('lead', 'activa', 'pausada', 'archivada');--> statement-breakpoint
CREATE TYPE "public"."talent_vertical" AS ENUM('casino', 'cs2_cases', 'cs2_marketplace', 'cs2_skin_trading', 'sports_betting', 'crypto', 'gaming_brands', 'fmcg', 'tech', 'otros');--> statement-breakpoint
CREATE TYPE "public"."invoice_kind" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('borrador', 'emitida', 'cobrada', 'vencida', 'anulada');--> statement-breakpoint
CREATE TABLE "crm_brand_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"role" varchar(100),
	"email" varchar(180),
	"phone" varchar(40),
	"telegram" varchar(80),
	"whatsapp" varchar(40),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"legal_name" varchar(250),
	"website" text,
	"sector" varchar(80),
	"country" varchar(2),
	"status" "crm_brand_status" DEFAULT 'lead' NOT NULL,
	"owner_user_id" text,
	"portal_user_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_business" (
	"talent_id" integer PRIMARY KEY NOT NULL,
	"telegram" varchar(80),
	"whatsapp" varchar(40),
	"discord" varchar(80),
	"contact_email" varchar(180),
	"manager_name" varchar(150),
	"manager_email" varchar(180),
	"rate_notes" text,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_verticals" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"vertical" "talent_vertical" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "talent_verticals_unique" UNIQUE("talent_id","vertical")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "invoice_kind" NOT NULL,
	"number" varchar(60),
	"issue_date" date NOT NULL,
	"due_date" date,
	"paid_date" date,
	"brand_id" integer,
	"talent_id" integer,
	"counterparty_name" varchar(200),
	"concept" text NOT NULL,
	"category" varchar(80),
	"net_amount" numeric(12, 2) NOT NULL,
	"vat_pct" numeric(5, 2) DEFAULT '21.00' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"status" "invoice_status" DEFAULT 'borrador' NOT NULL,
	"file_url" text,
	"file_path" text,
	"notes" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_brand_contacts" ADD CONSTRAINT "crm_brand_contacts_brand_id_crm_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."crm_brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_brands" ADD CONSTRAINT "crm_brands_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_brands" ADD CONSTRAINT "crm_brands_portal_user_id_user_id_fk" FOREIGN KEY ("portal_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_business" ADD CONSTRAINT "talent_business_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_verticals" ADD CONSTRAINT "talent_verticals_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_brand_id_crm_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."crm_brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crm_brand_contacts_brand_idx" ON "crm_brand_contacts" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "crm_brand_contacts_email_idx" ON "crm_brand_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "crm_brands_status_idx" ON "crm_brands" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_brands_owner_idx" ON "crm_brands" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "crm_brands_portal_user_idx" ON "crm_brands" USING btree ("portal_user_id");--> statement-breakpoint
CREATE INDEX "crm_brands_name_idx" ON "crm_brands" USING btree ("name");--> statement-breakpoint
CREATE INDEX "talent_verticals_talent_idx" ON "talent_verticals" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "talent_verticals_vertical_idx" ON "talent_verticals" USING btree ("vertical");--> statement-breakpoint
CREATE INDEX "invoices_kind_idx" ON "invoices" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_brand_idx" ON "invoices" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "invoices_talent_idx" ON "invoices" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "invoices_issue_date_idx" ON "invoices" USING btree ("issue_date");--> statement-breakpoint
CREATE INDEX "invoices_due_date_idx" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "invoices_category_idx" ON "invoices" USING btree ("category");