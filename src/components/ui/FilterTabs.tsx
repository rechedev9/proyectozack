'use client';

import * as m from 'motion/react-client';

import { BRAND_GRADIENT } from '@/lib/gradient';

import type { JSX } from 'react';

type Tab<K extends string> = {
  key: K;
  label: string;
}

type FilterTabsProps<K extends string> = {
  tabs: readonly Tab<K>[];
  active: K;
  onChange: (key: K) => void;
}

export function FilterTabs<K extends string>({ tabs, active, onChange }: FilterTabsProps<K>): JSX.Element {
  return (
    <div className="flex items-center gap-2 justify-center mb-8 flex-wrap">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-pink/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
            active === key ? 'text-white shadow-[0_10px_24px_rgba(224,48,112,0.18)]' : 'bg-sp-bg2 text-sp-muted hover:text-sp-dark'
          }`}
          style={active === key ? { background: BRAND_GRADIENT } : undefined}
        >
          {active === key ? (
            <m.span
              layoutId="active-filter-pill"
              className="absolute inset-0 rounded-full"
              style={{ background: BRAND_GRADIENT }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          ) : null}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}
