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
  const [search, setSearch] = useState('');
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

  const filtered = search
    ? creators.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : creators;

  const label = selected.length === 0
    ? 'All Creators'
    : selected.length === 1
      ? creators.find((c) => c.id === selected[0])?.name ?? '1 selected'
      : `${selected.length} creators`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`min-h-[36px] px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 ${
          selected.length > 0
            ? 'bg-sp-dark text-white'
            : 'text-sp-muted hover:text-sp-dark hover:bg-sp-off'
        }`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-sp-border rounded-xl shadow-lg w-60 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-sp-border/50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators..."
              className="w-full px-2.5 py-1.5 text-[12px] bg-sp-off rounded-lg outline-none placeholder:text-sp-muted/50"
              autoFocus
            />
          </div>

          {/* Clear */}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-[11px] text-sp-muted hover:text-sp-orange transition-colors border-b border-sp-border/30"
            >
              Clear selection
            </button>
          )}

          {/* List */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((c) => (
              <label key={c.id} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-sp-off cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggle(c.id)}
                  className="rounded border-sp-border text-sp-orange focus:ring-sp-orange/30 w-3.5 h-3.5"
                />
                <span className="text-[12px] text-sp-dark">{c.name}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-sp-muted/60 text-center">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
