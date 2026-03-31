'use client';

import { useState, useMemo, useRef, useTransition } from 'react';
import type { Target } from '@/types';
import { formatCompact } from '@/lib/format';
import {
  importCSVAction,
  updateStatusAction,
  updateNotesAction,
  createTargetAction,
  deleteTargetsAction,
  bulkStatusAction,
} from './actions';
import { YouTubeSearch } from './YouTubeSearch';
import { TargetsDiagnostics } from './TargetsDiagnostics';

// ── Types ────────────────────────────────────────────────────────────────────

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

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  youtube: '#FF0000',
};

// ── Props ────────────────────────────────────────────────────────────────────

type Stats = {
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
};

export function TargetsSpreadsheet({
  targets,
  stats,
}: {
  targets: Target[];
  stats: Stats;
}): React.ReactElement {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'youtube'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusValue>('all');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'createdAt', dir: 'desc' });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [importResult, setImportResult] = useState<{ total: number; inserted: number; updated: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // ── Filter (independent of sort so sort changes don't re-filter) ──────────

  const filteredUnsorted = useMemo(() => {
    let result = targets;

    const q = search.toLowerCase().trim();
    if (q)
      result = result.filter(
        (t) =>
          t.username.toLowerCase().includes(q) ||
          (t.fullName?.toLowerCase().includes(q) ?? false) ||
          (t.bio?.toLowerCase().includes(q) ?? false),
      );

    if (platformFilter !== 'all') result = result.filter((t) => t.platform === platformFilter);
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter);

    const min = parseInt(minFollowers, 10);
    const max = parseInt(maxFollowers, 10);
    if (!isNaN(min)) result = result.filter((t) => t.followers >= min);
    if (!isNaN(max)) result = result.filter((t) => t.followers <= max);

    return result;
  }, [targets, search, platformFilter, statusFilter, minFollowers, maxFollowers]);

  // ── Sort ───────────────────────────────────────────────────────────────────

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

  // ── Selection ──────────────────────────────────────────────────────────────

  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));

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

  const selectedIds = useMemo(() => [...selected], [selected]);

  // ── Sort ───────────────────────────────────────────────────────────────────

  const toggleSort = (field: SortField): void => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: field === 'username' || field === 'status' ? 'asc' : 'desc' },
    );
  };

  const sortArrow = (field: SortField): string =>
    sort.field === field ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '';

  // ── Actions ────────────────────────────────────────────────────────────────

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

  const handleImport = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await importCSVAction(fd);
      setImportResult(result);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleCreate = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createTargetAction(fd);
      (e.target as HTMLFormElement).reset();
      setShowCreate(false);
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

  const handleBulkStatus = (status: StatusValue): void => {
    const fd = new FormData();
    fd.set('ids', selectedIds.join(','));
    fd.set('status', status);
    startTransition(async () => {
      await bulkStatusAction(fd);
    });
  };

  const exportCSV = (): void => {
    const rows = filtered.filter((t) => selected.size === 0 || selected.has(t.id));
    const headers = ['id', 'username', 'platform', 'followers', 'status', 'notes', 'profileUrl', 'discoveredVia', 'createdAt'];
    const lines = [
      headers.join(','),
      ...rows.map((t) =>
        headers
          .map((h) => {
            const val = t[h as keyof Target] ?? '';
            const s = String(val);
            return s.includes(',') || s.includes('\n') || s.includes('\r') || s.includes('"')
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
    // Revoke after the browser has queued the download — a.click() is sync but the
    // download itself is async, so revoking immediately can silently abort it.
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const hasFilters = search || platformFilter !== 'all' || statusFilter !== 'all' || minFollowers || maxFollowers;

  const clearAll = (): void => {
    setSearch('');
    setPlatformFilter('all');
    setStatusFilter('all');
    setMinFollowers('');
    setMaxFollowers('');
  };

  const total = targets.length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border">
        {/* Row 1: search + followers range + count */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-sp-admin-border flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sp-admin-muted pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <circle cx={11} cy={11} r={8} />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar username, nombre, bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-sp-admin-bg rounded-lg pl-9 pr-3 py-2 text-sm text-sp-admin-text placeholder:text-sp-admin-muted/50 focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 transition-all"
            />
          </div>

          {/* Follower range */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/60 shrink-0">
              Seguidores
            </span>
            <input
              type="number"
              placeholder="min"
              value={minFollowers}
              onChange={(e) => setMinFollowers(e.target.value)}
              className="w-20 bg-sp-admin-bg rounded-md px-2 py-1.5 text-xs text-sp-admin-text placeholder:text-sp-admin-muted/40 focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
            />
            <span className="text-sp-admin-muted/40 text-xs">—</span>
            <input
              type="number"
              placeholder="max"
              value={maxFollowers}
              onChange={(e) => setMaxFollowers(e.target.value)}
              className="w-20 bg-sp-admin-bg rounded-md px-2 py-1.5 text-xs text-sp-admin-text placeholder:text-sp-admin-muted/40 focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-sp-admin-muted tabular-nums">
              <span className="font-bold text-sp-admin-text">{filtered.length}</span> de {total}
            </span>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-sp-admin-accent hover:bg-sp-admin-accent/10 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Row 2: platform pills + status pills */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-sp-admin-bg/50 flex-wrap">
          {/* Platform */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted/60 mr-1.5 shrink-0">
              Red
            </span>
            {(['all', 'instagram', 'youtube'] as const).map((p) => {
              const active = platformFilter === p;
              const count = p === 'all' ? total : (stats.byPlatform[p] ?? 0);
              const color = p !== 'all' ? PLATFORM_COLORS[p] : undefined;
              return (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    active ? 'text-white shadow-sm' : 'bg-sp-admin-card text-sp-admin-text border border-sp-admin-border hover:border-sp-admin-muted/30'
                  }`}
                  style={active && color ? { backgroundColor: color } : active ? { backgroundColor: '#8b3aad' } : undefined}
                >
                  {p === 'all' ? 'Todas' : p === 'instagram' ? 'Instagram' : 'YouTube'}
                  <span className={`text-[10px] tabular-nums ${active ? 'opacity-60' : 'text-sp-admin-muted/50'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-4 bg-sp-admin-border shrink-0" />

          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted/60 mr-1.5 shrink-0">
              Estado
            </span>
            {(['all', 'pendiente', 'contactado', 'finalizado'] as const).map((s) => {
              const active = statusFilter === s;
              const count = s === 'all' ? total : (stats.byStatus[s] ?? 0);
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-sp-admin-accent text-sp-admin-bg'
                      : 'text-sp-admin-muted hover:text-sp-admin-text'
                  }`}
                >
                  {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                  <span className={`text-[10px] tabular-nums ${active ? 'opacity-60' : 'opacity-40'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bulk bar (selection) ───────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-sp-admin-card border border-sp-admin-accent/30 rounded-lg">
          <span className="text-xs font-semibold text-sp-admin-accent tabular-nums">
            {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {(['pendiente', 'contactado', 'finalizado'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                disabled={isPending}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${STATUS_COLORS[s]} hover:opacity-80`}
              >
                → {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="ml-2 px-3 py-1 rounded text-[11px] font-semibold bg-sp-admin-border text-sp-admin-text hover:text-sp-admin-accent transition-colors"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => handleDelete(selectedIds)}
            disabled={isPending}
            className="ml-auto px-3 py-1 rounded text-[11px] font-semibold text-red-400 hover:bg-red-900/20 transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sp-admin-muted hover:text-sp-admin-text transition-colors"
            aria-label="Deseleccionar todo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
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
              <Th sortable field="followers" sort={sort} onSort={toggleSort} arrow={sortArrow} className="w-24 text-right">
                Seguidores
              </Th>
              <Th className="max-w-[200px]">Bio</Th>
              <Th sortable field="status" sort={sort} onSort={toggleSort} arrow={sortArrow} className="w-28">
                Estado
              </Th>
              <Th className="w-32">Descubierto</Th>
              <Th className="min-w-[160px]">Notas</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-admin-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-sp-admin-muted">
                  Sin resultados
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

                    {/* Profile */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {target.profilePicUrl ? (
                          <img
                            src={target.profilePicUrl}
                            alt={target.username}
                            className="w-7 h-7 rounded-full object-cover shrink-0 bg-sp-admin-border"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ backgroundColor: PLATFORM_COLORS[target.platform] }}
                          >
                            {target.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <a
                            href={target.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[13px] text-sp-admin-text hover:text-sp-admin-accent transition-colors flex items-center gap-1"
                          >
                            @{target.username}
                            <svg className="w-2.5 h-2.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                          {target.fullName && (
                            <p className="text-[11px] text-sp-admin-muted truncate max-w-[160px]">
                              {target.fullName}
                            </p>
                          )}
                        </div>
                        <span
                          className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: PLATFORM_COLORS[target.platform] }}
                        >
                          {target.platform === 'instagram' ? 'IG' : 'YT'}
                        </span>
                      </div>
                    </td>

                    {/* Followers */}
                    <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-sp-admin-text tabular-nums">
                      {target.followers > 0 ? formatCompact(target.followers) : '--'}
                    </td>

                    {/* Bio */}
                    <td className="px-4 py-2.5 max-w-[200px]">
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
                        onClick={() => cycleStatus(target)}
                        disabled={isPending}
                        title="Clic para cambiar estado"
                        className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed ${STATUS_COLORS[target.status]}`}
                      >
                        {STATUS_LABELS[target.status]}
                      </button>
                    </td>

                    {/* Discovered via */}
                    <td className="px-4 py-2.5 text-[11px] text-sp-admin-muted">
                      {target.discoveredVia ?? '--'}
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
                          <button
                            onClick={() => saveNotes(target.id)}
                            className="text-[10px] font-semibold text-sp-admin-accent hover:opacity-80"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="text-[10px] text-sp-admin-muted hover:text-sp-admin-text"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
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
                        onClick={() => handleDelete([target.id])}
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                        aria-label="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* ── Service Diagnostics ─────────────────────────────────────────────── */}
      <TargetsDiagnostics />

      {/* ── CSV Import ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
        <button
          onClick={() => setShowImport((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sp-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M16 12l-4 4m0 0-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Importar CSV de instascout
          </span>
          <svg
            className={`w-4 h-4 text-sp-admin-muted transition-transform ${showImport ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showImport && (
          <div className="px-5 pb-5 border-t border-sp-admin-border">
            <form onSubmit={handleImport} className="flex items-center gap-3 mt-4 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".csv"
                required
                className="text-sm text-sp-admin-text file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-sp-admin-accent/20 file:text-sp-admin-accent hover:file:bg-sp-admin-accent/30 transition-colors"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-sp-admin-accent text-sp-admin-bg text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? 'Importando...' : 'Importar'}
              </button>
            </form>
            {importResult && (
              <div className="mt-3 flex items-center gap-4 text-xs">
                <span className="text-sp-admin-muted">Total: <strong className="text-sp-admin-text">{importResult.total}</strong></span>
                <span className="text-emerald-400">Nuevos: <strong>{importResult.inserted}</strong></span>
                <span className="text-blue-400">Actualizados: <strong>{importResult.updated}</strong></span>
                {importResult.errors > 0 && <span className="text-red-400">Errores: <strong>{importResult.errors}</strong></span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── YouTube Search ────────────────────────────────────────────────── */}
      <YouTubeSearch />

      {/* ── Instascout ────────────────────────────────────────────────────── */}
      <a
        href="https://instascout.89.167.101.158.nip.io"
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-5 rounded-xl border border-sp-admin-border bg-sp-admin-card px-6 py-5 hover:border-[#E1306C]/40 hover:bg-sp-admin-hover transition-all"
      >
        {/* IG wordmark-style icon */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #f58529 0%, #E1306C 50%, #833AB4 100%)' }}
        >
          <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-sp-admin-text group-hover:text-[#E1306C] transition-colors">
            Instascout
          </p>
          <p className="text-[12px] text-sp-admin-muted mt-0.5">
            Crawl y búsqueda de perfiles de Instagram — se abre en el servicio externo
          </p>
        </div>

        <svg
          aria-hidden="true"
          className="w-4 h-4 text-sp-admin-muted group-hover:text-[#E1306C] transition-colors shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      {/* ── Manual Create ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
        <button
          onClick={() => setShowCreate((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sp-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Alta manual
          </span>
          <svg
            className={`w-4 h-4 text-sp-admin-muted transition-transform ${showCreate ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showCreate && (
          <div className="px-5 pb-5 border-t border-sp-admin-border">
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3">
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                  Plataforma *
                </label>
                <select
                  name="platform"
                  required
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
                >
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                  Username *
                </label>
                <input
                  name="username"
                  required
                  placeholder="sin @"
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                  URL perfil *
                </label>
                <input
                  name="profileUrl"
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                  Nombre
                </label>
                <input
                  name="fullName"
                  placeholder="Nombre completo"
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                  Seguidores
                </label>
                <input
                  name="followers"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                  Notas
                </label>
                <input
                  name="notes"
                  placeholder="Observaciones..."
                  className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
                />
              </div>
              <div className="col-span-2 sm:col-span-3 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold text-sp-admin-muted hover:text-sp-admin-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-sp-admin-accent text-sp-admin-bg text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Añadir target
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sortable Table Header ────────────────────────────────────────────────────

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
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-0.5 transition-colors ${isActive ? 'text-sp-admin-text' : 'hover:text-sp-admin-text'}`}
      >
        {children}
        {indicator && <span className="text-sp-admin-accent">{indicator}</span>}
      </button>
    </th>
  );
}
