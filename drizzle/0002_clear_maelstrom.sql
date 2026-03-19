CREATE TABLE "creator_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(200) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"handle" varchar(100) NOT NULL,
	"followers" varchar(50),
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
