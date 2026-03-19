interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

export function KpiCard({ label, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-sp-border p-6">
      <div className="font-display text-3xl sm:text-4xl font-black gradient-text truncate" title={value}>{value}</div>
      <div className="text-sm text-sp-muted mt-1">{label}</div>
      {subtitle && <div className="text-xs text-sp-muted mt-0.5">{subtitle}</div>}
    </div>
  );
}
