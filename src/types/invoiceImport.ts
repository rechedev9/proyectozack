import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { invoiceImports } from '@/db/schema';
import type { InvoiceDraft } from '@/lib/schemas/invoiceDraft';

export type InvoiceImport = InferSelectModel<typeof invoiceImports>;
export type NewInvoiceImport = InferInsertModel<typeof invoiceImports>;

export type InvoiceImportSource = InvoiceImport['sourceType'];
export type InvoiceImportStatus = InvoiceImport['status'];

// parsedDraft holds InvoiceDraft fields plus an internal __regions__ key used
// for PDF template learning. The UI should ignore fields whose key starts with "__".
export type InvoiceImportDraftJson = Partial<InvoiceDraft> & Record<string, unknown>;

export type InvoiceImportWithDraft = Omit<InvoiceImport, 'parsedDraft' | 'warnings'> & {
  readonly parsedDraft: InvoiceImportDraftJson | null;
  readonly warnings: readonly string[] | null;
};
