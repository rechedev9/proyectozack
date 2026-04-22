import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { listInvoices } from '@/lib/queries/invoices';
import {
  buildModelo130Csv,
  buildModelo303Csv,
  buildModelo347Csv,
  quarterRange,
  yearRange,
  type Quarter,
} from '@/lib/exports/fiscal';

const MODELOS = ['303', '130', '347'] as const;
type Modelo = (typeof MODELOS)[number];

function parseQuarter(raw: string | null): Quarter | null {
  if (!raw) return null;
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

function parseYear(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 2000 && n <= 2100) return n;
  return null;
}

export async function GET(request: Request): Promise<Response> {
  await requireRole('admin', '/admin/login');

  const url = new URL(request.url);
  const modelo = url.searchParams.get('modelo');
  const year = parseYear(url.searchParams.get('year'));
  const quarter = parseQuarter(url.searchParams.get('quarter'));

  if (!modelo || !(MODELOS as readonly string[]).includes(modelo)) {
    return NextResponse.json({ error: 'modelo inválido (303|130|347)' }, { status: 400 });
  }
  if (!year) return NextResponse.json({ error: 'year inválido' }, { status: 400 });

  const m = modelo as Modelo;
  const needsQuarter = m === '303' || m === '130';
  if (needsQuarter && !quarter) {
    return NextResponse.json({ error: 'quarter requerido (1-4)' }, { status: 400 });
  }

  const range = needsQuarter && quarter ? quarterRange(year, quarter) : yearRange(year);
  const invoices = await listInvoices({ from: range.from, to: range.to });

  let csv: string;
  let filename: string;
  if (m === '303' && quarter) {
    csv = buildModelo303Csv({ invoices, year, quarter });
    filename = `modelo-303-${year}-T${quarter}.csv`;
  } else if (m === '130' && quarter) {
    // 130 es acumulado YTD — necesitamos todo el año hasta el fin del trimestre.
    const ytd = await listInvoices({ from: `${year}-01-01`, to: quarterRange(year, quarter).to });
    csv = buildModelo130Csv({ invoices: ytd, year, quarter });
    filename = `modelo-130-${year}-T${quarter}.csv`;
  } else {
    csv = buildModelo347Csv({ invoices, year });
    filename = `modelo-347-${year}.csv`;
  }

  // UTF-8 BOM so Excel opens it with accents intact.
  const body = '﻿' + csv;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
