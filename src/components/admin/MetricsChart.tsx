'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCompact } from '@/lib/format';

interface ChartDataPoint {
  date: string;
  [creatorOrPlatform: string]: string | number;
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  lines: Array<{ key: string; color: string; name: string }>;
  height?: number;
  yAxisLabel?: string;
}

export function MetricsChart({ data, lines, height = 400, yAxisLabel }: MetricsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-sp-muted">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30">
          <path d="M6 36V18l10 6 10-14 10 8 6-6" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="6" y1="36" x2="42" y2="36" />
        </svg>
        <span className="text-sm">No data available for this period</span>
        <span className="text-xs mt-1 text-sp-muted/60">Try adjusting the date range or filters</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceae6" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#a8a39d' }}
          stroke="#eceae6"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatCompact}
          tick={{ fontSize: 11, fill: '#a8a39d' }}
          stroke="#eceae6"
          tickLine={false}
          axisLine={false}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip
          formatter={(value) => formatCompact(Number(value))}
          labelStyle={{ fontWeight: 600, color: '#0e0e0e', fontSize: 12 }}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #eceae6',
            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)',
            fontSize: '12px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', lineHeight: '18px', maxHeight: '54px', overflow: 'hidden', paddingTop: '12px' }}
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            name={line.name}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
