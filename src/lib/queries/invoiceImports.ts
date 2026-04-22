import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceImports, invoices } from '@/db/schema';
import { createInvoice } from './invoices';
import { draftToInvoiceInsert, type ApproveImportInput } from '@/lib/schemas/invoiceDraft';
import type {
  InvoiceImport,
  InvoiceImportStatus,
  InvoiceImportWithDraft,
  NewInvoiceImport,
} from '@/types';

function asImportWithDraft(row: InvoiceImport): InvoiceImportWithDraft {
  return {
    ...row,
    parsedDraft: row.parsedDraft as InvoiceImportWithDraft['parsedDraft'],
    warnings: row.warnings as InvoiceImportWithDraft['warnings'],
  };
}

export async function listImports(
  status?: InvoiceImportStatus,
): Promise<readonly InvoiceImportWithDraft[]> {
  const rows = await db
    .select()
    .from(invoiceImports)
    .where(status ? eq(invoiceImports.status, status) : undefined)
    .orderBy(desc(invoiceImports.createdAt), desc(invoiceImports.id));
  return rows.map(asImportWithDraft);
}

export async function getImport(id: number): Promise<InvoiceImportWithDraft | null> {
  const [row] = await db
    .select()
    .from(invoiceImports)
    .where(eq(invoiceImports.id, id))
    .limit(1);
  return row ? asImportWithDraft(row) : null;
}

export async function getImportByHash(
  fileHash: string,
  sourceRowIndex = -1,
): Promise<InvoiceImport | null> {
  const [row] = await db
    .select()
    .from(invoiceImports)
    .where(
      and(
        eq(invoiceImports.fileHash, fileHash),
        eq(invoiceImports.sourceRowIndex, sourceRowIndex),
      ),
    )
    .limit(1);
  return row ?? null;
}

export class DuplicateImportError extends Error {
  readonly existingId: number;
  constructor(existingId: number) {
    super('Este archivo ya fue subido previamente');
    this.name = 'DuplicateImportError';
    this.existingId = existingId;
  }
}

type CreateImportArgs = {
  readonly sourceType: NewInvoiceImport['sourceType'];
  readonly sourceFilename: string;
  readonly fileHash: string;
  readonly sourceRowIndex?: number;
  readonly fileUrl: string | null;
  readonly filePath: string | null;
  readonly parsedDraft?: NewInvoiceImport['parsedDraft'];
  readonly confidence?: number | null;
  readonly warnings?: readonly string[];
  readonly createdByUserId: string | null;
};

export async function createImport(args: CreateImportArgs): Promise<InvoiceImport> {
  const rowIndex = args.sourceRowIndex ?? -1;
  const existing = await getImportByHash(args.fileHash, rowIndex);
  if (existing) throw new DuplicateImportError(existing.id);

  const [row] = await db
    .insert(invoiceImports)
    .values({
      sourceType: args.sourceType,
      sourceFilename: args.sourceFilename,
      fileHash: args.fileHash,
      sourceRowIndex: rowIndex,
      fileUrl: args.fileUrl,
      filePath: args.filePath,
      parsedDraft: args.parsedDraft ?? null,
      confidence: args.confidence ?? null,
      warnings: args.warnings ? [...args.warnings] : null,
      createdByUserId: args.createdByUserId,
    })
    .returning();
  if (!row) throw new Error('Failed to insert invoice import');
  return row;
}

type CreateManyImportsArgs = {
  readonly sourceType: NewInvoiceImport['sourceType'];
  readonly sourceFilename: string;
  readonly fileHash: string;
  readonly fileUrl: string | null;
  readonly filePath: string | null;
  readonly rows: readonly {
    readonly sourceRowIndex: number;
    readonly parsedDraft: NewInvoiceImport['parsedDraft'];
    readonly warnings: readonly string[];
  }[];
  readonly createdByUserId: string | null;
};

export async function createManyImports(
  args: CreateManyImportsArgs,
): Promise<readonly InvoiceImport[]> {
  if (args.rows.length === 0) return [];
  const values = args.rows.map((r) => ({
    sourceType: args.sourceType,
    sourceFilename: args.sourceFilename,
    fileHash: args.fileHash,
    sourceRowIndex: r.sourceRowIndex,
    fileUrl: args.fileUrl,
    filePath: args.filePath,
    parsedDraft: r.parsedDraft,
    warnings: r.warnings.length > 0 ? [...r.warnings] : null,
    createdByUserId: args.createdByUserId,
  }));
  return db
    .insert(invoiceImports)
    .values(values)
    .onConflictDoNothing({
      target: [invoiceImports.fileHash, invoiceImports.sourceRowIndex],
    })
    .returning();
}

export async function approveImport(
  id: number,
  finalDraft: ApproveImportInput,
  createdByUserId: string | null,
): Promise<{ readonly importId: number; readonly invoiceId: number }> {
  const existing = await getImport(id);
  if (!existing) throw new Error('Import no encontrado');
  if (existing.status !== 'pending') throw new Error('Este import ya fue revisado');

  const invoice = await createInvoice({
    ...draftToInvoiceInsert(finalDraft, createdByUserId),
    fileUrl: existing.fileUrl,
    filePath: existing.filePath,
  });

  await db
    .update(invoiceImports)
    .set({
      status: 'approved',
      invoiceId: invoice.id,
      reviewedAt: new Date(),
    })
    .where(and(eq(invoiceImports.id, id), eq(invoiceImports.status, 'pending')));

  return { importId: id, invoiceId: invoice.id };
}

export async function rejectImport(id: number): Promise<void> {
  await db
    .update(invoiceImports)
    .set({ status: 'rejected', reviewedAt: new Date() })
    .where(and(eq(invoiceImports.id, id), eq(invoiceImports.status, 'pending')));
}

export async function countPendingImports(): Promise<number> {
  const rows = await db
    .select({ id: invoiceImports.id })
    .from(invoiceImports)
    .where(eq(invoiceImports.status, 'pending'));
  return rows.length;
}

// Re-export for server actions that need to check generated invoice existence.
export { invoices };
