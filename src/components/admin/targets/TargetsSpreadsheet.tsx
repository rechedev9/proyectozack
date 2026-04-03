'use client';

import Image from 'next/image';
import { useState, useMemo, useRef, useTransition } from 'react';
import type { Target } from '@/types';
import { formatCompact } from '@/lib/format';
import {
  updateStatusAction,
  updateNotesAction,
  deleteTargetsAction,
  deleteAllTargetsAction,
  assignTargetsToBrandAction,
  importCSVAction,
} from '@/app/admin/(dashboard)/targets/actions';
import type { BrandUserRow } from '@/lib/queries/brandUsers';
import { TargetsEmptyState } from './TargetsEmptyState';
import {
  PLATFORMS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
  STATUS_LABELS,
  STATUS_TAB_COLORS,
  STATUS_FILTERS,
  STATUS_VALUES,
} from './targets-constants';
import type { SortField, SortState, StatusFilter, StatusValue, PlatformValue } from './targets-constants';
import { Th } from './ThSortable';
import { exportTargetsCSV } from './export-csv';

export function TargetsSpreadsheet({
  targets,
  brands = [],
}: {
  targets: Target[];
  brands?: BrandUserRow[];
}): React.ReactElement {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [platformFilter, setPlatformFilter] = useState<Set<PlatformValue>>(new Set());
  const [sort, setSort] = useState<SortState>({ field: 'createdAt', dir: 'desc' });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openStatusMenu, setOpenStatusMenu] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [brandUserId, setBrandUserId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [importResult, setImportResult] = useState<{ inserted: number; updated: number; errors: number } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { todos: targets.length, pendiente: 0, contactado: 0, finalizado: 0, descartado: 0 };
    for (const t of targets) counts[t.status]++;
    return counts;
  }, [targets]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of targets) counts[t.platform] = (counts[t.platform] ?? 0) + 1;
    return counts;
  }, [targets]);

  const activePlatforms = useMemo(
    () => PLATFORMS.filter((p) => (platformCounts[p] ?? 0) > 0),
    [platformCounts],
  );

  const handleImportCSV = (): void => {
    const file = csvInputRef.current?.files?.[0];
    if (!file) return;
    setImportResult(null);
    const fd = new FormData();
    fd.set('file', file);
    startTransition(async () => {
      try {
        const res = await importCSVAction(fd);
        setImportResult({ inserted: res.inserted, updated: res.updated, errors: res.errors });
      } catch {
        setImportResult({ inserted: 0, updated: 0, errors: -1 });
      } finally {
        if (csvInputRef.current) csvInputRef.current.value = '';
      }
    });
  };

  const filtered = useMemo(() => {
    let list = targets;

    if (statusFilter !== 'todos') {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (platformFilter.size > 0) {
      list = list.filter((t) => platformFilter.has(t.platform as PlatformValue));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.username.toLowerCase().includes(q) ||
          (t.fullName?.toLowerCase().includes(q) ?? false) ||
          (t.bio?.toLowerCase().includes(q) ?? false),
      );
    }

    return [...list].sort((a, b) => {
      const { field, dir } = sort;
      let cmp = 0;
      if (field === 'username') cmp = a.username.localeCompare(b.username, 'es');
      else if (field === 'followers') cmp = a.followers - b.followers;
      else if (field === 'status') cmp = a.status.localeCompare(b.status, 'es');
      else if (field === 'createdAt')
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dir === 'desc' ? -cmp : cmp;
    });
  }, [targets, statusFilter, platformFilter, search, sort]);

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

  const togglePlatform = (p: PlatformValue): void => {
    setPlatformFilter((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const toggleSort = (field: SortField): void => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: field === 'username' || field === 'status' ? 'asc' : 'desc' },
    );
  };

  const sortArrow = (field: SortField): string =>
    sort.field === field ? (sort.dir === 'asc' ? ' \u2191' : ' \u2193') : '';

  const setStatus = (id: number, status: StatusValue): void => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(id));
      fd.set('status', status);
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
    if (!confirm(`\u00bfEliminar ${ids.length} target${ids.length > 1 ? 's' : ''}?`)) return;
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
    exportTargetsCSV(rows);
  };

  const handleDeleteAll = (): void => {
    if (!confirm('\u00bfEliminar TODOS los targets? Esta acci\u00f3n no se puede deshacer.')) return;
    startTransition(async () => {
      await deleteAllTargetsAction();
      setSelected(new Set());
    });
  };

  if (targets.length === 0) {
    return <TargetsEmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-sp-admin-border">
        {STATUS_FILTERS.map((tab) => {
          const isActive = statusFilter === tab;
          const count = statusCounts[tab];
          const label = tab === 'todos' ? 'Todos' : STATUS_LABELS[tab];
          const colors = STATUS_TAB_COLORS[tab];

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`relative px-4 py-2.5 text-xs font-semibold transition-colors ${
                isActive
                  ? colors
                  : 'text-sp-admin-muted hover:text-sp-admin-text border-transparent'
              } border-b-2 -mb-px`}
            >
              {label}
              <span className={`ml-1.5 tabular-nums ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
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
            placeholder="Buscar por nombre, usuario o bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sp-admin-card rounded-lg pl-9 pr-3 py-2 text-sm text-sp-admin-text placeholder:text-sp-admin-muted/40 border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 transition-all"
          />
        </div>

        {activePlatforms.length > 1 && (
          <div className="flex items-center gap-1.5">
            {activePlatforms.map((p) => {
              const isActive = platformFilter.has(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border ${
                    isActive
                      ? 'border-current opacity-100'
                      : 'border-sp-admin-border text-sp-admin-muted hover:text-sp-admin-text opacity-60 hover:opacity-100'
                  }`}
                  style={isActive ? { color: PLATFORM_COLORS[p], borderColor: PLATFORM_COLORS[p] } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PLATFORM_COLORS[p] }}
                  />
                  {PLATFORM_LABELS[p]}
                  <span className="tabular-nums opacity-60">{platformCounts[p]}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-sp-admin-muted tabular-nums mr-1">
            <span className="font-bold text-sp-admin-text">{filtered.length}</span>
            {filtered.length !== targets.length && ` / ${targets.length}`}
          </span>
          <input ref={csvInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={isPending}
            className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold bg-sp-admin-accent text-sp-admin-bg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isPending ? 'Importando...' : 'Importar CSV'}
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold bg-sp-admin-card border border-sp-admin-border text-sp-admin-muted hover:text-sp-admin-text transition-colors"
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isPending}
            className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors disabled:opacity-40"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {importResult && (
        <div className="flex items-center gap-4 text-xs px-1">
          {importResult.errors === -1 ? (
            <span className="text-red-400">Error importando CSV</span>
          ) : (
            <>
              <span className="text-emerald-400">Importados: <strong>{importResult.inserted}</strong></span>
              {importResult.updated > 0 && <span className="text-blue-400">Actualizados: <strong>{importResult.updated}</strong></span>}
              {importResult.errors > 0 && <span className="text-red-400">Errores: <strong>{importResult.errors}</strong></span>}
            </>
          )}
          <button type="button" onClick={() => setImportResult(null)} className="text-sp-admin-muted hover:text-sp-admin-text text-[10px]">Cerrar</button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-sp-admin-card border border-sp-admin-accent/30 rounded-lg">
          <span className="text-xs font-semibold text-sp-admin-accent tabular-nums">
            {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
          </span>
          {brands.length > 0 && (
            <>
              <select
                value={brandUserId}
                onChange={(e) => setBrandUserId(e.target.value)}
                className="min-w-[200px] bg-sp-admin-bg rounded px-3 py-1.5 text-[11px] text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
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

      {openStatusMenu !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenStatusMenu(null)} />
      )}

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
              <Th className="max-w-[240px]">Descripci&oacute;n</Th>
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
                  {search || statusFilter !== 'todos' || platformFilter.size > 0
                    ? 'Sin resultados para los filtros aplicados'
                    : 'Sin targets'}
                </td>
              </tr>
            ) : (
              filtered.map((target, i) => {
                const isEditingNotes = editingNotes === target.id;
                return (
                  <tr
                    key={target.id}
                    className={`transition-colors hover:bg-sp-admin-hover group ${selected.has(target.id) ? 'bg-sp-admin-accent/5' : ''} ${target.status === 'descartado' ? 'opacity-40' : ''}`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(target.id)}
                        onChange={() => toggleOne(target.id)}
                        className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center text-[11px] text-sp-admin-muted tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {target.profilePicUrl ? (
                          <Image
                            src={target.profilePicUrl}
                            alt={target.username}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover shrink-0 bg-sp-admin-border"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ backgroundColor: PLATFORM_COLORS[target.platform] }}
                          >
                            {PLATFORM_LABELS[target.platform]}
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
                    <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-sp-admin-text tabular-nums">
                      {target.followers > 0 ? formatCompact(target.followers) : '--'}
                    </td>
                    <td className="px-4 py-2.5 max-w-[240px]">
                      {target.bio ? (
                        <p className="text-[11px] text-sp-admin-muted line-clamp-2 leading-relaxed">
                          {target.bio}
                        </p>
                      ) : (
                        <span className="text-sp-admin-muted/25 text-[11px]">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setEditingNotes(null); setOpenStatusMenu(openStatusMenu === target.id ? null : target.id); }}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed ${STATUS_COLORS[target.status]}`}
                        >
                          {STATUS_LABELS[target.status]}
                          <svg aria-hidden="true" className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {openStatusMenu === target.id && (
                          <div className="absolute left-0 top-full mt-1 z-50 min-w-[140px] bg-sp-admin-card border border-sp-admin-border rounded-lg shadow-xl py-1">
                            {STATUS_VALUES.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { setStatus(target.id, s); setOpenStatusMenu(null); }}
                                disabled={s === target.status}
                                className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-sp-admin-hover disabled:opacity-40 disabled:cursor-default ${STATUS_TEXT_COLORS[s]}`}
                              >
                                {STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
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
                          <button type="button" onClick={() => saveNotes(target.id)} className="text-[10px] font-semibold text-sp-admin-accent hover:opacity-80">{'\u2713'}</button>
                          <button type="button" onClick={() => setEditingNotes(null)} className="text-[10px] text-sp-admin-muted hover:text-sp-admin-text">{'\u2715'}</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setOpenStatusMenu(null); setEditingNotes(target.id); setNotesValue(target.notes ?? ''); }}
                          className="text-[11px] text-sp-admin-muted hover:text-sp-admin-text transition-colors text-left w-full max-w-[200px] truncate"
                          title={target.notes ?? 'A\u00f1adir nota...'}
                        >
                          {target.notes || <span className="opacity-25 italic">nota...</span>}
                        </button>
                      )}
                    </td>
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

