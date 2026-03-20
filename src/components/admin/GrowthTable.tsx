'use client';

import { useState } from 'react';
import { formatCompact } from '@/lib/format';

export type GrowthRow = {
  talentId: number;
  talentName: string;
  platform: string;
  currentValue: number;
  startValue: number;
  absoluteChange: number;
  percentChange: number | null;
}

type GrowthTableProps = {
  rows: GrowthRow[];
  onCreatorClick?: (talentId: number) => void;
}

type SortKey = 'talentName' | 'platform' | 'currentValue' | 'startValue' | 'absoluteChange' | 'percentChange';

function changeColor(value: number): string {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-red-500';
  return 'text-sp-muted/60';
}

function SortIcon({ dir }: { dir: 'asc' | 'desc' }) {
  return (
    <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor" className="shrink-0 ml-0.5">
      <path d={dir === 'asc' ? 'M4 1l3 4H1z' : 'M4 9l3-4H1z'} />
    </svg>
  );
}

const headers: Array<{ key: SortKey; label: string; align?: 'right' }> = [
  { key: 'talentName', label: 'Creator' },
  { key: 'platform', label: 'Platform' },
  { key: 'currentValue', label: 'Current', align: 'right' },
  { key: 'startValue', label: 'Start', align: 'right' },
  { key: 'absoluteChange', label: 'Change', align: 'right' },
  { key: 'percentChange', label: '% Growth', align: 'right' },
];

export function GrowthTable({ rows, onCreatorClick }: GrowthTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('currentValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey] ?? -Infinity;
    const bVal = b[sortKey] ?? -Infinity;
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {headers.map((h) => {
              const active = sortKey === h.key;
              return (
                <th
                  key={h.key}
                  onClick={() => handleSort(h.key)}
                  className={`${h.align === 'right' ? 'text-right' : 'text-left'} px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors border-b border-sp-border ${
                    active ? 'text-sp-dark' : 'text-sp-muted hover:text-sp-dark'
                  }`}
                >
                  <span className="inline-flex items-center">
                    {h.label}
                    {active && <SortIcon dir={sortDir} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={`${row.talentId}-${row.platform}`}
              onClick={() => onCreatorClick?.(row.talentId)}
              className="group border-b border-sp-border/30 cursor-pointer transition-colors hover:bg-sp-orange/[0.03]"
            >
              <td className="px-4 py-2.5 text-[12px] font-medium text-sp-dark group-hover:text-sp-orange transition-colors">
                {row.talentName}
              </td>
              <td className="px-4 py-2.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                  row.platform === 'youtube' ? 'text-red-500' : 'text-purple-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    row.platform === 'youtube' ? 'bg-red-500' : 'bg-purple-500'
                  }`} />
                  {row.platform === 'youtube' ? 'YT' : 'TW'}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] tabular-nums text-sp-dark font-medium">
                {formatCompact(row.currentValue)}
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] tabular-nums text-sp-muted">
                {formatCompact(row.startValue)}
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] tabular-nums">
                <span className={changeColor(row.absoluteChange)}>
                  {row.absoluteChange >= 0 ? '+' : ''}{formatCompact(row.absoluteChange)}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] tabular-nums">
                {row.percentChange !== null ? (
                  <span className={`font-medium ${changeColor(row.percentChange)}`}>
                    {row.percentChange >= 0 ? '+' : ''}{row.percentChange.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-sp-muted/40">&mdash;</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
