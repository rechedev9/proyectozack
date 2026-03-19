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
      <div className="flex items-center justify-center h-64 text-sp-muted text-sm">
        No data available for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis
          tickFormatter={formatCompact}
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip
          formatter={(value) => formatCompact(Number(value))}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', lineHeight: '18px', maxHeight: '54px', overflow: 'hidden' }}
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
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
