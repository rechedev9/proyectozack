'use client';

import { useState, useMemo } from 'react';
import type { InferSelectModel } from 'drizzle-orm';
import type { agencyCreators } from '@/db/schema';

type Creator = InferSelectModel<typeof agencyCreators>;

const PLATFORMS = [
  { key: 'youtubeUrl' as const, abbr: 'YT', color: '#FF0000' },
  { key: 'twitterUrl' as const, abbr: 'X', color: '#000000' },
  { key: 'instagramUrl' as const, abbr: 'IG', color: '#E1306C' },
  { key: 'tiktokUrl' as const, abbr: 'TT', color: '#010101' },
  { key: 'twitchUrl' as const, abbr: 'TW', color: '#9146FF' },
  { key: 'kickUrl' as const, abbr: 'K', color: '#53FC18' },
] as const;

export function AgencyRoster({
  creators,
  countries,
}: {
  creators: Creator[];
  countries: string[];
}) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return creators.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (countryFilter && c.country !== countryFilter) return false;
      return true;
    });
  }, [creators, search, countryFilter]);

  return (
    <section>
      <h2 className="font-display text-lg font-black uppercase text-sp-dark mb-4">
        Creadores
      </h2>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-sp-border bg-white px-4 py-2 text-sm text-sp-dark placeholder:text-sp-muted focus:outline-none focus:ring-2 focus:ring-sp-orange/40"
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-lg border border-sp-border bg-white px-4 py-2 text-sm text-sp-dark focus:outline-none focus:ring-2 focus:ring-sp-orange/40"
        >
          <option value="">Todos los países</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-sp-muted mb-3">
        Mostrando {filtered.length} de {creators.length} creadores
      </p>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-sp-border bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sp-border bg-sp-off">
              <th className="px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-sp-muted">
                Nombre
              </th>
              <th className="px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-sp-muted">
                País
              </th>
              <th className="px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-sp-muted">
                Plataformas
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-12 text-center text-sp-muted"
                >
                  No se encontraron creadores
                </td>
              </tr>
            ) : (
              filtered.map((creator, idx) => (
                <tr
                  key={creator.id}
                  className={`border-b border-sp-border/50 transition-colors hover:bg-sp-off/60 ${
                    idx % 2 === 1 ? 'bg-sp-off/30' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-bold text-sp-dark">
                    {creator.name}
                  </td>
                  <td className="px-5 py-3 text-sp-muted">
                    {creator.country ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {PLATFORMS.map(({ key, abbr, color }) => {
                        const url = creator[key];
                        if (!url) return null;
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold transition-opacity hover:opacity-80"
                            style={{ backgroundColor: color }}
                            title={abbr}
                          >
                            {abbr}
                          </a>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
