CREATE TABLE "agency_creators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"country" varchar(50),
	"youtube_url" text,
	"twitter_url" text,
	"instagram_url" text,
	"tiktok_url" text,
	"twitch_url" text,
	"kick_url" text,
	"geostats_url" text,
	"stats_url" text,
	"tracker_url" text
);
