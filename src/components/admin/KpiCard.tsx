type KpiCardProps = {
  label: string;
  value: string;
  change?: number | null; // percentage change
  subtitle?: string;
  color?: string; // accent color for top border
}

export function KpiCard({ label, value, change, subtitle, color }: KpiCardProps) {
  const hasChange = change !== null && change !== undefined;
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;
  const isNeutral = hasChange && change === 0;

  return (
    <div
      className="rounded-xl bg-white border border-sp-border/50 p-5 transition-shadow hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]"
      style={color ? { borderTopColor: color, borderTopWidth: '2px' } : undefined}
    >
      <div className="text-[11px] font-medium text-sp-muted mb-2">{label}</div>
      <div className="flex items-end gap-2.5">
        <span className="font-display text-[1.75rem] font-black leading-none text-sp-dark tracking-tight truncate" title={value}>
          {value}
        </span>
        {hasChange && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold pb-0.5 ${
            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-sp-muted/50'
          }`}>
            {!isNeutral && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={isNegative ? 'rotate-180' : ''}>
                <path d="M5 2l4 5H1z" />
              </svg>
            )}
            {isNeutral ? '0%' : `${Math.abs(change).toFixed(1)}%`}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="text-[10px] text-sp-muted/60 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
