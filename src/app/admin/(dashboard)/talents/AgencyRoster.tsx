'use client';

import { useState, useMemo } from 'react';
import type { TalentWithRelations } from '@/types';

const PLATFORMS = [
  { key: 'yt', abbr: 'YT', label: 'YouTube', color: '#FF0000' },
  { key: 'x', abbr: 'X', label: 'Twitter', color: '#000000' },
  { key: 'ig', abbr: 'IG', label: 'Instagram', color: '#E1306C' },
  { key: 'tt', abbr: 'TT', label: 'TikTok', color: '#010101' },
  { key: 'twitch', abbr: 'TW', label: 'Twitch', color: '#9146FF' },
  { key: 'kick', abbr: 'K', label: 'Kick', color: '#53FC18' },
] as const;

const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p.abbr]),
);

type SortDir = 'asc' | 'desc' | null;

export function AgencyRoster({
  creators,
}: {
  creators: TalentWithRelations[];
}) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const filtered = useMemo(() => {
    let result = creators;

    // Search by name
    const q = search.toLowerCase().trim();
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q));

    // Filter by platform
    if (platformFilter) {
      result = result.filter((c) =>
        c.socials.some((s) => s.platform === platformFilter),
      );
    }

    // Sort by social count
    if (sortDir) {
      result = [...result].sort((a, b) =>
        sortDir === 'desc'
          ? b.socials.length - a.socials.length
          : a.socials.length - b.socials.length,
      );
    }

    return result;
  }, [creators, search, platformFilter, sortDir]);

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? 'desc' : prev === 'desc' ? 'asc' : null));
  };

  return (
    <section>
      <h2 className="font-display text-lg font-black uppercase text-sp-dark mb-4">
        Creadores
      </h2>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-lg border border-sp-border bg-white px-4 py-2 text-sm text-sp-dark placeholder:text-sp-muted focus:outline-none focus:ring-2 focus:ring-sp-orange/40"
        />

        {/* Platform filter toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-sp-muted uppercase tracking-wider mr-1">
            Filtrar:
          </span>
          <button
            onClick={() => setPlatformFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              platformFilter === null
                ? 'bg-sp-dark text-white'
                : 'bg-sp-off text-sp-muted hover:bg-sp-border'
            }`}
          >
            Todas
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPlatformFilter(platformFilter === p.key ? null : p.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                platformFilter === p.key
                  ? 'text-white'
                  : 'bg-sp-off text-sp-muted hover:bg-sp-border'
              }`}
              style={platformFilter === p.key ? { backgroundColor: p.color } : undefined}
            >
              {p.abbr}
            </button>
          ))}
        </div>
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
              <th
                className="px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-sp-muted cursor-pointer select-none hover:text-sp-dark transition-colors"
                onClick={toggleSort}
                title="Ordenar por número de redes"
              >
                Redes{' '}
                <span className="text-sp-orange">
                  {sortDir === 'desc' ? '↓' : sortDir === 'asc' ? '↑' : '↕'}
                </span>
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
                  <td className="px-5 py-3 text-center font-semibold text-sp-dark">
                    {creator.socials.length}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {creator.socials.map((social) => {
                        const abbr =
                          PLATFORM_LABELS[social.platform] ??
                          social.platform.toUpperCase();
                        return social.profileUrl ? (
                          <a
                            key={social.id}
                            href={social.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold transition-opacity hover:opacity-80"
                            style={{ backgroundColor: social.hexColor }}
                            title={abbr}
                          >
                            {abbr}
                          </a>
                        ) : (
                          <span
                            key={social.id}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold opacity-40"
                            style={{ backgroundColor: social.hexColor }}
                            title={abbr}
                          >
                            {abbr}
                          </span>
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
