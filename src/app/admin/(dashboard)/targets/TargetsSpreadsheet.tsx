'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Target } from '@/types';
import { formatCompact } from '@/lib/format';
import {
  updateStatusAction,
  updateNotesAction,
  deleteTargetsAction,
  assignTargetsToBrandAction,
} from './actions';
import { YouTubeSearch } from './YouTubeSearch';
import { InstascoutSearch } from './InstascoutSearch';
import type { BrandUserRow } from '@/lib/queries/brandUsers';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = 'username' | 'followers' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';
type SortState = { field: SortField; dir: SortDir };
type StatusValue = 'pendiente' | 'contactado' | 'finalizado';

const STATUS_CYCLE: Record<StatusValue, StatusValue> = {
  pendiente: 'contactado',
  contactado: 'finalizado',
  finalizado: 'pendiente',
};

const STATUS_COLORS: Record<StatusValue, string> = {
  pendiente: 'bg-amber-900/30 text-amber-400',
  contactado: 'bg-blue-900/30 text-blue-400',
  finalizado: 'bg-emerald-900/30 text-emerald-400',
};

const STATUS_LABELS: Record<StatusValue, string> = {
  pendiente: 'Pendiente',
  contactado: 'Contactado',
  finalizado: 'Finalizado',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TargetsSpreadsheet({
  targets,
  brands = [],
}: {
  targets: Target[];
  brands?: BrandUserRow[];
}): React.ReactElement {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'createdAt', dir: 'desc' });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [brandUserId, setBrandUserId] = useState('');
  const [isPending, startTransition] = useTransition();

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredUnsorted = useMemo(() => {
    if (!search.trim()) return targets;
    const q = search.toLowerCase().trim();
    return targets.filter(
      (t) =>
        t.username.toLowerCase().includes(q) ||
        (t.fullName?.toLowerCase().includes(q) ?? false) ||
        (t.bio?.toLowerCase().includes(q) ?? false),
    );
  }, [targets, search]);

  // ── Sort ──────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return [...filteredUnsorted].sort((a, b) => {
      const { field, dir } = sort;
      let cmp = 0;
      if (field === 'username') cmp = a.username.localeCompare(b.username, 'es');
      else if (field === 'followers') cmp = a.followers - b.followers;
      else if (field === 'status') cmp = a.status.localeCompare(b.status, 'es');
      else if (field === 'createdAt')
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dir === 'desc' ? -cmp : cmp;
    });
  }, [filteredUnsorted, sort]);

  // ── Selection ─────────────────────────────────────────────────────────────

  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  const selectedIds = useMemo(() => [...selected], [selected]);

  const toggleAll = (): void => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const t of filtered) next.delete(t.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const t of filtered) next.add(t.id);
        return next;
      });
    }
  };

  const toggleOne = (id: number): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Sort ──────────────────────────────────────────────────────────────────

  const toggleSort = (field: SortField): void => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: field === 'username' || field === 'status' ? 'asc' : 'desc' },
    );
  };

  const sortArrow = (field: SortField): string =>
    sort.field === field ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '';

  // ── Actions ───────────────────────────────────────────────────────────────

  const cycleStatus = (target: Target): void => {
    const next = STATUS_CYCLE[target.status];
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(target.id));
      fd.set('status', next);
      await updateStatusAction(fd);
    });
  };

  const saveNotes = (id: number): void => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(id));
      fd.set('notes', notesValue);
      await updateNotesAction(fd);
      setEditingNotes(null);
    });
  };

  const handleDelete = (ids: number[]): void => {
    if (!confirm(`¿Eliminar ${ids.length} target${ids.length > 1 ? 's' : ''}?`)) return;
    const fd = new FormData();
    fd.set('ids', ids.join(','));
    startTransition(async () => {
      await deleteTargetsAction(fd);
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.delete(id);
        return next;
      });
    });
  };

  const handleAssignToBrand = (): void => {
    if (!brandUserId || selectedIds.length === 0) return;
    const fd = new FormData();
    fd.set('brandUserId', brandUserId);
    fd.set('ids', selectedIds.join(','));
    startTransition(async () => {
      await assignTargetsToBrandAction(fd);
      setSelected(new Set());
    });
  };

  const exportCSV = (): void => {
    const rows = filtered.filter((t) => selected.size === 0 || selected.has(t.id));
    const headers = ['id', 'username', 'platform', 'followers', 'status', 'notes', 'profileUrl', 'createdAt'];
    const lines = [
      headers.join(','),
      ...rows.map((t) =>
        headers
          .map((h) => {
            const val = t[h as keyof Target] ?? '';
            const s = String(val);
            return s.includes(',') || s.includes('\n') || s.includes('"')
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `targets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── YouTube Search (primary action) ─────────────────────────────── */}
      <YouTubeSearch />
      <InstascoutSearch brands={brands} />

      {/* ── Filter row ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs w-full">
          <svg
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sp-admin-muted/50 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sp-admin-card rounded-lg pl-9 pr-3 py-2 text-sm text-sp-admin-text placeholder:text-sp-admin-muted/40 border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 transition-all"
          />
        </div>
        <span className="text-xs text-sp-admin-muted tabular-nums ml-auto">
          <span className="font-bold text-sp-admin-text">{filtered.length}</span>
          {filtered.length !== targets.length && ` de ${targets.length}`}{' '}
          {filtered.length === 1 ? 'target' : 'targets'}
        </span>
        <button
          type="button"
          onClick={exportCSV}
          className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold bg-sp-admin-card border border-sp-admin-border text-sp-admin-muted hover:text-sp-admin-text transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {/* ── Bulk bar ────────────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-sp-admin-card border border-sp-admin-accent/30 rounded-lg">
          <span className="text-xs font-semibold text-sp-admin-accent tabular-nums">
            {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-sp-admin-muted">
            Asigna los seleccionados a la marca correcta para que aparezcan en su spreadsheet.
          </span>
          {brands.length > 0 && (
            <>
              <select
                value={brandUserId}
                onChange={(e) => setBrandUserId(e.target.value)}
                className="min-w-[220px] bg-sp-admin-bg rounded px-3 py-1.5 text-[11px] text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
              >
                <option value="">Asignar a marca...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} ({brand.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignToBrand}
                disabled={isPending || !brandUserId}
                className="px-3 py-1 rounded text-[11px] font-semibold text-sp-admin-text hover:bg-sp-admin-hover transition-colors disabled:opacity-40"
              >
                Asignar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => handleDelete(selectedIds)}
            disabled={isPending}
            className="ml-auto px-3 py-1 rounded text-[11px] font-semibold text-red-400 hover:bg-red-900/20 transition-colors"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            aria-label="Deseleccionar todo"
            className="text-sp-admin-muted hover:text-sp-admin-text transition-colors"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
              <th className="px-3 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                />
              </th>
              <Th className="w-8 text-center">#</Th>
              <Th sortable field="username" sort={sort} onSort={toggleSort} arrow={sortArrow}>
                Perfil
              </Th>
              <Th sortable field="followers" sort={sort} onSort={toggleSort} arrow={sortArrow} className="w-28 text-right">
                Audiencia
              </Th>
              <Th className="max-w-[240px]">Descripción</Th>
              <Th sortable field="status" sort={sort} onSort={toggleSort} arrow={sortArrow} className="w-28">
                Estado
              </Th>
              <Th className="min-w-[160px]">Notas</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-admin-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-sp-admin-muted text-sm">
                  {targets.length === 0
                    ? 'Usa el sourcing de arriba para encontrar e importar targets'
                    : 'Sin resultados'}
                </td>
              </tr>
            ) : (
              filtered.map((target, i) => {
                const isEditingNotes = editingNotes === target.id;
                return (
                  <tr
                    key={target.id}
                    className={`transition-colors hover:bg-sp-admin-hover group ${selected.has(target.id) ? 'bg-sp-admin-accent/5' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(target.id)}
                        onChange={() => toggleOne(target.id)}
                        className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                      />
                    </td>

                    {/* # */}
                    <td className="px-3 py-2.5 text-center text-[11px] text-sp-admin-muted tabular-nums">
                      {i + 1}
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {target.profilePicUrl ? (
                          <img
                            src={target.profilePicUrl}
                            alt={target.username}
                            className="w-7 h-7 rounded-full object-cover shrink-0 bg-sp-admin-border"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 bg-[#FF0000]">
                            YT
                          </div>
                        )}
                        <div className="min-w-0">
                          <a
                            href={target.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[13px] text-sp-admin-text hover:text-sp-admin-accent transition-colors flex items-center gap-1"
                          >
                            {target.username}
                            <svg aria-hidden="true" className="w-2.5 h-2.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                          {target.fullName && (
                            <p className="text-[11px] text-sp-admin-muted truncate max-w-[160px]">
                              {target.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Subscribers */}
                    <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-sp-admin-text tabular-nums">
                      {target.followers > 0 ? formatCompact(target.followers) : '--'}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-2.5 max-w-[240px]">
                      {target.bio ? (
                        <p className="text-[11px] text-sp-admin-muted line-clamp-2 leading-relaxed">
                          {target.bio}
                        </p>
                      ) : (
                        <span className="text-sp-admin-muted/25 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => cycleStatus(target)}
                        disabled={isPending}
                        title="Clic para cambiar estado"
                        className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed ${STATUS_COLORS[target.status]}`}
                      >
                        {STATUS_LABELS[target.status]}
                      </button>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-2.5">
                      {isEditingNotes ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveNotes(target.id);
                              if (e.key === 'Escape') setEditingNotes(null);
                            }}
                            className="flex-1 bg-sp-admin-bg rounded px-2 py-1 text-xs text-sp-admin-text focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 min-w-0"
                          />
                          <button type="button" onClick={() => saveNotes(target.id)} className="text-[10px] font-semibold text-sp-admin-accent hover:opacity-80">✓</button>
                          <button type="button" onClick={() => setEditingNotes(null)} className="text-[10px] text-sp-admin-muted hover:text-sp-admin-text">✕</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEditingNotes(target.id); setNotesValue(target.notes ?? ''); }}
                          className="text-[11px] text-sp-admin-muted hover:text-sp-admin-text transition-colors text-left w-full max-w-[200px] truncate"
                          title={target.notes ?? 'Añadir nota...'}
                        >
                          {target.notes || <span className="opacity-25 italic">nota...</span>}
                        </button>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete([target.id])}
                        disabled={isPending}
                        aria-label="Eliminar"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sortable Table Header ─────────────────────────────────────────────────────

type ThProps = {
  children?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  field?: SortField;
  sort?: SortState;
  onSort?: (field: SortField) => void;
  arrow?: (field: SortField) => string;
};

function Th({ children, className = '', sortable, field, sort, onSort, arrow }: ThProps): React.ReactElement {
  const base = `px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted whitespace-nowrap ${className}`;

  if (!sortable || !field || !onSort) {
    return <th className={base}>{children}</th>;
  }

  const isActive = sort?.field === field;
  const indicator = arrow?.(field) ?? '';

  return (
    <th className={base}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-0.5 transition-colors ${isActive ? 'text-sp-admin-text' : 'hover:text-sp-admin-text'}`}
      >
        {children}
        {indicator && <span className="text-sp-admin-accent">{indicator}</span>}
      </button>
    </th>
  );
}
