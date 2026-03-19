CREATE INDEX "case_creators_talent_id_idx" ON "case_creators" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_submissions_ip_hash_idx" ON "contact_submissions" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "posts_status_published_at_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "creator_applications_created_at_idx" ON "creator_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "brand_campaigns_case_id_idx" ON "brand_campaigns" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "talent_proposals_status_idx" ON "talent_proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "talent_proposals_created_at_idx" ON "talent_proposals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "talent_proposals_brand_talent_status_idx" ON "talent_proposals" USING btree ("brand_user_id","talent_id","status");