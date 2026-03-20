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
    <div className="space-y-0">
      {/* ── Control bar ──────────────────────────────────────────────── */}
      <div className="rounded-t-xl bg-white border border-sp-border border-b-0 overflow-hidden">
        {/* Top row: search + sort + count */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-sp-border/60">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sp-muted pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx={11} cy={11} r={8} />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar creador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-sp-off rounded-lg pl-9 pr-3 py-2 text-sm text-sp-dark placeholder:text-sp-muted/50 focus:outline-none focus:ring-1 focus:ring-sp-orange/40 transition-all"
            />
          </div>

          {/* Sort toggle */}
          <button
            onClick={toggleSort}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              sortDir
                ? 'bg-sp-dark text-white'
                : 'bg-sp-off text-sp-muted hover:text-sp-dark'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M3 7h6M3 12h10M3 17h14" strokeLinecap="round" />
            </svg>
            {sortDir === 'desc' ? 'Mayor a menor' : sortDir === 'asc' ? 'Menor a mayor' : 'Ordenar'}
          </button>

          {/* Result count */}
          <span className="text-xs text-sp-muted tabular-nums ml-auto">
            <span className="font-bold text-sp-dark">{filtered.length}</span> de {creators.length}
          </span>
        </div>

        {/* Platform filter row */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-sp-off/50">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-muted/60 mr-2 shrink-0">
            Red social
          </span>

          <button
            onClick={() => setPlatformFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              platformFilter === null
                ? 'bg-sp-dark text-white shadow-sm'
                : 'bg-white text-sp-muted border border-sp-border/60 hover:border-sp-dark/30 hover:text-sp-dark'
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
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white text-sp-dark border border-sp-border/60 hover:border-sp-dark/30'
                }`}
                style={active ? { backgroundColor: p.color } : undefined}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : p.color }}
                />
                <span>{p.label}</span>
                <span
                  className={`text-[10px] ${
                    active ? 'text-white/60' : 'text-sp-muted/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="rounded-b-xl border border-sp-border border-t-0 bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sp-border bg-sp-off/50">
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">
                Creador
              </th>
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted w-20 text-center">
                Redes
              </th>
              <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sp-muted">
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
