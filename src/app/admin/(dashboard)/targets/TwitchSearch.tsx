'use client';

import { useState, useTransition } from 'react';
import { formatCompact } from '@/lib/format';
import type { TwitchChannelPreview } from '@/lib/services/twitch';
import {
  searchTwitchAction,
  importTwitchChannelsAction,
} from './twitch-actions';
import type { TwitchSearchParams } from './twitch-actions';

const TWITCH_PURPLE = '#9146FF';

const DEFAULT_PARAMS: TwitchSearchParams = {
  query: '',
  liveOnly: false,
  language: '',
  minFollowers: 0,
  useCS2Live: false,
};

export function TwitchSearch(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<TwitchSearchParams>(DEFAULT_PARAMS);
  const [channels, setChannels] = useState<TwitchChannelPreview[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof TwitchSearchParams>(key: K, value: TwitchSearchParams[K]): void => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (): void => {
    if (!params.useCS2Live && !params.query.trim()) return;
    setError(null);
    setImportResult(null);
    setHasSearched(true);
    startTransition(async () => {
      try {
        const result = await searchTwitchAction(params);
        if (!result.ok) {
          setError(result.error ?? 'Error buscando en Twitch');
          setChannels([]);
          return;
        }
        setChannels(result.channels);
        setSelected(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error buscando en Twitch');
        setChannels([]);
      }
    });
  };

  const toggleOne = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = channels.length > 0 && channels.every((c) => selected.has(c.broadcasterId));

  const toggleAll = (): void => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(channels.map((c) => c.broadcasterId)));
  };

  const handleImport = (): void => {
    const toImport = channels.filter((c) => selected.has(c.broadcasterId));
    if (toImport.length === 0) return;
    const fd = new FormData();
    fd.set('channels', JSON.stringify(toImport));
    setError(null);
    startTransition(async () => {
      try {
        const result = await importTwitchChannelsAction(fd);
        setImportResult(result);
        setChannels([]);
        setSelected(new Set());
        setParams(DEFAULT_PARAMS);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error importando canales');
      }
    });
  };

  const hasResults = channels.length > 0;
  const canSearch = params.useCS2Live || params.query.trim().length > 0;

  return (
    <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-sp-admin-hover transition-colors text-left"
      >
        {/* Twitch icon badge */}
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: TWITCH_PURPLE }}
        >
          <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="white">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-sp-admin-text leading-none">Buscar canales en Twitch</p>
          <p className="text-[11px] text-sp-admin-muted mt-0.5">
            Busca CS2 en directo o por nombre de canal e importa
          </p>
        </div>

        {isPending && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wide animate-pulse shrink-0"
            style={{ color: TWITCH_PURPLE }}
          >
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
          {/* ── Mode toggle ──────────────────────────────────────────────────── */}
          <div className="px-5 pt-4 pb-2 flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={params.useCS2Live}
                onChange={(e) => set('useCS2Live', e.target.checked)}
                className="rounded border-sp-admin-border bg-sp-admin-bg"
                style={{ accentColor: TWITCH_PURPLE }}
              />
              Ver streams CS2 en directo
            </label>
          </div>

          {/* ── Search row ──────────────────────────────────────────────────── */}
          {!params.useCS2Live && (
            <div className="px-5 pb-3 flex gap-2.5">
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
                  type="text"
                  value={params.query}
                  onChange={(e) => set('query', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder="Nombre de canal, palabra clave..."
                  className="w-full bg-sp-admin-bg rounded-lg pl-9 pr-3 py-2.5 text-sm text-sp-admin-text placeholder:text-sp-admin-muted/40 border border-sp-admin-border focus:outline-none focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': `${TWITCH_PURPLE}4D` } as React.CSSProperties}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isPending || !canSearch}
                className="shrink-0 px-5 py-2.5 rounded-lg text-white text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: TWITCH_PURPLE }}
              >
                Buscar
              </button>
            </div>
          )}

          {/* ── Filters ──────────────────────────────────────────────────────── */}
          <div className="px-5 pb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div>
              <label htmlFor="twitch-language" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/70 mb-1">
                Idioma
              </label>
              <select
                id="twitch-language"
                value={params.language}
                onChange={(e) => set('language', e.target.value)}
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="es">Español</option>
                <option value="pt">Portugués</option>
                <option value="en">Inglés</option>
              </select>
            </div>
            <div>
              <label htmlFor="twitch-min-followers" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted/70 mb-1">
                Min. seguidores
              </label>
              <input
                id="twitch-min-followers"
                type="number"
                min="0"
                value={params.minFollowers || ''}
                onChange={(e) => set('minFollowers', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none placeholder:text-sp-admin-muted/40"
              />
            </div>
            {!params.useCS2Live && (
              <div className="flex items-end pb-0.5">
                <label className="inline-flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={params.liveOnly}
                    onChange={(e) => set('liveOnly', e.target.checked)}
                    className="rounded border-sp-admin-border bg-sp-admin-bg"
                    style={{ accentColor: TWITCH_PURPLE }}
                  />
                  Solo en directo
                </label>
              </div>
            )}
          </div>

          {/* Launch for CS2 live mode */}
          {params.useCS2Live && (
            <div className="px-5 pb-4 -mt-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg text-white text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: TWITCH_PURPLE }}
              >
                {isPending ? 'Cargando...' : 'Cargar streams CS2 en directo'}
              </button>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────────────── */}
          {error && (
            <p className="px-5 pb-3 text-xs text-red-400">{error}</p>
          )}

          {/* ── Empty state ──────────────────────────────────────────────────── */}
          {hasSearched && !error && channels.length === 0 && !isPending && (
            <p className="px-5 pb-4 text-xs text-sp-admin-muted border-t border-sp-admin-border/60 pt-3">
              Sin resultados con esos filtros.
            </p>
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
              {/* Toolbar */}
              <div className="px-5 py-2.5 flex items-center justify-between border-t border-sp-admin-border bg-sp-admin-bg/30">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-sp-admin-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-sp-admin-border bg-sp-admin-bg"
                      style={{ accentColor: TWITCH_PURPLE }}
                    />
                    Todos
                  </label>
                  <span className="text-[11px] text-sp-admin-muted tabular-nums">
                    {channels.length} {channels.length === 1 ? 'canal' : 'canales'}
                  </span>
                </div>
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: TWITCH_PURPLE }}
                  >
                    Importar {selected.size} {selected.size === 1 ? 'canal' : 'canales'}
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto border-t border-sp-admin-border">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                      <th className="px-3 py-2.5 w-8" />
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted">
                        Canal
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted w-28 text-right">
                        Seguidores
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted w-20 text-right">
                        Viewers
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted w-16">
                        Idioma
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted">
                        Juego actual
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sp-admin-border/60">
                    {channels.map((channel) => (
                      <tr
                        key={channel.broadcasterId}
                        onClick={() => toggleOne(channel.broadcasterId)}
                        className={`cursor-pointer transition-colors hover:bg-sp-admin-hover ${selected.has(channel.broadcasterId) ? 'bg-[#9146FF]/5' : ''}`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(channel.broadcasterId)}
                            onChange={() => toggleOne(channel.broadcasterId)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-sp-admin-border bg-sp-admin-bg"
                            style={{ accentColor: TWITCH_PURPLE }}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ backgroundColor: TWITCH_PURPLE }}
                            >
                              TW
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[13px] text-sp-admin-text truncate max-w-[180px]">
                                {channel.displayName}
                              </p>
                              <p className="text-[11px] text-sp-admin-muted">
                                @{channel.login}
                              </p>
                            </div>
                            {channel.isLive && (
                              <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                Live
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-sp-admin-text tabular-nums">
                          {channel.followerCount > 0 ? formatCompact(channel.followerCount) : '--'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[12px] tabular-nums text-sp-admin-muted">
                          {channel.viewerCount > 0 ? formatCompact(channel.viewerCount) : '--'}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-sp-admin-muted uppercase">
                          {channel.language || '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          {channel.currentGame ? (
                            <p className="text-[11px] text-sp-admin-muted truncate max-w-[180px]">
                              {channel.currentGame}
                            </p>
                          ) : (
                            <span className="text-sp-admin-muted/25 text-[11px]">—</span>
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
