import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { talents } from './talents';

export const caseStudies = pgTable('case_studies', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  brandName: varchar('brand_name', { length: 100 }).notNull(),
  title: text('title').notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  sortOrder: integer('sort_order').notNull().default(0),
  reach: varchar('reach', { length: 50 }),
  engagementRate: varchar('engagement_rate', { length: 20 }),
  conversions: varchar('conversions', { length: 50 }),
  roiMultiplier: varchar('roi_multiplier', { length: 20 }),
  heroImageUrl: varchar('hero_image_url', { length: 500 }),
  excerpt: text('excerpt'),
});

export const caseBody = pgTable('case_body', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => caseStudies.id, { onDelete: 'cascade' }),
  paragraph: text('paragraph').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const caseTags = pgTable('case_tags', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => caseStudies.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 100 }).notNull(),
});

export const caseCreators = pgTable('case_creators', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => caseStudies.id, { onDelete: 'cascade' }),
  creatorName: varchar('creator_name', { length: 100 }).notNull(),
  talentId: integer('talent_id').references(() => talents.id, { onDelete: 'set null' }),
});

export const caseStudiesRelations = relations(caseStudies, ({ many }) => ({
  body: many(caseBody),
  tags: many(caseTags),
  creators: many(caseCreators),
}));

export const caseBodyRelations = relations(caseBody, ({ one }) => ({
  caseStudy: one(caseStudies, { fields: [caseBody.caseId], references: [caseStudies.id] }),
}));

export const caseTagsRelations = relations(caseTags, ({ one }) => ({
  caseStudy: one(caseStudies, { fields: [caseTags.caseId], references: [caseStudies.id] }),
}));

export const caseCreatorsRelations = relations(caseCreators, ({ one }) => ({
  caseStudy: one(caseStudies, { fields: [caseCreators.caseId], references: [caseStudies.id] }),
}));
