'use client';

type PlatformFilterProps = {
  value: 'all' | 'youtube' | 'twitch';
  onChange: (value: 'all' | 'youtube' | 'twitch') => void;
}

const options: Array<{ label: string; value: PlatformFilterProps['value'] }> = [
  { label: 'All', value: 'all' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitch', value: 'twitch' },
];

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            value === o.value
              ? 'bg-sp-dark text-white'
              : 'text-sp-muted hover:text-sp-dark hover:bg-sp-off'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
