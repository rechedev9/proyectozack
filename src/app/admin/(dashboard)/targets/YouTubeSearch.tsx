'use client';

import { useState, useTransition } from 'react';
import { formatCompact } from '@/lib/format';
import type { YouTubeChannelPreview } from '@/lib/services/youtube';
import {
  searchYouTubeAction,
  importYouTubeChannelsAction,
} from './youtube-actions';

import type {
  YouTubeSearchParams,
} from './youtube-actions';

const YT_RED = '#FF0000';

const DEFAULT_PARAMS: YouTubeSearchParams = {
  query: '',
  minSubscribers: 0,
  maxSubscribers: 0,
  requiresHandle: false,
  description: '',
  limit: 10,
};

export function YouTubeSearch(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<YouTubeSearchParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<YouTubeChannelPreview[]>([]);
  const [fetchedResults, setFetchedResults] = useState<YouTubeChannelPreview[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{ fetchedCount: number; filteredCount: number } | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof YouTubeSearchParams>(key: K, value: YouTubeSearchParams[K]): void => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (): void => {
    if (!params.query.trim()) return;
    setError(null);
    setImportResult(null);
    setSearchMeta(null);
    setHasSearched(true);
    startTransition(async () => {
      try {
        const result = await searchYouTubeAction(params);
        setSearchMeta({
          fetchedCount: result.fetchedCount,
          filteredCount: result.filteredCount,
        });
        setFetchedResults(result.fetchedResults);
        if (!result.ok) {
          setError(result.error ?? 'Error buscando en YouTube');
          setResults([]);
          return;
        }

        setResults(result.results);
        setSelected(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error buscando en YouTube');
        setSearchMeta(null);
        setFetchedResults([]);
        setResults([]);
      }
    });
  };

  const toggleOne = (channelId: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  };

  const allSelected = results.length > 0 && results.every((r) => selected.has(r.channelId));

  const toggleAll = (): void => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(results.map((r) => r.channelId)));
  };

  const handleImport = (): void => {
    const visibleRows = results.length > 0 ? results : fetchedResults;
    const toImport = visibleRows.filter((r) => selected.has(r.channelId));
    if (toImport.length === 0) return;
    const fd = new FormData();
    fd.set('channels', JSON.stringify(toImport));
    setError(null);
    startTransition(async () => {
      try {
        const result = await importYouTubeChannelsAction(fd);
        setImportResult(result);
        setResults([]);
        setFetchedResults([]);
        setSelected(new Set());
        setParams(DEFAULT_PARAMS);
        setSearchMeta(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error importando canales');
      }
    });
  };

  const handleUseFetchedResults = (): void => {
    setResults(fetchedResults.slice(0, params.limit));
    setSelected(new Set());
  };

  const hasResults = results.length > 0;

  return (
    <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-sp-admin-hover transition-colors text-left"
      >
        {/* YT icon badge */}
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: YT_RED }}
        >
          <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="white">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-sp-admin-text leading-none">Buscar canales en YouTube</p>
          <p className="text-[11px] text-sp-admin-muted mt-0.5">
            Busca por nombre, tema o nicho e importa canales directamente
          </p>
        </div>

        {isPending && (
          <span className="text-[10px] font-semibold text-[#FF0000] uppercase tracking-wide animate-pulse shrink-0">
            Buscando...
          </span>
        )}

        <svg
          aria-hidden="true"
          className={`w-4 h-4 text-sp-admin-muted transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-sp-admin-border">
          {/* ── Search row ───────────────────────────────────────────────────── */}
          <div className="px-5 pt-4 pb-3 flex gap-2.5">
            <div className="relative flex-1">
              <svg
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sp-admin-muted/50 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                id="youtube-query"
                type="text"
                value={params.query}
                onChange={(e) => set('query', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Nombre de canal, tema, handle..."
                className="w-full bg-sp-admin-bg rounded-lg pl-9 pr-3 py-2.5 text-sm text-sp-admin-text placeholder:text-sp-admin-muted/40 border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-[#FF0000]/30 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isPending || !params.query.trim()}
              className="shrink-0 px-5 py-2.5 rounded-lg text-white text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: YT_RED }}
            >
              Buscar
            </button>
          </div>

          {/* ── Filters ──────────────────────────────────────────────────────── */}
          <div className="px-5 pb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div>
              <label htmlFor="youtube-min-subs" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/70 mb-1">
                Min. suscriptores
              </label>
              <input
                id="youtube-min-subs"
                type="number"
                min="0"
                value={params.minSubscribers || ''}
                onChange={(e) => set('minSubscribers', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-[#FF0000]/30 placeholder:text-sp-admin-muted/40"
              />
            </div>
            <div>
              <label htmlFor="youtube-max-subs" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/70 mb-1">
                Max. suscriptores
              </label>
              <input
                id="youtube-max-subs"
                type="number"
                min="0"
                value={params.maxSubscribers || ''}
                onChange={(e) => set('maxSubscribers', parseInt(e.target.value, 10) || 0)}
                placeholder="ilimitado"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-[#FF0000]/30 placeholder:text-sp-admin-muted/40"
              />
            </div>
            <div>
              <label htmlFor="youtube-description" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/70 mb-1">
                Descripción contiene
              </label>
              <input
                id="youtube-description"
                type="text"
                value={params.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="casino, betting..."
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-[#FF0000]/30 placeholder:text-sp-admin-muted/40"
              />
            </div>
            <div>
              <label htmlFor="youtube-limit" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/70 mb-1">
                Límite
              </label>
              <input
                id="youtube-limit"
                type="number"
                min="1"
                max="25"
                value={params.limit}
                onChange={(e) => set('limit', parseInt(e.target.value, 10) || 10)}
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-[#FF0000]/30"
              />
            </div>
          </div>

          {/* ── Checkbox option ──────────────────────────────────────────────── */}
          <div className="px-5 pb-4 -mt-1">
            <label className="inline-flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={params.requiresHandle}
                onChange={(e) => set('requiresHandle', e.target.checked)}
                className="rounded border-sp-admin-border bg-sp-admin-bg accent-[#FF0000]"
              />
              Solo canales con handle (@)
            </label>
          </div>

          {/* ── Error ────────────────────────────────────────────────────────── */}
          {error && (
            <p className="px-5 pb-3 text-xs text-red-400">{error}</p>
          )}

          {/* ── Empty state ──────────────────────────────────────────────────── */}
          {hasSearched && !error && results.length === 0 && !isPending && (
            <div className="px-5 pb-4 border-t border-sp-admin-border/60 pt-3 space-y-1">
              {searchMeta && (
                <p className="text-xs text-sp-admin-muted">
                  YouTube devolvió {searchMeta.fetchedCount} canales; los filtros dejaron {searchMeta.filteredCount}.
                </p>
              )}
              <p className="text-xs text-sp-admin-muted">Sin resultados con esos filtros.</p>
              {fetchedResults.length > 0 && (
                <button
                  type="button"
                  onClick={handleUseFetchedResults}
                  className="text-[11px] text-[#FF0000] hover:opacity-80 transition-opacity"
                >
                  Ver los {fetchedResults.length} canales sin filtros
                </button>
              )}
            </div>
          )}

          {/* ── Import feedback ──────────────────────────────────────────────── */}
          {importResult && (
            <div className="px-5 pb-3 flex items-center gap-4 text-xs border-t border-sp-admin-border/60 pt-3">
              <span className="text-emerald-400">
                Importados: <strong>{importResult.imported}</strong>
              </span>
              {importResult.updated > 0 && (
                <span className="text-blue-400">
                  Actualizados: <strong>{importResult.updated}</strong>
                </span>
              )}
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────────────────── */}
          {hasResults && (
            <>
              {/* Results toolbar */}
              <div className="px-5 py-2.5 flex items-center justify-between border-t border-sp-admin-border bg-sp-admin-bg/30">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-sp-admin-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-sp-admin-border bg-sp-admin-bg accent-[#FF0000]"
                    />
                    Todos
                  </label>
                  <span className="text-[11px] text-sp-admin-muted tabular-nums">
                    {results.length} canales
                    {searchMeta && searchMeta.fetchedCount !== results.length && (
                      <span className="opacity-60"> · {searchMeta.fetchedCount} traídos</span>
                    )}
                  </span>
                </div>
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: YT_RED }}
                  >
                    Importar {selected.size} {selected.size === 1 ? 'canal' : 'canales'}
                  </button>
                )}
              </div>

              {/* Results table */}
              <div className="overflow-x-auto border-t border-sp-admin-border">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                      <th className="px-3 py-2.5 w-8" />
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted">
                        Canal
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted w-28 text-right">
                        Suscriptores
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted">
                        Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sp-admin-border/60">
                    {results.map((channel) => (
                      <tr
                        key={channel.channelId}
                        onClick={() => toggleOne(channel.channelId)}
                        className={`cursor-pointer transition-colors hover:bg-sp-admin-hover ${selected.has(channel.channelId) ? 'bg-[#FF0000]/5' : ''}`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(channel.channelId)}
                            onChange={() => toggleOne(channel.channelId)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-sp-admin-border bg-sp-admin-bg accent-[#FF0000]"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {channel.thumbnailUrl ? (
                              <img
                                src={channel.thumbnailUrl}
                                alt={channel.title}
                                className="w-8 h-8 rounded-full object-cover shrink-0 bg-sp-admin-border"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                YT
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-[13px] text-sp-admin-text truncate max-w-[200px]">
                                {channel.title}
                              </p>
                              {channel.handle && (
                                <p className="text-[11px] text-sp-admin-muted">
                                  @{channel.handle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-sp-admin-text tabular-nums">
                          {channel.subscriberCount > 0
                            ? formatCompact(channel.subscriberCount)
                            : '--'}
                        </td>
                        <td className="px-4 py-2.5 max-w-[300px]">
                          {channel.description ? (
                            <p className="text-[11px] text-sp-admin-muted line-clamp-2 leading-relaxed">
                              {channel.description}
                            </p>
                          ) : (
                            <span className="text-[11px] text-sp-admin-muted/25 italic">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
