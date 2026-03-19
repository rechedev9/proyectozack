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

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: 'talentName', label: 'Creator' },
    { key: 'platform', label: 'Platform' },
    { key: 'currentValue', label: 'Current' },
    { key: 'startValue', label: 'Start' },
    { key: 'absoluteChange', label: 'Change' },
    { key: 'percentChange', label: '% Growth' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sp-border">
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className="text-left px-4 py-3 text-sp-muted font-medium cursor-pointer hover:text-sp-dark transition-colors"
              >
                {h.label}
                {sortKey === h.key && (sortDir === 'asc' ? ' \u2191' : ' \u2193')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={`${row.talentId}-${row.platform}`}
              onClick={() => onCreatorClick?.(row.talentId)}
              className="border-b border-sp-border/50 hover:bg-sp-off cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-sp-dark">{row.talentName}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  row.platform === 'youtube'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {row.platform === 'youtube' ? 'YouTube' : 'Twitch'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono">{formatCompact(row.currentValue)}</td>
              <td className="px-4 py-3 font-mono">{formatCompact(row.startValue)}</td>
              <td className="px-4 py-3 font-mono">
                <span className={row.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {row.absoluteChange >= 0 ? '+' : ''}{formatCompact(row.absoluteChange)}
                </span>
              </td>
              <td className="px-4 py-3 font-mono">
                {row.percentChange !== null ? (
                  <span className={row.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
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
