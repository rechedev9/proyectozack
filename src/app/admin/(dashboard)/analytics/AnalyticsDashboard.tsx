'use client';

import { useState, useMemo } from 'react';
import { KpiCard } from '@/components/admin/KpiCard';
import { MiniAreaChart } from '@/components/admin/MiniAreaChart';
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

  const filtered = useMemo(() => {
    return snapshots.filter((s) => {
      if (s.snapshotDate < from || s.snapshotDate > to) return false;
      if (platformFilter !== 'all' && s.platform !== platformFilter) return false;
      if (selectedCreators.length > 0 && !selectedCreators.includes(s.talentId)) return false;
      return true;
    });
  }, [snapshots, from, to, platformFilter, selectedCreators]);

  const talentMap = useMemo(() => new Map(talents.map((t) => [t.id, t])), [talents]);

  // KPIs
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
    let ytFollowers = 0;
    let twFollowers = 0;
    let totalGrowthPct = 0;
    let growthEntries = 0;
    let ytGrowthPct = 0;
    let ytGrowthEntries = 0;
    let twGrowthPct = 0;
    let twGrowthEntries = 0;

    for (const [key, latest] of latestByKey) {
      totalFollowers += latest.value;
      if (latest.platform === 'youtube') ytFollowers += latest.value;
      if (latest.platform === 'twitch') twFollowers += latest.value;

      const earliest = earliestByKey.get(key);
      if (earliest && earliest.value > 0) {
        const pct = ((latest.value - earliest.value) / earliest.value) * 100;
        totalGrowthPct += pct;
        growthEntries++;
        if (latest.platform === 'youtube') { ytGrowthPct += pct; ytGrowthEntries++; }
        if (latest.platform === 'twitch') { twGrowthPct += pct; twGrowthEntries++; }
      }
    }

    return {
      totalFollowers: formatCompact(totalFollowers),
      totalGrowthPct: growthEntries > 0 ? totalGrowthPct / growthEntries : null,
      ytFollowers: formatCompact(ytFollowers),
      ytGrowthPct: ytGrowthEntries > 0 ? ytGrowthPct / ytGrowthEntries : null,
      twFollowers: formatCompact(twFollowers),
      twGrowthPct: twGrowthEntries > 0 ? twGrowthPct / twGrowthEntries : null,
      trackedCount: trackedCount.toString(),
    };
  }, [filtered, talentMap, trackedCount]);

  // Platform-aggregated time series for mini area charts
  const platformTimeSeries = useMemo(() => {
    const ytMap = new Map<string, number>();
    const twMap = new Map<string, number>();

    for (const s of filtered) {
      const map = s.platform === 'youtube' ? ytMap : twMap;
      map.set(s.snapshotDate, (map.get(s.snapshotDate) ?? 0) + s.value);
    }

    const ytData = Array.from(ytMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));

    const twData = Array.from(twMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));

    return { youtube: ytData, twitch: twData };
  }, [filtered]);

  // Full chart data (for overview)
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();
    for (const s of filtered) {
      const talent = talentMap.get(s.talentId);
      if (!talent) continue;
      const lineKey = `${talent.name} (${s.platform === 'youtube' ? 'YT' : 'TW'})`;
      if (!dateMap.has(s.snapshotDate)) dateMap.set(s.snapshotDate, {});
      dateMap.get(s.snapshotDate)![lineKey] = s.value;
    }
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }, [filtered, talentMap]);

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

  // Drill-down
  const drillDownTalent = drillDownTalentId ? talentMap.get(drillDownTalentId) : null;
  const drillDownData = useMemo(() => {
    if (!drillDownTalentId) return { chartData: [] as Array<{ date: string; [k: string]: string | number }>, lines: [] as Array<{ key: string; color: string; name: string }>, summaries: [] as Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> };

    const talentSnapshots = filtered.filter((s) => s.talentId === drillDownTalentId);
    const dateMap = new Map<string, Record<string, number>>();
    const byPlatform = new Map<string, TalentMetricSnapshot[]>();

    for (const s of talentSnapshots) {
      const lineKey = s.platform === 'youtube' ? 'YouTube' : 'Twitch';
      if (!dateMap.has(s.snapshotDate)) dateMap.set(s.snapshotDate, {});
      dateMap.get(s.snapshotDate)![lineKey] = s.value;
      if (!byPlatform.has(s.platform)) byPlatform.set(s.platform, []);
      byPlatform.get(s.platform)!.push(s);
    }

    const chartData = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));

    const lines: Array<{ key: string; color: string; name: string }> = [];
    if (chartData.some((d) => 'YouTube' in d)) lines.push({ key: 'YouTube', color: '#ef4444', name: 'YouTube' });
    if (chartData.some((d) => 'Twitch' in d)) lines.push({ key: 'Twitch', color: '#8b5cf6', name: 'Twitch' });

    const summaries: Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> = [];
    for (const [platform, snaps] of byPlatform) {
      const sorted = [...snaps].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
      if (sorted.length >= 1) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const days = Math.ceil((new Date(last.snapshotDate).getTime() - new Date(first.snapshotDate).getTime()) / (1000 * 60 * 60 * 24));
        summaries.push({
          platform, from: first.value, to: last.value,
          pct: first.value > 0 ? ((last.value - first.value) / first.value) * 100 : null,
          days: Math.max(days, 1),
        });
      }
    }

    return { chartData, lines, summaries };
  }, [drillDownTalentId, filtered]);

  return (
    <div className="max-w-[1200px]">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-sp-dark">
            Analytics
          </h1>
          <p className="text-[11px] text-sp-muted mt-0.5">
            {filtered.length} snapshots &middot; {new Set(filtered.map((s) => s.talentId)).size} creators &middot; {from} &rarr; {to}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }}
          />
          <div className="w-px h-5 bg-sp-border/60 mx-0.5 hidden sm:block" />
          <PlatformFilter value={platformFilter} onChange={setPlatformFilter} />
          <div className="w-px h-5 bg-sp-border/60 mx-0.5 hidden sm:block" />
          <CreatorFilter
            creators={talents.map((t) => ({ id: t.id, name: t.name }))}
            selected={selectedCreators}
            onChange={setSelectedCreators}
          />
        </div>
      </div>

      {/* Content */}
      {drillDownTalent ? (
        <DrillDown
          talent={drillDownTalent}
          data={drillDownData}
          from={from}
          to={to}
          onBack={() => setDrillDownTalentId(null)}
        />
      ) : (
        <div className="space-y-4">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Total Followers"
              value={kpis.totalFollowers}
              change={kpis.totalGrowthPct}
              color="#f5632a"
            />
            <KpiCard
              label="YouTube Subscribers"
              value={kpis.ytFollowers}
              change={kpis.ytGrowthPct}
              color="#ef4444"
            />
            <KpiCard
              label="Twitch Followers"
              value={kpis.twFollowers}
              change={kpis.twGrowthPct}
              color="#8b5cf6"
            />
            <KpiCard
              label="Creators Tracked"
              value={kpis.trackedCount}
              subtitle="active in roster"
            />
          </div>

          {/* Mini Area Charts — platform trends side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MiniAreaChart
              title="YouTube Trend"
              data={platformTimeSeries.youtube}
              color="#ef4444"
              height={180}
            />
            <MiniAreaChart
              title="Twitch Trend"
              data={platformTimeSeries.twitch}
              color="#8b5cf6"
              height={180}
            />
          </div>

          {/* Summary table */}
          <div className="rounded-xl bg-white border border-sp-border/50 overflow-hidden">
            <div className="flex items-baseline justify-between px-5 pt-4 pb-2">
              <h2 className="text-[13px] font-semibold text-sp-dark">Creator Summary</h2>
              <span className="text-[10px] text-sp-muted">{growthRows.length} entries</span>
            </div>
            <GrowthTable rows={growthRows} onCreatorClick={setDrillDownTalentId} />
          </div>

          {/* Full chart (collapsible detail) */}
          {chartData.length > 1 && (
            <details className="rounded-xl bg-white border border-sp-border/50 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer text-[13px] font-semibold text-sp-dark hover:bg-sp-off/50 transition-colors select-none">
                All Series Chart
                <span className="text-[10px] font-normal text-sp-muted ml-2">{chartLines.length} series &middot; click to expand</span>
              </summary>
              <div className="px-5 pb-5">
                <MetricsChart data={chartData} lines={chartLines} height={350} />
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

/** Drill-down view for a single creator */
function DrillDown({ talent, data, from, to, onBack }: {
  talent: Pick<Talent, 'id' | 'name' | 'slug'>;
  data: { chartData: Array<{ date: string; [k: string]: string | number }>; lines: Array<{ key: string; color: string; name: string }>; summaries: Array<{ platform: string; from: number; to: number; pct: number | null; days: number }> };
  from: string;
  to: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-[12px] text-sp-muted hover:text-sp-dark transition-colors"
        >
          &larr; Overview
        </button>
        <div className="w-px h-4 bg-sp-border/60" />
        <h2 className="font-display text-xl font-black uppercase text-sp-dark">
          {talent.name}
        </h2>
      </div>

      {/* Platform KPIs */}
      {data.summaries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.summaries.map((s) => (
            <KpiCard
              key={s.platform}
              label={s.platform === 'youtube' ? 'YouTube Subscribers' : 'Twitch Followers'}
              value={formatCompact(s.to)}
              change={s.pct}
              subtitle={`from ${formatCompact(s.from)} over ${s.days}d`}
              color={s.platform === 'youtube' ? '#ef4444' : '#8b5cf6'}
            />
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl bg-white border border-sp-border/50 p-5">
        <MetricsChart data={data.chartData} lines={data.lines} height={400} />
      </div>

      {/* Export */}
      <a
        href={`/admin/analytics/report/${talent.slug}?from=${from}&to=${to}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sp-dark text-white text-[12px] font-medium hover:bg-sp-black transition-colors"
      >
        Export Report
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 10l8-8M4 2h6v6" />
        </svg>
      </a>
    </div>
  );
}
