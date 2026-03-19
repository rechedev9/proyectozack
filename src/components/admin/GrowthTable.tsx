'use client';

import { useState } from 'react';
import { formatCompact } from '@/lib/format';

export interface GrowthRow {
  talentId: number;
  talentName: string;
  platform: string;
  currentValue: number;
  startValue: number;
  absoluteChange: number;
  percentChange: number | null; // null when startValue is 0
}

interface GrowthTableProps {
  rows: GrowthRow[];
  onCreatorClick?: (talentId: number) => void;
}

type SortKey = 'talentName' | 'platform' | 'currentValue' | 'startValue' | 'absoluteChange' | 'percentChange';

function changeColor(value: number): string {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-red-600';
  return 'text-sp-muted';
}

export function GrowthTable({ rows, onCreatorClick }: GrowthTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('percentChange');
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

  const headers: Array<{ key: SortKey; label: string; align?: string }> = [
    { key: 'talentName', label: 'Creator' },
    { key: 'platform', label: 'Platform' },
    { key: 'currentValue', label: 'Current', align: 'right' },
    { key: 'startValue', label: 'Start', align: 'right' },
    { key: 'absoluteChange', label: 'Change', align: 'right' },
    { key: 'percentChange', label: '% Growth', align: 'right' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-sp-border">
            {headers.map((h) => {
              const active = sortKey === h.key;
              return (
                <th
                  key={h.key}
                  onClick={() => handleSort(h.key)}
                  className={`${h.align === 'right' ? 'text-right' : 'text-left'} px-4 py-3 font-semibold cursor-pointer select-none transition-colors ${
                    active ? 'text-sp-dark' : 'text-sp-muted hover:text-sp-dark'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {h.label}
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="shrink-0">
                        {sortDir === 'asc'
                          ? <path d="M6 3l4 5H2z" />
                          : <path d="M6 9l4-5H2z" />
                        }
                      </svg>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={`${row.talentId}-${row.platform}`}
              onClick={() => onCreatorClick?.(row.talentId)}
              className={`border-b border-sp-border/40 cursor-pointer transition-colors hover:bg-sp-orange/5 ${
                i % 2 === 1 ? 'bg-sp-off/50' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium text-sp-dark">{row.talentName}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  row.platform === 'youtube'
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                    : 'bg-purple-50 text-purple-600 ring-1 ring-purple-100'
                }`}>
                  {row.platform === 'youtube' ? 'YouTube' : 'Twitch'}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-mono text-sp-dark">{formatCompact(row.currentValue)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-mono text-sp-muted">{formatCompact(row.startValue)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-mono">
                <span className={changeColor(row.absoluteChange)}>
                  {row.absoluteChange >= 0 ? '+' : ''}{formatCompact(row.absoluteChange)}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-mono">
                {row.percentChange !== null ? (
                  <span className={changeColor(row.percentChange)}>
                    {row.percentChange >= 0 ? '+' : ''}{row.percentChange.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-sp-muted">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
