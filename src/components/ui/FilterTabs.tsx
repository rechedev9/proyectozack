'use client';

import { BRAND_GRADIENT } from '@/lib/gradient';

type Tab<K extends string> = {
  key: K;
  label: string;
}

type FilterTabsProps<K extends string> = {
  tabs: readonly Tab<K>[];
  active: K;
  onChange: (key: K) => void;
}

export function FilterTabs<K extends string>({ tabs, active, onChange }: FilterTabsProps<K>) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8 flex-wrap">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            active === key ? 'text-white' : 'bg-sp-bg2 text-sp-muted hover:text-sp-dark'
          }`}
          style={active === key ? { background: BRAND_GRADIENT } : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
