CREATE TYPE "public"."platform" AS ENUM('twitch', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'available');--> statement-breakpoint
CREATE TYPE "public"."portfolio_type" AS ENUM('thumb', 'video', 'campaign');--> statement-breakpoint
CREATE TABLE "talent_socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"platform" varchar(50) NOT NULL,
	"handle" varchar(100) NOT NULL,
	"followers_display" varchar(20) NOT NULL,
	"profile_url" text,
	"hex_color" varchar(7) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"icon" varchar(10) NOT NULL,
	"value" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"tag" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talents" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(150) NOT NULL,
	"game" varchar(100) NOT NULL,
	"platform" "platform" NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"bio" text NOT NULL,
	"gradient_c1" varchar(7) NOT NULL,
	"gradient_c2" varchar(7) NOT NULL,
	"initials" varchar(4) NOT NULL,
	"photo_url" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "talents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"logo_url" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(200) NOT NULL,
	"badge" varchar(100) NOT NULL,
	"photo_url" varchar(500),
	"gradient_c1" varchar(7) NOT NULL,
	"gradient_c2" varchar(7) NOT NULL,
	"initials" varchar(4) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "collaborators_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "portfolio_type" NOT NULL,
	"creator_name" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"image_url" varchar(500),
	"views" varchar(50),
	"date" varchar(50),
	"url" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(150) NOT NULL,
	"bio" text NOT NULL,
	"photo_url" varchar(500),
	"gradient_c1" varchar(7) NOT NULL,
	"gradient_c2" varchar(7) NOT NULL,
	"initials" varchar(4) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "team_members_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote" text NOT NULL,
	"author_name" varchar(100) NOT NULL,
	"author_role" varchar(150) NOT NULL,
	"gradient_c1" varchar(7) NOT NULL,
	"gradient_c2" varchar(7) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_body" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"paragraph" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_creators" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"creator_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_studies" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"brand_name" varchar(100) NOT NULL,
	"title" text NOT NULL,
	"logo_url" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"reach" varchar(50),
	"engagement_rate" varchar(20),
	"conversions" varchar(50),
	"roi_multiplier" varchar(20),
	"hero_image_url" varchar(500),
	"excerpt" text,
	CONSTRAINT "case_studies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "case_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"tag" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(200) NOT NULL,
	"phone" varchar(30),
	"type" varchar(50) NOT NULL,
	"company" varchar(100),
	"message" text NOT NULL,
	"budget" varchar(20),
	"timeline" varchar(30),
	"audience" varchar(200),
	"platform" varchar(30),
	"viewers" varchar(100),
	"monetization" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ip_hash" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "talent_socials" ADD CONSTRAINT "talent_socials_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_stats" ADD CONSTRAINT "talent_stats_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_tags" ADD CONSTRAINT "talent_tags_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_body" ADD CONSTRAINT "case_body_case_id_case_studies_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_creators" ADD CONSTRAINT "case_creators_case_id_case_studies_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_tags" ADD CONSTRAINT "case_tags_case_id_case_studies_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;