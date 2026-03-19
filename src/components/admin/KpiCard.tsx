interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}

export function KpiCard({ label, value, subtitle, accent }: KpiCardProps) {
  return (
    <div className={`rounded-2xl p-6 transition-shadow hover:shadow-md ${
      accent
        ? 'bg-sp-dark text-white border border-white/10'
        : 'bg-white border border-sp-border'
    }`}>
      <div className={`font-display text-3xl sm:text-4xl font-black truncate ${
        accent ? 'text-white' : 'gradient-text'
      }`} title={value}>
        {value}
      </div>
      <div className={`text-sm mt-1 ${accent ? 'text-white/60' : 'text-sp-muted'}`}>{label}</div>
      {subtitle && (
        <div className={`text-xs mt-0.5 ${accent ? 'text-white/40' : 'text-sp-muted'}`}>{subtitle}</div>
      )}
    </div>
  );
}
