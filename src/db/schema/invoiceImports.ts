import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { invoices } from './invoices';

export const invoiceImportSourceEnum = pgEnum('invoice_import_source', [
  'xlsx',
  'csv',
  'pdf-text',
  'facturae-xml',
  'ubl-xml',
  'manual',
]);

export const invoiceImportStatusEnum = pgEnum('invoice_import_status', [
  'pending',
  'approved',
  'rejected',
]);

export const invoiceImports = pgTable(
  'invoice_imports',
  {
    id: serial('id').primaryKey(),

    sourceType: invoiceImportSourceEnum('source_type').notNull(),
    sourceFilename: varchar('source_filename', { length: 300 }).notNull(),
    fileHash: varchar('file_hash', { length: 64 }).notNull(),
    // -1 for single-doc imports (PDF/XML/manual). 0..N for row-based imports (XLSX/CSV).
    sourceRowIndex: integer('source_row_index').notNull().default(-1),
    fileUrl: text('file_url'),
    filePath: text('file_path'),

    parsedDraft: jsonb('parsed_draft'),
    confidence: integer('confidence'),

    status: invoiceImportStatusEnum('status').notNull().default('pending'),
    warnings: jsonb('warnings'),

    invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),

    createdByUserId: text('created_by_user_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  },
  (t) => [
    index('invoice_imports_status_idx').on(t.status),
    index('invoice_imports_source_idx').on(t.sourceType),
    index('invoice_imports_created_at_idx').on(t.createdAt),
    uniqueIndex('invoice_imports_hash_row_uniq').on(t.fileHash, t.sourceRowIndex),
  ],
);

export const invoiceImportsRelations = relations(invoiceImports, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceImports.invoiceId], references: [invoices.id] }),
  createdBy: one(user, { fields: [invoiceImports.createdByUserId], references: [user.id] }),
}));
