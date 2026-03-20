'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type FilterOption = {
  label: string;
  value: string;
}

type FilterChipsProps = {
  paramName: string;
  options: FilterOption[];
}

export function FilterChips({ paramName, options }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName);

  const toggle = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (current === value) {
        params.delete(paramName);
      } else {
        params.set(paramName, value);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, paramName, current],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            current === value
              ? 'bg-sp-grad text-white'
              : 'bg-white border border-sp-border text-sp-dark hover:bg-sp-off'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
