'use client';

import { useState, useMemo } from 'react';
import { KpiCard } from '@/components/admin/KpiCard';
import { MetricsChart } from '@/components/admin/MetricsChart';
import { GrowthTable, type GrowthRow } from '@/components/admin/GrowthTable';
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { PlatformFilter } from '@/components/admin/PlatformFilter';
import { CreatorFilter } from '@/components/admin/CreatorFilter';
import { formatCompact } from '@/lib/format';
import type { TalentMetricSnapshot, Talent } from '@/types';

interface AnalyticsDashboardProps {
  snapshots: TalentMetricSnapshot[];
  talents: Array<Pick<Talent, 'id' | 'name' | 'slug'>>;
  trackedCount: number;
}

// Brand colors for chart lines
const CHART_COLORS = [
  '#f5632a', '#e03070', '#8b3aad', '#5b9bd5',
  '#c42880', '#2563eb', '#059669', '#d97706',
  '#7c3aed', '#dc2626',
];

function getDateRange(preset: string, customFrom: string, customTo: string): { from: string; to: string } {
  const to = customTo || new Date().toISOString().split('T')[0];
  if (preset === 'custom' && customFrom) return { from: customFrom, to };
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  return { from: fromDate.toISOString().split('T')[0], to };
}

export function AnalyticsDashboard({ snapshots, talents, trackedCount }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'youtube' | 'twitch'>('all');
  const [selectedCreators, setSelectedCreators] = useState<number[]>([]);
  const [drillDownTalentId, setDrillDownTalentId] = useState<number | null>(null);

  const { from, to } = getDateRange(dateRange, customFrom, customTo);

  // Filter snapshots by date range, platform, and selected creators
  const filtered = useMemo(() => {
    return snapshots.filter((s) => {
      if (s.snapshotDate < from || s.snapshotDate > to) return false;
      if (platformFilter !== 'all' && s.platform !== platformFilter) return false;
      if (selectedCreators.length > 0 && !selectedCreators.includes(s.talentId)) return false;
      return true;
    });
  }, [snapshots, from, to, platformFilter, selectedCreators]);

  // Build talent name lookup
  const talentMap = useMemo(() => new Map(talents.map((t) => [t.id, t])), [talents]);

  // KPI calculations
  const kpis = useMemo(() => {
    const latestByKey = new Map<string, TalentMetricSnapshot>();
    const earliestByKey = new Map<string, TalentMetricSnapshot>();

    for (const s of filtered) {
      const key = `${s.talentId}-${s.platform}`;
      const current = latestByKey.get(key);
      if (!current || s.snapshotDate > current.snapshotDate) latestByKey.set(key, s);
      const earliest = earliestByKey.get(key);
      if (!earliest || s.snapshotDate < earliest.snapshotDate) earliestByKey.set(key, s);
    }

    let totalFollowers = 0;
    let totalGrowthPct = 0;
    let growthEntries = 0;
    let topGrower = { name: '-', pct: 0, platform: '' };

    for (const [key, latest] of latestByKey) {
      totalFollowers += latest.value;
      const earliest = earliestByKey.get(key);
      if (earliest && earliest.value > 0) {
        const pct = ((latest.value - earliest.value) / earliest.value) * 100;
        totalGrowthPct += pct;
        growthEntries++;
        if (pct > topGrower.pct) {
          const talent = talentMap.get(latest.talentId);
          topGrower = { name: talent?.name ?? 'Unknown', pct, platform: latest.platform };
        }
      }
    }

    return {
      totalFollowers: formatCompact(totalFollowers),
      avgGrowth: growthEntries > 0 ? `${(totalGrowthPct / growthEntries).toFixed(1)}%` : 'N/A',
      topGrower: topGrower.name !== '-'
        ? `${topGrower.name} (+${topGrower.pct.toFixed(1)}%)`
        : 'No data yet',
      topGrowerPlatform: topGrower.platform,
      trackedCount: trackedCount.toString(),
    };
  }, [filtered, talentMap, trackedCount]);

  // Chart data (grouped by date)
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();

    for (const s of filtered) {
      const talent = talentMap.get(s.talentId);
      if (!talent) continue;
      const lineKey = `${talent.name} (${s.platform === 'youtube' ? 'YT' : 'TW'})`;

      if (!dateMap.has(s.snapshotDate)) dateMap.set(s.snapshotDate, {});
      const entry = dateMap.get(s.snapshotDate)!;
      entry[lineKey] = s.value;
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }, [filtered, talentMap]);

  // Chart lines config
  const chartLines = useMemo(() => {
    const keys = new Set<string>();
    for (const point of chartData) {
      for (const key of Object.keys(point)) {
        if (key !== 'date') keys.add(key);
      }
    }
    return Array.from(keys).map((key, i) => ({
      key,
      color: CHART_COLORS[i % CHART_COLORS.length],
      name: key,
    }));
  }, [chartData]);

  // Growth table rows
  const growthRows = useMemo((): GrowthRow[] => {
    const latestByKey = new Map<string, TalentMetricSnapshot>();
    const earliestByKey = new Map<string, TalentMetricSnapshot>();

    for (const s of filtered) {
      const key = `${s.talentId}-${s.platform}`;
      const current = latestByKey.get(key);
      if (!current || s.snapshotDate > current.snapshotDate) latestByKey.set(key, s);
      const earliest = earliestByKey.get(key);
      if (!earliest || s.snapshotDate < earliest.snapshotDate) earliestByKey.set(key, s);
    }

    const rows: GrowthRow[] = [];
    for (const [, latest] of latestByKey) {
      const key = `${latest.talentId}-${latest.platform}`;
      const earliest = earliestByKey.get(key);
      const talent = talentMap.get(latest.talentId);
      const startValue = earliest?.value ?? latest.value;
      const absoluteChange = latest.value - startValue;
      const percentChange = startValue > 0 ? ((latest.value - startValue) / startValue) * 100 : null;

      rows.push({
        talentId: latest.talentId,
        talentName: talent?.name ?? 'Unknown',
        platform: latest.platform,
        currentValue: latest.value,
        startValue,
        absoluteChange,
        percentChange,
      });
    }

    return rows;
  }, [filtered, talentMap]);

  // Drill-down data for a single talent
  const drillDownTalent = drillDownTalentId ? talentMap.get(drillDownTalentId) : null;
  const drillDownData = useMemo(() => {
    if (!drillDownTalentId) return { chartData: [] as Array<{ date: string; [k: string]: string | number }>, lines: [] as Array<{ key: string; color: string; name: string }>, summaries: [] as Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> };

    const talentSnapshots = filtered.filter((s) => s.talentId === drillDownTalentId);
    const dateMap = new Map<string, Record<string, number>>();
    const byPlatform = new Map<string, TalentMetricSnapshot[]>();

    for (const s of talentSnapshots) {
      const lineKey = s.platform === 'youtube' ? 'YouTube Subscribers' : 'Twitch Followers';
      if (!dateMap.has(s.snapshotDate)) dateMap.set(s.snapshotDate, {});
      dateMap.get(s.snapshotDate)![lineKey] = s.value;

      if (!byPlatform.has(s.platform)) byPlatform.set(s.platform, []);
      byPlatform.get(s.platform)!.push(s);
    }

    const chartData = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));

    const lines: Array<{ key: string; color: string; name: string }> = [];
    if (chartData.some((d) => 'YouTube Subscribers' in d)) {
      lines.push({ key: 'YouTube Subscribers', color: '#FF0000', name: 'YouTube Subscribers' });
    }
    if (chartData.some((d) => 'Twitch Followers' in d)) {
      lines.push({ key: 'Twitch Followers', color: '#9146FF', name: 'Twitch Followers' });
    }

    const summaries: Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> = [];
    for (const [platform, snaps] of byPlatform) {
      const sorted = [...snaps].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
      if (sorted.length >= 1) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const days = Math.ceil((new Date(last.snapshotDate).getTime() - new Date(first.snapshotDate).getTime()) / (1000 * 60 * 60 * 24));
        summaries.push({
          platform,
          from: first.value,
          to: last.value,
          pct: first.value > 0 ? ((last.value - first.value) / first.value) * 100 : null,
          days: Math.max(days, 1),
        });
      }
    }

    return { chartData, lines, summaries };
  }, [drillDownTalentId, filtered]);

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black uppercase text-sp-dark">Analytics</h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-sp-orange to-sp-pink" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Total Followers" value={kpis.totalFollowers} accent />
        <KpiCard label="Avg Growth Rate" value={kpis.avgGrowth} subtitle="this period" />
        <KpiCard label="Top Grower" value={kpis.topGrower} subtitle={kpis.topGrowerPlatform} />
        <KpiCard label="Creators Tracked" value={kpis.trackedCount} />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 rounded-2xl bg-white border border-sp-border px-5 py-4">
        <span className="text-xs font-semibold text-sp-muted uppercase tracking-wider mr-1">Period</span>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }}
        />
        <div className="w-px h-6 bg-sp-border mx-1 hidden sm:block" />
        <span className="text-xs font-semibold text-sp-muted uppercase tracking-wider mr-1 hidden sm:inline">Platform</span>
        <PlatformFilter value={platformFilter} onChange={setPlatformFilter} />
        <div className="w-px h-6 bg-sp-border mx-1 hidden sm:block" />
        <CreatorFilter
          creators={talents.map((t) => ({ id: t.id, name: t.name }))}
          selected={selectedCreators}
          onChange={setSelectedCreators}
        />
      </div>

      {/* Drill-down or Overview */}
      {drillDownTalent ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setDrillDownTalentId(null)}
              className="text-sm text-sp-muted hover:text-sp-dark transition-colors"
            >
              &larr; Back to Overview
            </button>
            <h2 className="font-display text-2xl font-black uppercase text-sp-dark">
              {drillDownTalent.name}
            </h2>
          </div>

          {/* Growth summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {drillDownData.summaries.map((s) => (
              <div key={s.platform} className="rounded-2xl bg-white border border-sp-border p-6">
                <div className="text-sm font-medium text-sp-muted mb-1">
                  {s.platform === 'youtube' ? 'YouTube Subscribers' : 'Twitch Followers'}
                </div>
                <div className="font-display text-2xl font-black text-sp-dark">
                  {formatCompact(s.from)} &rarr; {formatCompact(s.to)}
                </div>
                <div className={`text-sm font-semibold mt-1 ${
                  (s.pct ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {s.pct !== null ? `${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(1)}% in ${s.days} days` : `+${formatCompact(s.to - s.from)} (new)`}
                </div>
              </div>
            ))}
          </div>

          {/* Drill-down chart */}
          <div className="rounded-2xl bg-white border border-sp-border p-6 mb-6">
            <MetricsChart data={drillDownData.chartData} lines={drillDownData.lines} height={450} />
          </div>

          {/* Export Report link */}
          <a
            href={`/admin/analytics/report/${drillDownTalent.slug}?from=${from}&to=${to}`}
            className="inline-block px-6 py-3 rounded-xl bg-sp-dark text-white font-medium text-sm hover:bg-sp-black transition-colors"
          >
            Export Growth Report
          </a>
        </div>
      ) : (
        <div>
          {/* Overview Chart */}
          <div className="rounded-2xl bg-white border border-sp-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-display text-lg font-bold text-sp-dark">Growth Trends</h2>
              <span className="text-xs text-sp-muted bg-sp-off px-2 py-0.5 rounded-full">{chartLines.length} series</span>
            </div>
            <MetricsChart data={chartData} lines={chartLines} />
          </div>

          {/* Growth Table */}
          <div className="rounded-2xl bg-white border border-sp-border p-4 pb-2">
            <div className="flex items-center gap-3 mb-4 px-2">
              <h2 className="font-display text-lg font-bold text-sp-dark">Creator Growth</h2>
              <span className="text-xs text-sp-muted bg-sp-off px-2 py-0.5 rounded-full">{growthRows.length} entries</span>
            </div>
            <GrowthTable rows={growthRows} onCreatorClick={setDrillDownTalentId} />
          </div>
        </div>
      )}
    </div>
  );
}
