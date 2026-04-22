import { read, utils } from 'xlsx';
import type { SheetExtract } from './common';

/**
 * Extract the first sheet of an XLSX workbook as headers + rows of strings.
 * Dates are rendered as ISO (yyyy-mm-dd) when the cell is a native date.
 * Numeric cells are stringified with "." as decimal separator (Excel internal).
 */
export function extractXlsxSheet(buffer: ArrayBuffer | Buffer | Uint8Array): SheetExtract {
  const wb = read(buffer, { type: 'array', cellDates: true });
  const firstName = wb.SheetNames[0];
  if (!firstName) return { headers: [], rows: [] };
  const sheet = wb.Sheets[firstName];
  if (!sheet) return { headers: [], rows: [] };

  const rows = utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd',
    defval: '',
  });

  const [headerRow, ...bodyRows] = rows;
  if (!headerRow) return { headers: [], rows: [] };

  const headers = (headerRow as unknown[]).map((h) => (h == null ? '' : String(h).trim()));
  const body = bodyRows.map((r) => (r as unknown[]).map((cell) => (cell == null ? '' : String(cell))));

  return { headers, rows: body };
}
