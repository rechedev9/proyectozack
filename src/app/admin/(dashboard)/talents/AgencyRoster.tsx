'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { TalentWithRelations } from '@/types';

const PLATFORMS = [
  { key: 'yt', abbr: 'YT', label: 'YouTube', color: '#FF0000' },
  { key: 'twitch', abbr: 'TW', label: 'Twitch', color: '#9146FF' },
] as const;

const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p.abbr]),
);

type SortField = 'name' | 'socials' | 'followers';
type SortDir = 'asc' | 'desc';
type SortState = { field: SortField; dir: SortDir } | null;

const SORT_OPTIONS: { field: SortField; dir: SortDir; label: string }[] = [
  { field: 'name', dir: 'asc', label: 'Nombre A → Z' },
  { field: 'name', dir: 'desc', label: 'Nombre Z → A' },
  { field: 'socials', dir: 'desc', label: 'Más redes primero' },
  { field: 'socials', dir: 'asc', label: 'Menos redes primero' },
  { field: 'followers', dir: 'desc', label: 'Más followers primero' },
  { field: 'followers', dir: 'asc', label: 'Menos followers primero' },
];

/**
 * Parse followers display strings → number.
 * Handles: "180K", "1.2M", "9K", "8,300", plain numbers.
 * Returns 0 for unknown values like "-".
 */
function parseFollowers(display: string): number {
  const s = display.trim();
  // Fast-reject non-numeric strings like "-"
  if (!s || !/\d/.test(s)) return 0;
  // Remove thousands separators (comma or period used as separator when
  // followed by exactly 3 digits and no suffix — e.g. "8,300" or "1.200")
  // Strategy: strip commas, keep dots only if followed by digits+suffix
  const noCommas = s.replace(/,/g, '');
  const match = noCommas.match(/^([\d]+(?:\.\d+)?)\s*([KkMm]?)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
}

/**
 * Sum followers for a creator, optionally restricted to specific platforms.
 * If platforms is empty, sums all socials.
 */
function totalFollowers(c: TalentWithRelations, platforms?: Set<string>): number {
  return c.socials
    .filter((s) => !platforms || platforms.size === 0 || platforms.has(s.platform))
    .reduce((sum, s) => sum + parseFollowers(s.followersDisplay), 0);
}

export function AgencyRoster({
  creators,
}: {
  creators: TalentWithRelations[];
}) {
  const [search, setSearch] = useState('');
  const [activePlatforms, setActivePlatforms] = useState<Set<string>>(new Set());
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'internal'>('all');
  const [sort, setSort] = useState<SortState>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    if (sortOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const hasFilters = search || activePlatforms.size > 0 || visibilityFilter !== 'all' || sort !== null;

  const clearAll = () => {
    setSearch('');
    setActivePlatforms(new Set());
    setVisibilityFilter('all');
    setSort(null);
  };

  const togglePlatform = (key: string) => {
    setActivePlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = creators;

    // Search
    const q = search.toLowerCase().trim();
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q));

    // Visibility
    if (visibilityFilter !== 'all')
      result = result.filter((c) => c.visibility === visibilityFilter);

    // Multi-platform: creator must have ALL selected platforms
    if (activePlatforms.size > 0)
      result = result.filter((c) =>
        [...activePlatforms].every((pKey) =>
          c.socials.some((s) => s.platform === pKey),
        ),
      );

    // Sort
    if (sort) {
      result = [...result].sort((a, b) => {
        if (sort.field === 'followers') {
          // When platform filters are active, rank by followers on those
          // platforms only — not the creator's total across all networks.
          const fa = totalFollowers(a, activePlatforms);
          const fb = totalFollowers(b, activePlatforms);
          // Creators with no known followers always go to the bottom,
          // regardless of sort direction.
          if (fa === 0 && fb === 0) return 0;
          if (fa === 0) return 1;
          if (fb === 0) return -1;
          const cmp = fa - fb;
          return sort.dir === 'desc' ? -cmp : cmp;
        }
        let cmp = 0;
        if (sort.field === 'name') cmp = a.name.localeCompare(b.name, 'es');
        else cmp = a.socials.length - b.socials.length;
        return sort.dir === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [creators, search, activePlatforms, visibilityFilter, sort]);

  /* Platform counts (across all creators, not filtered) */
  const platformCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of creators)
      for (const s of c.socials) map.set(s.platform, (map.get(s.platform) ?? 0) + 1);
    return map;
  }, [creators]);

  /* Visibility counts */
  const visCounts = useMemo(() => {
    let pub = 0;
    let int = 0;
    for (const c of creators) {
      if (c.visibility === 'public') pub++;
      else int++;
    }
    return { public: pub, internal: int };
  }, [creators]);

  return (
    <div className="space-y-0">
      {/* ── Control bar ──────────────────────────────────────────────── */}
      <div className="rounded-t-xl bg-white border border-sp-border border-b-0">
        {/* Top row: search + sort + visibility + count + clear */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-sp-border/60">
          {/* Search */}
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

          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                sort
                  ? 'bg-sp-dark text-white'
                  : 'bg-sp-off text-sp-muted hover:text-sp-dark'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M3 7h6M3 12h10M3 17h14" strokeLinecap="round" />
              </svg>
              {sort
                ? SORT_OPTIONS.find((o) => o.field === sort.field && o.dir === sort.dir)?.label ?? 'Ordenar'
                : 'Ordenar'}
              <svg className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {sortOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg border border-sp-border shadow-lg z-30 py-1">
                {/* No sort option */}
                <button
                  onClick={() => { setSort(null); setSortOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    sort === null
                      ? 'bg-sp-off font-bold text-sp-dark'
                      : 'text-sp-muted hover:bg-sp-off/60 hover:text-sp-dark'
                  }`}
                >
                  Sin ordenar
                </button>
                <div className="h-px bg-sp-border/50 my-1" />
                {SORT_OPTIONS.map((opt) => {
                  const active = sort?.field === opt.field && sort?.dir === opt.dir;
                  return (
                    <button
                      key={`${opt.field}-${opt.dir}`}
                      onClick={() => { setSort({ field: opt.field, dir: opt.dir }); setSortOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        active
                          ? 'bg-sp-off font-bold text-sp-dark'
                          : 'text-sp-muted hover:bg-sp-off/60 hover:text-sp-dark'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Visibility pills */}
          <div className="flex items-center gap-1 border-l border-sp-border/60 pl-3">
            {(['all', 'public', 'internal'] as const).map((v) => {
              const active = visibilityFilter === v;
              const label = v === 'all' ? 'Todos' : v === 'public' ? 'Público' : 'Interno';
              const count = v === 'all' ? creators.length : visCounts[v];
              return (
                <button
                  key={v}
                  onClick={() => setVisibilityFilter(v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-sp-dark text-white'
                      : 'text-sp-muted hover:text-sp-dark'
                  }`}
                >
                  {label}
                  <span className={`text-[10px] tabular-nums ${active ? 'text-white/50' : 'text-sp-muted/40'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result count + clear */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-sp-muted tabular-nums">
              <span className="font-bold text-sp-dark">{filtered.length}</span> de {creators.length}
            </span>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-sp-orange hover:bg-sp-orange/10 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Platform filter row — multi-select */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-sp-off/50">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sp-muted/60 mr-2 shrink-0">
            Red social
          </span>

          {PLATFORMS.map((p) => {
            const count = platformCounts.get(p.key) ?? 0;
            const active = activePlatforms.has(p.key);
            return (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
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

          {activePlatforms.size > 0 && (
            <button
              onClick={() => setActivePlatforms(new Set())}
              className="ml-1 text-[10px] font-semibold text-sp-muted hover:text-sp-orange transition-colors"
            >
              Todas
            </button>
          )}
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
