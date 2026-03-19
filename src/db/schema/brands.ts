import { pgTable, serial, integer, text, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';
import { caseStudies } from './cases';
import { user } from './auth';

export const proposalStatusEnum = pgEnum('proposal_status', [
  'pendiente',
  'en_revision',
  'aceptada',
  'rechazada',
]);

export const brandCampaigns = pgTable('brand_campaigns', {
  id: serial('id').primaryKey(),
  brandUserId: text('brand_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  caseId: integer('case_id').references(() => caseStudies.id, { onDelete: 'set null' }),
  role: varchar('role', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const talentProposals = pgTable('talent_proposals', {
  id: serial('id').primaryKey(),
  brandUserId: text('brand_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  talentId: integer('talent_id').notNull().references(() => talents.id, { onDelete: 'cascade' }),
  campaignType: varchar('campaign_type', { length: 50 }).notNull(),
  budgetRange: varchar('budget_range', { length: 50 }).notNull(),
  timeline: varchar('timeline', { length: 50 }).notNull(),
  message: text('message').notNull(),
  status: proposalStatusEnum('status').notNull().default('pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const brandCampaignsRelations = relations(brandCampaigns, ({ one }) => ({
  brandUser: one(user, { fields: [brandCampaigns.brandUserId], references: [user.id] }),
  talent: one(talents, { fields: [brandCampaigns.talentId], references: [talents.id] }),
  caseStudy: one(caseStudies, { fields: [brandCampaigns.caseId], references: [caseStudies.id] }),
}));

export const talentProposalsRelations = relations(talentProposals, ({ one }) => ({
  brandUser: one(user, { fields: [talentProposals.brandUserId], references: [user.id] }),
  talent: one(talents, { fields: [talentProposals.talentId], references: [talents.id] }),
}));
