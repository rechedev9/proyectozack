import {
  pgTable,
  serial,
  varchar,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const invoiceParserTemplates = pgTable('invoice_parser_templates', {
  id: serial('id').primaryKey(),

  issuerNif: varchar('issuer_nif', { length: 20 }).notNull().unique(),
  issuerName: varchar('issuer_name', { length: 200 }),

  // { [field]: { page: number, x: number, y: number, width: number, height: number } }
  regions: jsonb('regions').notNull(),
  // Optional custom regexes per field: { [field]: string }
  hints: jsonb('hints'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
