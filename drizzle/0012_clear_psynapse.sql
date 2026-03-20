CREATE TABLE "giveaway_winners" (
	"id" serial PRIMARY KEY NOT NULL,
	"giveaway_id" integer NOT NULL,
	"winner_name" varchar(100) NOT NULL,
	"winner_avatar" varchar(500),
	"won_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "giveaway_winners" ADD CONSTRAINT "giveaway_winners_giveaway_id_giveaways_id_fk" FOREIGN KEY ("giveaway_id") REFERENCES "public"."giveaways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "giveaway_winners_giveaway_id_idx" ON "giveaway_winners" USING btree ("giveaway_id");--> statement-breakpoint
CREATE INDEX "giveaway_winners_won_at_idx" ON "giveaway_winners" USING btree ("won_at");