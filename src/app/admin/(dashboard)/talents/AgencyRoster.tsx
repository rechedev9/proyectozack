'use client';

import { useState, useMemo } from 'react';
import type { TalentWithRelations } from '@/types';

const PLATFORMS = [
  { key: 'yt', abbr: 'YT', label: 'YouTube', color: '#FF0000' },
  { key: 'x', abbr: 'X', label: 'Twitter/X', color: '#000000' },
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
    const q = search.toLowerCase().trim();
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q));
    if (platformFilter)
      result = result.filter((c) =>
        c.socials.some((s) => s.platform === platformFilter),
      );
    if (sortDir)
      result = [...result].sort((a, b) =>
        sortDir === 'desc'
          ? b.socials.length - a.socials.length
          : a.socials.length - b.socials.length,
      );
    return result;
  }, [creators, search, platformFilter, sortDir]);

  const toggleSort = () =>
    setSortDir((p) => (p === null ? 'desc' : p === 'desc' ? 'asc' : null));

  /* Platform counts for filter badges */
  const platformCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of creators)
      for (const s of c.socials) map.set(s.platform, (map.get(s.platform) ?? 0) + 1);
    return map;
  }, [creators]);

  return (
    <div className="space-y-5">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sp-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar creador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-sp-border bg-white pl-9 pr-4 py-2.5 text-sm text-sp-dark placeholder:text-sp-muted/60 focus:outline-none focus:border-sp-orange/60 transition-colors"
          />
        </div>

        {/* Result count */}
        <span className="text-xs text-sp-muted tabular-nums">
          {filtered.length} / {creators.length}
        </span>
      </div>

      {/* ── Platform filters ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPlatformFilter(null)}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            platformFilter === null
              ? 'bg-sp-dark text-white shadow-sm'
              : 'bg-transparent text-sp-muted hover:text-sp-dark'
          }`}
        >
          Todas
        </button>
        {PLATFORMS.map((p) => {
          const count = platformCounts.get(p.key) ?? 0;
          const active = platformFilter === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPlatformFilter(active ? null : p.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                active
                  ? 'text-white shadow-sm'
                  : 'bg-transparent text-sp-muted hover:text-sp-dark'
              }`}
              style={active ? { backgroundColor: p.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: active ? '#fff' : p.color }}
              />
              {p.label}
              <span className={active ? 'text-white/60' : 'text-sp-muted/50'}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-sp-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-sp-off/80">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sp-muted">
                Creador
              </th>
              <th
                className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sp-muted cursor-pointer select-none hover:text-sp-dark transition-colors w-20 text-center"
                onClick={toggleSort}
              >
                <span className="inline-flex items-center gap-1">
                  Redes
                  <span className="text-sp-orange text-xs">
                    {sortDir === 'desc' ? '↓' : sortDir === 'asc' ? '↑' : '↕'}
                  </span>
                </span>
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sp-muted">
                Plataformas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-border/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-16 text-center text-sp-muted">
                  Sin resultados para esta búsqueda
                </td>
              </tr>
            ) : (
              filtered.map((creator) => (
                <tr
                  key={creator.id}
                  className="transition-colors hover:bg-sp-orange/[0.03] group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Initials avatar */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${creator.gradientC1}, ${creator.gradientC2})`,
                        }}
                      >
                        {creator.initials}
                      </div>
                      <div>
                        <span className="font-semibold text-sp-dark text-[13px] group-hover:text-sp-orange transition-colors">
                          {creator.name}
                        </span>
                        {creator.visibility === 'internal' && (
                          <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-sp-muted/50 bg-sp-off px-1.5 py-0.5 rounded">
                            interno
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-sp-off text-[11px] font-bold text-sp-dark tabular-nums">
                      {creator.socials.length}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {creator.socials.map((social) => {
                        const abbr =
                          PLATFORM_LABELS[social.platform] ??
                          social.platform.toUpperCase();
                        const base =
                          'inline-flex items-center justify-center w-6 h-6 rounded-md text-white text-[9px] font-bold leading-none';
                        return social.profileUrl ? (
                          <a
                            key={social.id}
                            href={social.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${base} transition-transform hover:scale-110`}
                            style={{ backgroundColor: social.hexColor }}
                            title={`${abbr}: ${social.handle}`}
                          >
                            {abbr}
                          </a>
                        ) : (
                          <span
                            key={social.id}
                            className={`${base} opacity-25`}
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
    </div>
  );
}
