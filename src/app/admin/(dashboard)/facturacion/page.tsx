import { db } from '@/lib/db';
import { crmBrands, talents } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { listInvoices, getInvoiceSummary, getUsedInvoiceCategories } from '@/lib/queries/invoices';
import { InvoicesManager } from '@/components/admin/invoices/InvoicesManager';

function formatMoney(n: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function monthRange(): { from: string; to: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const last = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(last).padStart(2, '0')}`,
    label: now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
  };
}

export default async function AdminInvoicesPage(): Promise<React.ReactElement> {
  const month = monthRange();

  const [invoices, summaryMonth, summaryYTD, brandsList, talentsList, categories] = await Promise.all([
    listInvoices(),
    getInvoiceSummary(month.from, month.to),
    getInvoiceSummary(`${new Date().getFullYear()}-01-01`),
    db.select({ id: crmBrands.id, name: crmBrands.name }).from(crmBrands).orderBy(asc(crmBrands.name)),
    db.select({ id: talents.id, name: talents.name }).from(talents).orderBy(asc(talents.name)),
    getUsedInvoiceCategories(),
  ]);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-display text-4xl font-black uppercase text-sp-admin-text">Facturación</h1>
        <p className="text-xs text-sp-admin-muted uppercase tracking-wider">Vista mensual: {month.label}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Ingresos del mes" value={formatMoney(summaryMonth.incomeTotal)} accent="emerald" />
        <KpiCard label="Gastos del mes" value={formatMoney(summaryMonth.expenseTotal)} accent="amber" />
        <KpiCard label="Neto del mes" value={formatMoney(summaryMonth.netTotal)} accent={summaryMonth.netTotal >= 0 ? 'emerald' : 'red'} />
        <KpiCard label="Pendiente cobro" value={formatMoney(summaryMonth.pendingIncome)} sub={summaryMonth.overdueIncome > 0 ? `${formatMoney(summaryMonth.overdueIncome)} vencido` : undefined} accent="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Ingresos YTD" value={formatMoney(summaryYTD.incomeTotal)} accent="emerald" small />
        <KpiCard label="Gastos YTD" value={formatMoney(summaryYTD.expenseTotal)} accent="amber" small />
        <KpiCard label="Neto YTD" value={formatMoney(summaryYTD.netTotal)} accent={summaryYTD.netTotal >= 0 ? 'emerald' : 'red'} small />
      </div>

      <InvoicesManager
        invoices={invoices}
        brands={brandsList}
        talents={talentsList}
        categories={categories}
      />
    </div>
  );
}

function KpiCard({ label, value, sub, accent, small = false }: { readonly label: string; readonly value: string; readonly sub?: string | undefined; readonly accent: 'emerald' | 'amber' | 'red' | 'blue'; readonly small?: boolean }): React.ReactElement {
  const accentColor = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }[accent];
  return (
    <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border p-5">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-sp-admin-muted mb-2">{label}</p>
      <p className={`font-display ${small ? 'text-2xl' : 'text-3xl'} font-black ${accentColor} tabular-nums`}>{value}</p>
      {sub && <p className="text-[10px] uppercase tracking-wider text-red-400 mt-1">{sub}</p>}
    </div>
  );
}
