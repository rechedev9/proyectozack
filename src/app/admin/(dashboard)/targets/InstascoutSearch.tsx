'use client';

import { useState, useTransition } from 'react';
import { formatCompact } from '@/lib/format';
import type { InstascoutPreviewRow, InstascoutSearchParams } from './instascout-actions';
import { previewInstascoutAction, importInstascoutAction } from './instascout-actions';
import type { BrandUserRow } from '@/lib/queries/brandUsers';

const IG_RED = '#E1306C';

const DEFAULT_PARAMS: InstascoutSearchParams = {
  minFollowers: 10000,
  maxFollowers: 0,
  country: '',
  bio: '',
  isVerified: false,
  isBusiness: false,
  isPrivate: null,
  isCreator: null,
  enrichedOnly: false,
  source: '',
  limit: 50,
};

function selectedBrandLabel(brands: BrandUserRow[], brandUserId: string): string | null {
  return brands.find((brand) => brand.id === brandUserId)?.name ?? null;
}

export function InstascoutSearch({ brands = [] }: { brands?: BrandUserRow[] }): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<InstascoutSearchParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<InstascoutPreviewRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [brandUserId, setBrandUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number; assigned: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const brandLabel = selectedBrandLabel(brands, brandUserId);

  const handleSearch = (): void => {
    setError(null);
    setImportResult(null);
    startTransition(async () => {
      try {
        const rows = await previewInstascoutAction(params);
        setResults(rows);
        setSelected(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error conectando con instascout');
        setResults([]);
      }
    });
  };

  const toggleOne = (username: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const allSelected = results.length > 0 && results.every((r) => selected.has(r.username));

  const toggleAll = (): void => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(results.map((r) => r.username)));
  };

  const handleImport = (): void => {
    const toImport = results.filter((r) => selected.has(r.username));
    if (toImport.length === 0) return;
    const fd = new FormData();
    fd.set('profiles', JSON.stringify(toImport));
    if (brandUserId) fd.set('brandUserId', brandUserId);
    setError(null);
    startTransition(async () => {
      try {
        const result = await importInstascoutAction(fd);
        setImportResult(result);
        setResults([]);
        setSelected(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error importando perfiles');
      }
    });
  };

  const set = <K extends keyof InstascoutSearchParams>(key: K, value: InstascoutSearchParams[K]): void =>
    setParams((p) => ({ ...p, [key]: value }));

  return (
    <div className="rounded-xl border border-sp-admin-border bg-sp-admin-card overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-sp-admin-text hover:bg-sp-admin-hover transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill={IG_RED}>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Buscar perfiles en instascout
        </span>
        <svg
          aria-hidden="true"
          className={`w-4 h-4 text-sp-admin-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-sp-admin-border">
          {/* ── Filters ──────────────────────────────────────────────────── */}
          <div className="px-5 py-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            <div>
              <label htmlFor="instascout-min-followers" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                Min. seguidores
              </label>
              <input
                id="instascout-min-followers"
                type="number"
                min="0"
                value={params.minFollowers || ''}
                onChange={(e) => set('minFollowers', parseInt(e.target.value, 10) || 0)}
                placeholder="10000"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
              />
            </div>

            <div>
              <label htmlFor="instascout-max-followers" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                Max. seguidores
              </label>
              <input
                id="instascout-max-followers"
                type="number"
                min="0"
                value={params.maxFollowers || ''}
                onChange={(e) => set('maxFollowers', parseInt(e.target.value, 10) || 0)}
                placeholder="ilimitado"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
              />
            </div>

            <div>
              <label htmlFor="instascout-country" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                Pais / region
              </label>
              <input
                id="instascout-country"
                type="text"
                value={params.country}
                onChange={(e) => set('country', e.target.value)}
                placeholder="spain, oregon"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
              />
            </div>

            <div>
              <label htmlFor="instascout-bio" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                Bio contiene
              </label>
              <input
                id="instascout-bio"
                type="text"
                value={params.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="casino OR betting"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
              />
            </div>

            <div>
              <label htmlFor="instascout-source" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                Fuente (hashtag:gambling)
              </label>
              <input
                id="instascout-source"
                type="text"
                value={params.source}
                onChange={(e) => set('source', e.target.value)}
                placeholder="hashtag:gambling"
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40 placeholder:text-sp-admin-muted/40"
              />
            </div>

            <div>
              <label htmlFor="instascout-limit" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sp-admin-muted mb-1">
                Límite
              </label>
              <input
                id="instascout-limit"
                type="number"
                min="1"
                max="500"
                value={params.limit}
                onChange={(e) => set('limit', parseInt(e.target.value, 10) || 50)}
                className="w-full bg-sp-admin-bg rounded-md px-3 py-2 text-sm text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
              />
            </div>

            <div className="flex items-center gap-4 col-span-2 sm:col-span-3 lg:col-span-4">
              <label className="flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.isVerified}
                  onChange={(e) => set('isVerified', e.target.checked)}
                  className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                />
                Verificados
              </label>
              <label className="flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.isBusiness}
                  onChange={(e) => set('isBusiness', e.target.checked)}
                  className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                />
                Negocio
              </label>
              <label className="flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.isCreator === true}
                  onChange={(e) => set('isCreator', e.target.checked ? true : null)}
                  className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                />
                Solo creators
              </label>
              <label className="flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.isPrivate === true}
                  onChange={(e) => set('isPrivate', e.target.checked ? true : null)}
                  className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                />
                Solo privados
              </label>
              <label className="flex items-center gap-2 text-[12px] text-sp-admin-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.enrichedOnly}
                  onChange={(e) => set('enrichedOnly', e.target.checked)}
                  className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                />
                Solo enriquecidos
              </label>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isPending}
                className="ml-auto px-4 py-2 rounded-lg text-[12px] font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: IG_RED }}
              >
                {isPending ? 'Buscando...' : 'Buscar en instascout'}
              </button>
            </div>
          </div>

          {/* ── Error ────────────────────────────────────────────────────── */}
          {error && <p className="px-5 pb-3 text-xs text-red-400">{error}</p>}

          {/* ── Import feedback ──────────────────────────────────────────── */}
          {importResult && (
            <div className="px-5 pb-3 space-y-1 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-emerald-400">Importados: <strong>{importResult.imported}</strong></span>
                {importResult.updated > 0 && (
                  <span className="text-blue-400">Actualizados: <strong>{importResult.updated}</strong></span>
                )}
                {importResult.assigned > 0 && (
                  <span className="text-violet-400">Asignados: <strong>{importResult.assigned}</strong></span>
                )}
              </div>
              {brandLabel && importResult.assigned > 0 && (
                <p className="text-sp-admin-muted">
                  Los perfiles seleccionados ya estan disponibles en la hoja de <strong className="text-sp-admin-text">{brandLabel}</strong>.
                </p>
              )}
              {importResult.updated > 0 && (
                <p className="text-sp-admin-muted/80">
                  Si un target ya existia, se han refrescado sus metricas sin tocar estados ni notas.
                </p>
              )}
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────────────── */}
          {results.length > 0 && (
            <>
              <div className="px-5 pb-2 flex items-center justify-between border-t border-sp-admin-border pt-3">
                <span className="text-xs text-sp-admin-muted">
                  {results.length} perfiles encontrados
                </span>
                <div className="flex items-center gap-3">
                  {brands.length > 0 && (
                    <select
                      value={brandUserId}
                      onChange={(e) => setBrandUserId(e.target.value)}
                      className="min-w-[220px] bg-sp-admin-bg rounded-md px-3 py-1.5 text-[11px] text-sp-admin-text border border-sp-admin-border focus:outline-none focus:ring-1 focus:ring-sp-admin-accent/40"
                    >
                      <option value="">Importar sin asignar</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name} ({brand.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {brandLabel && (
                    <span className="text-[11px] text-sp-admin-muted">
                      Destino: <strong className="text-sp-admin-text">{brandLabel}</strong>
                    </span>
                  )}
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
                      className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: IG_RED }}
                    >
                      Importar {selected.size} {selected.size === 1 ? 'perfil' : 'perfiles'}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border-t border-sp-admin-border">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
                      <th className="px-3 py-2.5 w-8" />
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted">Perfil</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted w-28 text-right">Seguidores</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted">Bio</th>
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-admin-muted w-32">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sp-admin-border/60">
                    {results.map((profile) => (
                      <tr
                        key={profile.username}
                        onClick={() => toggleOne(profile.username)}
                        className={`cursor-pointer transition-colors hover:bg-sp-admin-hover ${selected.has(profile.username) ? 'bg-sp-admin-accent/5' : ''}`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(profile.username)}
                            onChange={() => toggleOne(profile.username)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-sp-admin-border bg-sp-admin-bg accent-sp-admin-accent"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {profile.profilePicUrl ? (
                              <img
                                src={profile.profilePicUrl}
                                alt={profile.username}
                                className="w-8 h-8 rounded-full object-cover shrink-0 bg-sp-admin-border"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: IG_RED }}
                              >
                                IG
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-[13px] text-sp-admin-text truncate max-w-[180px]">
                                @{profile.username}
                                {profile.isVerified && (
                                  <span className="ml-1 text-blue-400 text-[10px]">✓</span>
                                )}
                              </p>
                              {profile.fullName && (
                                <p className="text-[11px] text-sp-admin-muted truncate max-w-[160px]">
                                  {profile.fullName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-sp-admin-text tabular-nums">
                          {profile.followers > 0 ? formatCompact(profile.followers) : '--'}
                        </td>
                        <td className="px-4 py-2.5 max-w-[260px]">
                          {profile.bio ? (
                            <p className="text-[11px] text-sp-admin-muted line-clamp-2 leading-relaxed">
                              {profile.bio}
                            </p>
                          ) : (
                            <span className="text-[11px] text-sp-admin-muted/25 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-sp-admin-muted">
                          {profile.discoveredVia || '--'}
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
