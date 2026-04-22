import type { SheetExtract } from './common';

/**
 * RFC-4180-ish CSV parser. Handles quoted fields, embedded commas,
 * escaped quotes ("") and CRLF/LF line endings. Delimiter is auto-detected
 * between ',' and ';' based on the header line.
 */
export function extractCsvSheet(text: string): SheetExtract {
  if (!text) return { headers: [], rows: [] };

  // Strip UTF-8 BOM if present.
  const content = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const delimiter = detectDelimiter(content);
  const records = parseCsv(content, delimiter);
  if (records.length === 0) return { headers: [], rows: [] };

  const [headerRow, ...body] = records;
  const headers = (headerRow ?? []).map((h) => h.trim());
  return { headers, rows: body };
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

function parseCsv(text: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      current.push(field);
      field = '';
      continue;
    }
    if (ch === '\r') {
      if (text[i + 1] === '\n') i += 1;
      current.push(field);
      records.push(current);
      current = [];
      field = '';
      continue;
    }
    if (ch === '\n') {
      current.push(field);
      records.push(current);
      current = [];
      field = '';
      continue;
    }
    field += ch;
  }

  // Flush trailing field/record.
  if (field !== '' || current.length > 0) {
    current.push(field);
    records.push(current);
  }

  // Drop fully empty records (trailing newline).
  return records.filter((rec) => rec.some((cell) => cell !== ''));
}
