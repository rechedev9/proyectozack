import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  company: varchar('company', { length: 100 }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  ipHash: varchar('ip_hash', { length: 64 }),
});
