'use client';

import { useState, type ReactElement } from 'react';
import { GeoEditor } from './GeoEditor';
import type { StatsRow } from '@/lib/queries/stats';

type SortKey = 'rank' | 'reach';
type SortDir = 'asc' | 'desc';

type Props = {
  readonly rows: StatsRow[];
};

function SortIndicator({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className="text-sp-admin-muted/30 ml-1">↕</span>;
  return <span className="text-sp-admin-accent ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
}

export function StatsTable({ rows }: Props): ReactElement {
  const [sortKey, setSortKey] = useState<SortKey>('reach');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === 'reach') {
      if (a.totalFollowers === 0 && b.totalFollowers === 0) return 0;
      if (a.totalFollowers === 0) return 1;
      if (b.totalFollowers === 0) return -1;
      const diff = b.totalFollowers - a.totalFollowers;
      return sortDir === 'desc' ? diff : -diff;
    }
    // 'rank' = original sort order from query (by sortOrder)
    return sortDir === 'desc' ? rows.indexOf(a) - rows.indexOf(b) : rows.indexOf(b) - rows.indexOf(a);
  });

  return (
    <div className="rounded-xl bg-sp-admin-card border border-sp-admin-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-sp-admin-border bg-sp-admin-bg/50">
              <th
                className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted w-10 cursor-pointer select-none"
                onClick={() => toggleSort('rank')}
              >
                # <SortIndicator col="rank" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted">Canal</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted">Top GEO</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted w-24">Idioma</th>
              <th
                className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted text-right w-28 cursor-pointer select-none"
                onClick={() => toggleSort('reach')}
              >
                Reach <SortIndicator col="reach" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-sp-admin-muted w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-admin-border/60">
            {sorted.map((row, i) => {
              const primarySocial = row.socials[0];
              const profileUrl = primarySocial?.profileUrl ?? null;
              return (
                <tr key={row.id} className="hover:bg-sp-admin-hover transition-colors">
                  <td className="px-4 py-3 text-xs text-sp-admin-muted tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    {profileUrl ? (
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sp-admin-text hover:text-sp-admin-accent transition-colors text-[13px]"
                      >
                        {row.name}
                      </a>
                    ) : (
                      <span className="font-semibold text-sp-admin-text text-[13px]">{row.name}</span>
                    )}
                    <span className="ml-2 text-[10px] text-sp-admin-muted uppercase">{row.platform}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-sp-admin-muted">
                    {row.topGeos && row.topGeos.length > 0 ? (
                      row.topGeos.map((g) => `${g.country} ${g.pct}%`).join(' / ')
                    ) : (
                      <span className="text-sp-admin-muted/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-sp-admin-text">
                    {row.audienceLanguage ?? <span className="text-sp-admin-muted/30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-display text-sm font-bold text-sp-admin-text tabular-nums">
                    {row.totalFollowers > 0 ? row.totalFormatted : <span className="text-sp-admin-muted/30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <GeoEditor
                      talentId={row.id}
                      talentName={row.name}
                      topGeos={row.topGeos ? [...row.topGeos] : null}
                      audienceLanguage={row.audienceLanguage}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
