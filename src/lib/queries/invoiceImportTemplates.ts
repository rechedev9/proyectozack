import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceImportTemplates } from '@/db/schema';
import type { ColumnMapping } from '@/lib/parsers/common';
import type { InvoiceDraftSource } from '@/lib/schemas/invoiceDraft';

export type ImportTemplate = {
  readonly id: number;
  readonly name: string;
  readonly sourceType: InvoiceDraftSource;
  readonly columnMapping: ColumnMapping;
  readonly sampleHeaders: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

function rowToTemplate(row: {
  readonly id: number;
  readonly name: string;
  readonly sourceType: InvoiceDraftSource;
  readonly columnMapping: unknown;
  readonly sampleHeaders: unknown;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): ImportTemplate {
  return {
    id: row.id,
    name: row.name,
    sourceType: row.sourceType,
    columnMapping: row.columnMapping as ColumnMapping,
    sampleHeaders: row.sampleHeaders as readonly string[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listTemplates(
  sourceType?: InvoiceDraftSource,
): Promise<readonly ImportTemplate[]> {
  const rows = await db
    .select()
    .from(invoiceImportTemplates)
    .where(sourceType ? eq(invoiceImportTemplates.sourceType, sourceType) : undefined)
    .orderBy(desc(invoiceImportTemplates.updatedAt));
  return rows.map(rowToTemplate);
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function headersOverlap(a: readonly string[], b: readonly string[]): number {
  const normA = new Set(a.map(normalize).filter(Boolean));
  if (normA.size === 0) return 0;
  const normB = new Set(b.map(normalize).filter(Boolean));
  let matches = 0;
  for (const h of normA) if (normB.has(h)) matches += 1;
  return matches / normA.size;
}

/**
 * Find the best-matching template for a given source + headers.
 * Returns null if no template overlaps >= 70% of the incoming headers.
 */
export async function findTemplateBySignature(
  sourceType: InvoiceDraftSource,
  headers: readonly string[],
): Promise<ImportTemplate | null> {
  const templates = await listTemplates(sourceType);
  let best: { template: ImportTemplate; score: number } | null = null;
  for (const t of templates) {
    const score = headersOverlap(headers, t.sampleHeaders);
    if (score > (best?.score ?? 0)) best = { template: t, score };
  }
  return best && best.score >= 0.7 ? best.template : null;
}

type UpsertTemplateArgs = {
  readonly name: string;
  readonly sourceType: InvoiceDraftSource;
  readonly columnMapping: ColumnMapping;
  readonly sampleHeaders: readonly string[];
};

export async function upsertTemplate(args: UpsertTemplateArgs): Promise<ImportTemplate> {
  const [row] = await db
    .insert(invoiceImportTemplates)
    .values({
      name: args.name,
      sourceType: args.sourceType,
      columnMapping: args.columnMapping,
      sampleHeaders: [...args.sampleHeaders],
    })
    .onConflictDoUpdate({
      target: [invoiceImportTemplates.sourceType, invoiceImportTemplates.name],
      set: {
        columnMapping: args.columnMapping,
        sampleHeaders: [...args.sampleHeaders],
        updatedAt: sql`now()`,
      },
    })
    .returning();
  if (!row) throw new Error('Failed to upsert import template');
  return rowToTemplate(row);
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.delete(invoiceImportTemplates).where(and(eq(invoiceImportTemplates.id, id)));
}
