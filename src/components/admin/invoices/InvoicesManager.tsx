'use client';

import { useActionState, useMemo, useState, useTransition } from 'react';
import {
  createInvoiceAction,
  updateInvoiceAction,
  deleteInvoiceAction,
  markInvoicePaidAction,
} from '@/app/admin/(dashboard)/facturacion/invoices-actions';
import type { InvoiceWithRelations, InvoiceKind, InvoiceStatus } from '@/types';
import { INVOICE_STATUSES } from '@/lib/schemas/invoice';

type BrandOption = { readonly id: number; readonly name: string };
type TalentOption = { readonly id: number; readonly name: string };

const KIND_LABELS: Record<InvoiceKind, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  borrador: 'Borrador',
  emitida: 'Emitida',
  cobrada: 'Cobrada',
  vencida: 'Vencida',
  anulada: 'Anulada',
};

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  borrador: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  emitida: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cobrada: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  vencida: 'bg-red-500/15 text-red-400 border-red-500/30',
  anulada: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

const INPUT = 'w-full rounded-xl border border-sp-admin-border bg-sp-admin-bg px-3 py-2 text-sm text-sp-admin-text outline-none focus:border-sp-admin-accent transition-colors';
const LABEL = 'block text-[11px] uppercase tracking-wider font-semibold text-sp-admin-muted mb-1';
const BTN_PRIMARY = 'px-4 py-2 rounded-full text-sm font-bold text-sp-admin-bg bg-sp-admin-accent hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer';
const BTN_GHOST = 'px-3 py-1.5 rounded-full text-xs font-semibold text-sp-admin-muted hover:text-sp-admin-text hover:bg-sp-admin-hover transition-colors cursor-pointer';

type InvoicesManagerProps = {
  readonly invoices: readonly InvoiceWithRelations[];
  readonly brands: readonly BrandOption[];
  readonly talents: readonly TalentOption[];
  readonly categories: readonly string[];
};

function formatMoney(amount: string | number, currency: string): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES');
}

export function InvoicesManager({ invoices, brands, talents, categories }: InvoicesManagerProps): React.ReactElement {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filterKind, setFilterKind] = useState<'all' | InvoiceKind>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = invoices;
    if (filterKind !== 'all') result = result.filter((i) => i.kind === filterKind);
    if (filterStatus !== 'all') result = result.filter((i) => i.status === filterStatus);
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (i) =>
          i.concept.toLowerCase().includes(q) ||
          (i.number ?? '').toLowerCase().includes(q) ||
          (i.brandName ?? '').toLowerCase().includes(q) ||
          (i.talentName ?? '').toLowerCase().includes(q) ||
          (i.counterpartyName ?? '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [invoices, filterKind, filterStatus, search]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar por concepto, número, contraparte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} w-72`}
          />
          <select value={filterKind} onChange={(e) => setFilterKind(e.target.value as 'all' | InvoiceKind)} className={INPUT}>
            <option value="all">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | InvoiceStatus)} className={INPUT}>
            <option value="all">Todos los estados</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={() => setShowCreate((v) => !v)} className={BTN_PRIMARY}>
          {showCreate ? 'Cancelar' : '+ Nueva factura'}
        </button>
      </div>

      {showCreate && (
        <InvoiceForm
          mode="create"
          brands={brands}
          talents={talents}
          categories={categories}
          onDone={() => setShowCreate(false)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sp-admin-border p-12 text-center">
          <p className="text-sm text-sp-admin-muted">
            {invoices.length === 0
              ? 'No hay facturas registradas todavía. Crea la primera para empezar tu contabilidad.'
              : 'Ninguna factura coincide con los filtros activos.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Nº</th>
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Concepto</th>
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Contraparte</th>
                <th className="text-right px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-sp-admin-muted text-[11px] uppercase tracking-wider">PDF</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <InvoiceRow
                  key={inv.id}
                  invoice={inv}
                  brands={brands}
                  talents={talents}
                  categories={categories}
                  isEditing={editingId === inv.id}
                  onEdit={() => setEditingId(editingId === inv.id ? null : inv.id)}
                  onCloseEdit={() => setEditingId(null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type InvoiceRowProps = {
  readonly invoice: InvoiceWithRelations;
  readonly brands: readonly BrandOption[];
  readonly talents: readonly TalentOption[];
  readonly categories: readonly string[];
  readonly isEditing: boolean;
  readonly onEdit: () => void;
  readonly onCloseEdit: () => void;
};

function InvoiceRow({ invoice, brands, talents, categories, isEditing, onEdit, onCloseEdit }: InvoiceRowProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const counterparty = invoice.brandName ?? invoice.talentName ?? invoice.counterpartyName ?? '—';

  const onDelete = (): void => {
    if (!confirm(`¿Eliminar factura "${invoice.concept}"?`)) return;
    startTransition(async () => {
      await deleteInvoiceAction(invoice.id);
    });
  };

  const onMarkPaid = (): void => {
    startTransition(async () => {
      await markInvoicePaidAction(invoice.id);
    });
  };

  return (
    <>
      <tr className={`border-b border-sp-admin-border/50 last:border-0 hover:bg-sp-admin-hover transition-colors ${isEditing ? 'bg-sp-admin-hover/40' : ''}`}>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${invoice.kind === 'income' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
            {KIND_LABELS[invoice.kind]}
          </span>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-sp-admin-muted">{invoice.number ?? '—'}</td>
        <td className="px-4 py-3 text-sp-admin-muted text-xs">{formatDate(invoice.issueDate)}</td>
        <td className="px-4 py-3 text-sp-admin-text">
          <p className="line-clamp-1 max-w-xs">{invoice.concept}</p>
          {invoice.category && <p className="text-[10px] uppercase tracking-wider text-sp-admin-muted mt-0.5">{invoice.category}</p>}
        </td>
        <td className="px-4 py-3 text-sp-admin-muted">{counterparty}</td>
        <td className={`px-4 py-3 text-right font-semibold tabular-nums ${invoice.kind === 'income' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {invoice.kind === 'expense' ? '-' : ''}{formatMoney(invoice.totalAmount, invoice.currency)}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[invoice.status]}`}>
            {STATUS_LABELS[invoice.status]}
          </span>
        </td>
        <td className="px-4 py-3">
          {invoice.fileUrl ? (
            <a href={invoice.fileUrl} target="_blank" rel="noreferrer" className="text-sp-admin-accent hover:underline text-xs">Ver</a>
          ) : (
            <span className="text-xs text-sp-admin-muted">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          {invoice.kind === 'income' && invoice.status === 'emitida' && (
            <button type="button" onClick={onMarkPaid} disabled={isPending} className="px-2 py-1 rounded text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 cursor-pointer">
              Cobrada
            </button>
          )}
          <button type="button" onClick={onEdit} className={BTN_GHOST}>Editar</button>
          <button type="button" onClick={onDelete} disabled={isPending} className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer">Borrar</button>
        </td>
      </tr>
      {isEditing && (
        <tr className="bg-sp-admin-bg/40">
          <td colSpan={9} className="px-4 py-5">
            <InvoiceForm
              mode="edit"
              invoice={invoice}
              brands={brands}
              talents={talents}
              categories={categories}
              onDone={onCloseEdit}
            />
          </td>
        </tr>
      )}
    </>
  );
}

type InvoiceFormProps =
  | {
      readonly mode: 'create';
      readonly invoice?: undefined;
      readonly brands: readonly BrandOption[];
      readonly talents: readonly TalentOption[];
      readonly categories: readonly string[];
      readonly onDone: () => void;
    }
  | {
      readonly mode: 'edit';
      readonly invoice: InvoiceWithRelations;
      readonly brands: readonly BrandOption[];
      readonly talents: readonly TalentOption[];
      readonly categories: readonly string[];
      readonly onDone: () => void;
    };

function InvoiceForm({ mode, invoice, brands, talents, categories, onDone }: InvoiceFormProps): React.ReactElement {
  const action = mode === 'create' ? createInvoiceAction : updateInvoiceAction;
  const [state, formAction, isPending] = useActionState(action, {});

  const [net, setNet] = useState(invoice?.netAmount ?? '0.00');
  const [vat, setVat] = useState(invoice?.vatPct ?? '21.00');

  const total = useMemo(() => {
    const n = Number(net);
    const v = Number(vat);
    if (Number.isNaN(n) || Number.isNaN(v)) return '0.00';
    return (n * (1 + v / 100)).toFixed(2);
  }, [net, vat]);

  if (state.success && !isPending) {
    setTimeout(onDone, 0);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="rounded-2xl bg-sp-admin-card border border-sp-admin-border p-5 space-y-4" encType="multipart/form-data">
      <h3 className="font-bold text-sp-admin-text text-sm">
        {mode === 'create' ? 'Nueva factura' : `Editar factura ${invoice.number ?? `#${invoice.id}`}`}
      </h3>
      {mode === 'edit' && <input type="hidden" name="id" value={invoice.id} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={LABEL}>Tipo *</label>
          <select name="kind" defaultValue={invoice?.kind ?? 'income'} required className={INPUT}>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Nº factura</label>
          <input name="number" defaultValue={invoice?.number ?? ''} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Fecha emisión *</label>
          <input name="issueDate" type="date" required defaultValue={invoice?.issueDate ?? today} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Vencimiento</label>
          <input name="dueDate" type="date" defaultValue={invoice?.dueDate ?? ''} className={INPUT} />
        </div>

        <div className="md:col-span-2">
          <label className={LABEL}>Concepto *</label>
          <input name="concept" required defaultValue={invoice?.concept ?? ''} placeholder="Campaña abril, comisión casino X..." className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Categoría</label>
          <input name="category" list="invoice-categories" defaultValue={invoice?.category ?? ''} placeholder="casino-deal, cs2-cajas..." className={INPUT} />
          <datalist id="invoice-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className={LABEL}>Estado</label>
          <select name="status" defaultValue={invoice?.status ?? 'borrador'} className={INPUT}>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL}>Marca CRM</label>
          <select name="brandId" defaultValue={invoice?.brandId ?? ''} className={INPUT}>
            <option value="">— ninguna —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Talent</label>
          <select name="talentId" defaultValue={invoice?.talentId ?? ''} className={INPUT}>
            <option value="">— ninguno —</option>
            {talents.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={LABEL}>O nombre libre (si no está en CRM)</label>
          <input name="counterpartyName" defaultValue={invoice?.counterpartyName ?? ''} className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Neto *</label>
          <input name="netAmount" type="number" step="0.01" min="0" required value={net} onChange={(e) => setNet(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>IVA %</label>
          <input name="vatPct" type="number" step="0.01" min="0" value={vat} onChange={(e) => setVat(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Total</label>
          <input name="totalAmount" type="number" step="0.01" min="0" value={total} readOnly className={`${INPUT} bg-sp-admin-card`} />
        </div>
        <div>
          <label className={LABEL}>Moneda</label>
          <select name="currency" defaultValue={invoice?.currency ?? 'EUR'} className={INPUT}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <label className={LABEL}>Adjunto (PDF, JPG, PNG, WebP — máx 10 MB)</label>
          <input name="file" type="file" accept="application/pdf,image/*" className={`${INPUT} file:mr-3 file:rounded-full file:border-0 file:bg-sp-admin-bg file:px-3 file:py-1 file:text-xs file:font-semibold file:text-sp-admin-text`} />
          {invoice?.fileUrl && (
            <p className="text-xs text-sp-admin-muted mt-1">
              Adjunto actual: <a href={invoice.fileUrl} target="_blank" rel="noreferrer" className="text-sp-admin-accent hover:underline">ver</a>
              {' '}— sube uno nuevo para reemplazarlo.
            </p>
          )}
        </div>

        <div className="md:col-span-4">
          <label className={LABEL}>Notas</label>
          <textarea name="notes" rows={2} defaultValue={invoice?.notes ?? ''} className={INPUT} />
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onDone} className={BTN_GHOST}>Cancelar</button>
        <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
          {isPending ? 'Guardando...' : mode === 'create' ? 'Crear factura' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
