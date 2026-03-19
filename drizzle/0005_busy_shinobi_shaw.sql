CREATE INDEX "talent_socials_talent_id_idx" ON "talent_socials" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "talent_stats_talent_id_idx" ON "talent_stats" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "talent_tags_talent_id_idx" ON "talent_tags" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "talents_slug_idx" ON "talents" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "talents_platform_idx" ON "talents" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "talents_status_idx" ON "talents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "case_body_case_id_idx" ON "case_body" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_creators_case_id_idx" ON "case_creators" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "case_tags_case_id_idx" ON "case_tags" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_campaigns_brand_user_id_idx" ON "brand_campaigns" USING btree ("brand_user_id");--> statement-breakpoint
CREATE INDEX "brand_campaigns_talent_id_idx" ON "brand_campaigns" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "talent_proposals_brand_user_id_idx" ON "talent_proposals" USING btree ("brand_user_id");--> statement-breakpoint
CREATE INDEX "talent_proposals_talent_id_idx" ON "talent_proposals" USING btree ("talent_id");