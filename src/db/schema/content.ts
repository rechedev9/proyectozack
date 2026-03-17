import { pgTable, serial, varchar, text, integer, pgEnum } from 'drizzle-orm/pg-core';

export const portfolioTypeEnum = pgEnum('portfolio_type', ['thumb', 'video', 'campaign']);

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  quote: text('quote').notNull(),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorRole: varchar('author_role', { length: 150 }).notNull(),
  gradientC1: varchar('gradient_c1', { length: 7 }).notNull(),
  gradientC2: varchar('gradient_c2', { length: 7 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const collaborators = pgTable('collaborators', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 200 }).notNull(),
  badge: varchar('badge', { length: 100 }).notNull(),
  photoUrl: varchar('photo_url', { length: 500 }),
  gradientC1: varchar('gradient_c1', { length: 7 }).notNull(),
  gradientC2: varchar('gradient_c2', { length: 7 }).notNull(),
  initials: varchar('initials', { length: 4 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 150 }).notNull(),
  bio: text('bio').notNull(),
  photoUrl: varchar('photo_url', { length: 500 }),
  gradientC1: varchar('gradient_c1', { length: 7 }).notNull(),
  gradientC2: varchar('gradient_c2', { length: 7 }).notNull(),
  initials: varchar('initials', { length: 4 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  type: portfolioTypeEnum('type').notNull(),
  creatorName: varchar('creator_name', { length: 100 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  views: varchar('views', { length: 50 }),
  date: varchar('date', { length: 50 }),
  url: varchar('url', { length: 500 }),
  sortOrder: integer('sort_order').notNull().default(0),
});
