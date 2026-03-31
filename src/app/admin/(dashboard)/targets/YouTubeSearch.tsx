'use client';

import { useState, useTransition } from 'react';
import { formatCompact } from '@/lib/format';
import type { YouTubeChannelPreview } from '@/lib/services/youtube';
import { searchYouTubeAction, importYouTubeChannelsAction } from './youtube-actions';

export function YouTubeSearch(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeChannelPreview[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (): void => {
    if (!query.trim()) return;
    setError(null);
    setImportResult(null);
    startTransition(async () => {
      try {
        const result = await searchYouTubeAction(query.trim());
        if (!result.ok) {
          setError(result.error ?? 'Error buscando en YouTube');
          setResults([]);
          return;
        }

        setResults(result.results);
        setSelected(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error buscando en YouTube');
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
    const toImport = results.filter((r) => selected.has(r.channelId));
    if (toImport.length === 0) return;
    const fd = new FormData();
    fd.set('channels', JSON.stringify(toImport));
    setError(null);
    startTransition(async () => {
      try {
        const result = await importYouTubeChannelsAction(fd);
        setImportResult(result);
        setResults([]);
        setSelected(new Set());
        setQuery('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error importando canales');
      }
    });
  };

  return (
    <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
          </svg>
          Buscar canales en YouTube
        </span>
        <svg
          aria-hidden="true"
          className={`w-4 h-4 text-sp-admin-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          {/* ── Search bar ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 px-5 py-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Nombre de canal, tema, handle..."
              className="flex-1 bg-sp-admin-bg rounded-lg px-3 py-2 text-sm text-sp-admin-text placeholder:text-sp-admin-muted/40 border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-[#FF0000]/40"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isPending || !query.trim()}
              className="px-4 py-2 rounded-lg bg-[#FF0000] text-white text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* ── Error ────────────────────────────────────────────────────── */}
          {error && (
            <p className="px-5 pb-3 text-xs text-red-400">{error}</p>
          )}

          {/* ── Import feedback ──────────────────────────────────────────── */}
          {importResult && (
            <div className="px-5 pb-3 flex items-center gap-4 text-xs">
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

          {/* ── Results ──────────────────────────────────────────────────── */}
          {results.length > 0 && (
            <>
              <div className="px-5 pb-2 flex items-center justify-between">
                <span className="text-xs text-sp-admin-muted">
                  {results.length} canales encontrados
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-sp-admin-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                    />
                    Seleccionar todo
                  </label>
                  {selected.size > 0 && (
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-lg bg-[#FF0000] text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Importar {selected.size}{' '}
                      {selected.size === 1 ? 'canal' : 'canales'}
                    </button>
                  )}
                </div>
              </div>

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
                        className={`cursor-pointer transition-colors hover:bg-sp-admin-hover ${selected.has(channel.channelId) ? 'bg-sp-admin-accent/5' : ''}`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(channel.channelId)}
                            onChange={() => toggleOne(channel.channelId)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
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
