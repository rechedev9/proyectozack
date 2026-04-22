import {
  pgTable,
  serial,
  varchar,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { invoiceImportSourceEnum } from './invoiceImports';

export const invoiceImportTemplates = pgTable(
  'invoice_import_templates',
  {
    id: serial('id').primaryKey(),

    name: varchar('name', { length: 120 }).notNull(),
    sourceType: invoiceImportSourceEnum('source_type').notNull(),

    // { [InvoiceDraftField]: number } — column index (0-based) in the sheet.
    columnMapping: jsonb('column_mapping').notNull(),
    // string[] — header row captured when the mapping was created, used to auto-match.
    sampleHeaders: jsonb('sample_headers').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('invoice_import_templates_name_source_uniq').on(t.sourceType, t.name),
  ],
);
