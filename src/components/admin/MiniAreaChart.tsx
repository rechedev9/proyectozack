'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompact } from '@/lib/format';

type MiniAreaChartProps = {
  title: string;
  data: Array<{ date: string; value: number }>;
  color: string;
  height?: number;
}

export function MiniAreaChart({ title, data, color, height = 200 }: MiniAreaChartProps) {
  const gradientId = `area-${title.replace(/\s/g, '-').toLowerCase()}`;

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-sp-border/50 p-5">
        <div className="text-[11px] font-medium text-sp-muted mb-3">{title}</div>
        <div className="flex items-center justify-center text-[11px] text-sp-muted/40" style={{ height }}>
          No data
        </div>
      </div>
    );
  }

  // Calculate total and change
  const first = data[0]!.value;
  const last = data[data.length - 1]!.value;
  const total = last;
  const pct = first > 0 ? ((last - first) / first) * 100 : 0;

  return (
    <div className="rounded-xl bg-white border border-sp-border/50 p-5">
      <div className="flex items-start justify-between mb-1">
        <div className="text-[11px] font-medium text-sp-muted">{title}</div>
        {data.length > 1 && (
          <span className={`text-[10px] font-semibold ${
            pct > 0 ? 'text-emerald-600' : pct < 0 ? 'text-red-500' : 'text-sp-muted/50'
          }`}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="font-display text-xl font-black text-sp-dark tracking-tight mb-3">
        {formatCompact(total)}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eceae6" vertical={false} horizontal={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#a8a39d' }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            formatter={(value) => formatCompact(Number(value))}
            labelStyle={{ fontWeight: 600, color: '#1a1a1a', fontSize: 10 }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2ddd8',
              boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1)',
              fontSize: '11px',
              padding: '6px 10px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
