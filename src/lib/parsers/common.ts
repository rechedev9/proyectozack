import type { InvoiceDraft, InvoiceDraftSource } from '@/lib/schemas/invoiceDraft';

export type SheetExtract = {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
};

export const MAPPABLE_FIELDS = [
  'issueDate',
  'dueDate',
  'number',
  'concept',
  'netAmount',
  'totalAmount',
  'vatPct',
  'counterpartyName',
  'issuerNif',
  'issuerName',
  'category',
] as const;

export type MappableField = (typeof MAPPABLE_FIELDS)[number];

// Column index (0-based) per draft field. null = field not mapped for this template.
export type ColumnMapping = Partial<Record<MappableField, number>>;

const FIELD_HINTS: Record<MappableField, readonly string[]> = {
  issueDate: ['fecha', 'fecha emision', 'fecha emisión', 'issue date', 'date', 'created'],
  dueDate: ['vencimiento', 'due', 'due date', 'fecha vencimiento'],
  number: ['numero', 'número', 'nº', 'number', 'invoice number', 'factura', 'ref', 'referencia', 'id'],
  concept: ['concepto', 'description', 'descripcion', 'descripción', 'detalle', 'item', 'producto', 'memo'],
  netAmount: ['neto', 'base', 'base imponible', 'net', 'subtotal', 'importe', 'amount', 'gross amount'],
  totalAmount: ['total', 'importe total', 'total amount', 'gran total'],
  vatPct: ['iva', 'iva %', 'vat', 'vat %', 'tax', 'tax %'],
  counterpartyName: ['cliente', 'customer', 'proveedor', 'supplier', 'razon social', 'razón social', 'nombre'],
  issuerNif: ['nif', 'cif', 'vat number', 'tax id', 'identificacion fiscal', 'identificación fiscal'],
  issuerName: ['emisor', 'issuer', 'from', 'empresa'],
  category: ['categoria', 'categoría', 'category', 'tipo', 'type'],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function suggestMapping(headers: readonly string[]): ColumnMapping {
  const normalizedHeaders = headers.map(normalize);
  const mapping: ColumnMapping = {};
  for (const field of MAPPABLE_FIELDS) {
    const hints = FIELD_HINTS[field].map(normalize);
    let bestIdx = -1;
    let bestScore = 0;
    for (let i = 0; i < normalizedHeaders.length; i += 1) {
      const h = normalizedHeaders[i];
      if (!h) continue;
      for (const hint of hints) {
        let score = 0;
        if (h === hint) score = 3;
        else if (h.startsWith(hint) || hint.startsWith(h)) score = 2;
        else if (h.includes(hint)) score = 1;
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }
    }
    if (bestIdx >= 0) mapping[field] = bestIdx;
  }
  return mapping;
}

const ES_DATE_RX = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/;
const ISO_DATE_RX = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseAnyDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = ISO_DATE_RX.exec(trimmed);
  if (iso && iso[1] && iso[2] && iso[3]) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }
  const es = ES_DATE_RX.exec(trimmed);
  if (es && es[1] && es[2] && es[3]) {
    const [, d, m, y] = es;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

/**
 * Parse a number written in ES format (1.234,56) or EN format (1,234.56 / 1234.56).
 * Chooses the decimal separator heuristically by looking at which separator
 * appears last. Strips currency symbols and spaces.
 */
export function parseEsNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[€$£\s]/g, '').trim();
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized = cleaned;
  if (lastComma === -1 && lastDot === -1) {
    // pure digits (or with sign)
  } else if (lastComma > lastDot) {
    // comma is decimal separator → ES-style
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // dot is decimal separator → EN-style; drop thousands commas
    normalized = cleaned.replace(/,/g, '');
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

type ApplyMappingArgs = {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly mapping: ColumnMapping;
  readonly kind: 'income' | 'expense';
  readonly source: InvoiceDraftSource;
  readonly defaultVatPct?: number;
};

export type DraftWithWarnings = {
  readonly draft: Partial<InvoiceDraft>;
  readonly warnings: readonly string[];
};

function cellAt(row: readonly string[], idx: number | undefined): string {
  if (idx == null || idx < 0 || idx >= row.length) return '';
  return (row[idx] ?? '').toString().trim();
}

export function applyMapping(args: ApplyMappingArgs): readonly DraftWithWarnings[] {
  const { rows, mapping, kind, source, defaultVatPct } = args;
  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) => {
      const warnings: string[] = [];

      const rawIssueDate = cellAt(row, mapping.issueDate);
      const issueDate = rawIssueDate ? parseAnyDate(rawIssueDate) : null;
      if (rawIssueDate && !issueDate) warnings.push(`Fecha emisión no reconocida: "${rawIssueDate}"`);

      const rawDueDate = cellAt(row, mapping.dueDate);
      const dueDate = rawDueDate ? parseAnyDate(rawDueDate) : null;
      if (rawDueDate && !dueDate) warnings.push(`Vencimiento no reconocido: "${rawDueDate}"`);

      const rawNet = cellAt(row, mapping.netAmount);
      const netAmount = rawNet ? parseEsNumber(rawNet) : null;
      if (rawNet && netAmount == null) warnings.push(`Importe neto no reconocido: "${rawNet}"`);

      const rawTotal = cellAt(row, mapping.totalAmount);
      const totalAmount = rawTotal ? parseEsNumber(rawTotal) : null;
      if (rawTotal && totalAmount == null) warnings.push(`Total no reconocido: "${rawTotal}"`);

      const rawVat = cellAt(row, mapping.vatPct);
      const vatPct = rawVat ? parseEsNumber(rawVat) : null;

      // Derive net from total if only total is present (assuming vat = default).
      let derivedNet = netAmount;
      let derivedTotal = totalAmount;
      const effectiveVat = vatPct ?? defaultVatPct ?? 21;
      if (derivedNet == null && derivedTotal != null) {
        derivedNet = derivedTotal / (1 + effectiveVat / 100);
      } else if (derivedTotal == null && derivedNet != null) {
        derivedTotal = derivedNet * (1 + effectiveVat / 100);
      }

      const concept = cellAt(row, mapping.concept);
      if (!concept) warnings.push('Concepto vacío');

      const numberStr = cellAt(row, mapping.number);
      const counterpartyName = cellAt(row, mapping.counterpartyName);
      const issuerNif = cellAt(row, mapping.issuerNif);
      const issuerName = cellAt(row, mapping.issuerName);
      const category = cellAt(row, mapping.category);

      const draft: Partial<InvoiceDraft> = {
        source,
        kind,
        ...(concept ? { concept } : {}),
        ...(numberStr ? { number: numberStr } : {}),
        ...(issueDate ? { issueDate } : {}),
        ...(dueDate ? { dueDate } : {}),
        ...(derivedNet != null ? { netAmount: formatMoney(derivedNet) } : {}),
        ...(derivedTotal != null ? { totalAmount: formatMoney(derivedTotal) } : {}),
        ...(vatPct != null ? { vatPct: formatMoney(vatPct) } : {}),
        ...(counterpartyName ? { counterpartyName } : {}),
        ...(issuerNif ? { issuerNif } : {}),
        ...(issuerName ? { issuerName } : {}),
        ...(category ? { category } : {}),
      };

      return { draft, warnings };
    });
}
