'use client';

interface DateRangePickerProps {
  value: string; // '7d' | '30d' | '90d' | 'custom'
  onChange: (value: string) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}

const presets = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

export function DateRangePicker({ value, onChange, customFrom, customTo, onCustomChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-1">
      {presets.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            value === p.value
              ? 'bg-sp-dark text-white'
              : 'text-sp-muted hover:text-sp-dark hover:bg-sp-off'
          }`}
        >
          {p.label}
        </button>
      ))}
      {value === 'custom' && onCustomChange && (
        <div className="flex items-center gap-1.5 ml-2">
          <input
            type="date"
            value={customFrom ?? ''}
            onChange={(e) => onCustomChange(e.target.value, customTo ?? '')}
            className="px-2.5 py-1.5 rounded-lg border border-sp-border text-[12px] text-sp-dark bg-transparent outline-none focus:border-sp-muted transition-colors"
          />
          <span className="text-sp-muted/50 text-xs">&mdash;</span>
          <input
            type="date"
            value={customTo ?? ''}
            onChange={(e) => onCustomChange(customFrom ?? '', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-sp-border text-[12px] text-sp-dark bg-transparent outline-none focus:border-sp-muted transition-colors"
          />
        </div>
      )}
    </div>
  );
}
