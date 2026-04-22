import type { InvoiceWithRelations } from '@/types';

// ---- CSV writer helpers ----

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return '';
  const str = typeof value === 'number' ? value.toFixed(2) : String(value);
  if (/[",;\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows: readonly (readonly (string | number | null | undefined)[])[]): string {
  return rows.map((r) => r.map(csvEscape).join(';')).join('\r\n') + '\r\n';
}

// ---- Domain helpers ----

export type Quarter = 1 | 2 | 3 | 4;

type DateRange = { readonly from: string; readonly to: string };

export function quarterRange(year: number, quarter: Quarter): DateRange {
  const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
  const endMonth = startMonth + 2; // 2, 5, 8, 11
  const lastDay = new Date(year, endMonth + 1, 0).getDate();
  return {
    from: `${year}-${String(startMonth + 1).padStart(2, '0')}-01`,
    to: `${year}-${String(endMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function yearRange(year: number): DateRange {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function isActive(inv: InvoiceWithRelations): boolean {
  return inv.status !== 'anulada';
}

function n(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const x = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(x) ? x : 0;
}

// ---- Modelo 303 (IVA trimestral) ----

export function buildModelo303Csv(args: {
  readonly invoices: readonly InvoiceWithRelations[];
  readonly year: number;
  readonly quarter: Quarter;
}): string {
  const { invoices, year, quarter } = args;
  const active = invoices.filter(isActive);

  // Group by vatPct (0, 4, 10, 21) and kind.
  type Bucket = { base: number; cuota: number };
  const repercutido = new Map<string, Bucket>();
  const soportado = new Map<string, Bucket>();

  for (const inv of active) {
    const net = n(inv.netAmount);
    const vat = n(inv.vatPct);
    const cuota = net * (vat / 100);
    const key = vat.toFixed(2);
    const target = inv.kind === 'income' ? repercutido : soportado;
    const existing = target.get(key) ?? { base: 0, cuota: 0 };
    target.set(key, { base: existing.base + net, cuota: existing.cuota + cuota });
  }

  const header: (string | number)[][] = [
    [`Modelo 303 — IVA trimestral ${year} T${quarter}`],
    [],
    ['IVA repercutido (ingresos)'],
    ['Tipo IVA (%)', 'Base imponible', 'Cuota IVA'],
  ];
  const repRows: (string | number)[][] = [];
  let totalBaseRep = 0;
  let totalCuotaRep = 0;
  for (const [vat, b] of [...repercutido.entries()].sort()) {
    repRows.push([vat, b.base.toFixed(2), b.cuota.toFixed(2)]);
    totalBaseRep += b.base;
    totalCuotaRep += b.cuota;
  }
  repRows.push(['TOTAL', totalBaseRep.toFixed(2), totalCuotaRep.toFixed(2)]);

  const sopHeader: (string | number)[][] = [
    [],
    ['IVA soportado (gastos deducibles)'],
    ['Tipo IVA (%)', 'Base imponible', 'Cuota IVA'],
  ];
  const sopRows: (string | number)[][] = [];
  let totalBaseSop = 0;
  let totalCuotaSop = 0;
  for (const [vat, b] of [...soportado.entries()].sort()) {
    sopRows.push([vat, b.base.toFixed(2), b.cuota.toFixed(2)]);
    totalBaseSop += b.base;
    totalCuotaSop += b.cuota;
  }
  sopRows.push(['TOTAL', totalBaseSop.toFixed(2), totalCuotaSop.toFixed(2)]);

  const resultado = totalCuotaRep - totalCuotaSop;
  const resumen: (string | number)[][] = [
    [],
    ['Resumen'],
    ['Cuota repercutida', totalCuotaRep.toFixed(2)],
    ['Cuota soportada', totalCuotaSop.toFixed(2)],
    ['Resultado (a ingresar si > 0)', resultado.toFixed(2)],
  ];

  return toCsv([...header, ...repRows, ...sopHeader, ...sopRows, ...resumen]);
}

// ---- Modelo 130 (IRPF pago fraccionado trimestral) ----

export function buildModelo130Csv(args: {
  readonly invoices: readonly InvoiceWithRelations[];
  readonly year: number;
  readonly quarter: Quarter;
}): string {
  const { invoices, year, quarter } = args;
  const active = invoices.filter(isActive);

  // Acumulado desde enero hasta el fin del trimestre.
  const cutoff = quarterRange(year, quarter).to;
  const yearStart = `${year}-01-01`;
  const inYearUntil = active.filter((i) => i.issueDate >= yearStart && i.issueDate <= cutoff);

  let ingresos = 0;
  let gastos = 0;
  let retencionesSoportadas = 0;

  for (const inv of inYearUntil) {
    if (inv.kind === 'income') {
      ingresos += n(inv.netAmount);
      retencionesSoportadas += n(inv.netAmount) * (n(inv.withholdingPct) / 100);
    } else {
      gastos += n(inv.netAmount);
    }
  }

  const rendimiento = ingresos - gastos;
  // Pago fraccionado: 20% del rendimiento acumulado.
  // (En el modelo real se restan pagos previos y retenciones acumuladas — aquí lo dejamos
  // como referencia bruta; el contable lo afina.)
  const pago = rendimiento > 0 ? rendimiento * 0.2 : 0;

  const rows: (string | number)[][] = [
    [`Modelo 130 — IRPF pago fraccionado ${year} T${quarter} (acumulado)`],
    [],
    ['Concepto', 'Importe (EUR)'],
    ['Ingresos computables acumulados', ingresos.toFixed(2)],
    ['Gastos deducibles acumulados', gastos.toFixed(2)],
    ['Rendimiento neto acumulado', rendimiento.toFixed(2)],
    ['Retenciones soportadas acumuladas', retencionesSoportadas.toFixed(2)],
    ['Pago fraccionado bruto (20%)', pago.toFixed(2)],
    ['Pago fraccionado tras retenciones', Math.max(0, pago - retencionesSoportadas).toFixed(2)],
    [],
    ['Ajustar en AEAT restando pagos fraccionados de trimestres previos.'],
  ];
  return toCsv(rows);
}

// ---- Modelo 347 (operaciones con terceros > 3.005,06€) ----

const THRESHOLD_347 = 3005.06;

export function buildModelo347Csv(args: {
  readonly invoices: readonly InvoiceWithRelations[];
  readonly year: number;
}): string {
  const { invoices, year } = args;
  const active = invoices.filter(isActive);

  // Agrupar por contraparte (brandName > talentName > counterpartyName).
  type Bucket = { name: string; nif: string; total: number; kind: 'income' | 'expense' | 'mixed' };
  const byParty = new Map<string, Bucket>();

  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  for (const inv of active) {
    if (inv.issueDate < yearStart || inv.issueDate > yearEnd) continue;
    const name = inv.brandName ?? inv.talentName ?? inv.counterpartyName ?? 'SIN NOMBRE';
    const key = name.toLowerCase().trim();
    const amount = n(inv.totalAmount);
    const existing = byParty.get(key);
    if (!existing) {
      byParty.set(key, { name, nif: '', total: amount, kind: inv.kind });
    } else {
      existing.total += amount;
      if (existing.kind !== inv.kind) existing.kind = 'mixed';
    }
  }

  const rows: (string | number)[][] = [
    [`Modelo 347 — Operaciones con terceros ${year}`],
    [`Umbral: ${THRESHOLD_347.toFixed(2)} EUR (IVA incluido)`],
    [],
    ['Contraparte', 'Tipo', 'Total anual (EUR)'],
  ];

  const above = [...byParty.values()]
    .filter((b) => b.total > THRESHOLD_347)
    .sort((a, b) => b.total - a.total);

  for (const b of above) {
    const tipo = b.kind === 'income' ? 'Cliente' : b.kind === 'expense' ? 'Proveedor' : 'Mixto';
    rows.push([b.name, tipo, b.total.toFixed(2)]);
  }
  if (above.length === 0) {
    rows.push(['Sin contrapartes por encima del umbral', '', '']);
  }

  return toCsv(rows);
}
