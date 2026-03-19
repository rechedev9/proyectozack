'use client';

import { useState, useRef, useEffect } from 'react';

interface CreatorOption {
  id: number;
  name: string;
}

interface CreatorFilterProps {
  creators: CreatorOption[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function CreatorFilter({ creators, selected, onChange }: CreatorFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const label = selected.length === 0
    ? 'All Creators'
    : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
          selected.length > 0
            ? 'bg-sp-dark text-white shadow-sm'
            : 'text-sp-muted hover:text-sp-dark hover:bg-sp-off'
        }`}
      >
        {label}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-sp-border rounded-xl shadow-lg p-2 w-56 max-h-64 overflow-y-auto">
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-xs text-sp-muted hover:text-sp-dark"
            >
              Clear all
            </button>
          )}
          {creators.map((c) => (
            <label key={c.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-sp-off rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="rounded border-sp-border"
              />
              <span className="text-sm text-sp-dark">{c.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
