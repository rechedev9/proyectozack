'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import * as m from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import type { PortfolioItem } from '@/types';
import { FilterTabs } from '@/components/ui/FilterTabs';

type PortfolioGridProps = {
  items: PortfolioItem[];
}

const FILTERS = [
  { key: 'all', label: 'Todo' },
  { key: 'thumb', label: 'Thumbnails' },
  { key: 'campaign', label: 'Campañas' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

/** Deduplicate items by imageUrl so the same image never appears twice */
function dedupeByImage(items: PortfolioItem[]): PortfolioItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.imageUrl) return true;
    if (seen.has(item.imageUrl)) return false;
    seen.add(item.imageUrl);
    return true;
  });
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const uniqueItems = useMemo(() => dedupeByImage(items), [items]);
  const visible = filter === 'all' ? uniqueItems : uniqueItems.filter((i) => i.type === filter);

  return (
    <>
      <FilterTabs tabs={FILTERS} active={filter} onChange={setFilter} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <m.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="group relative rounded-2xl overflow-hidden bg-sp-bg2 aspect-video"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sp-muted text-sm font-medium">{item.type}</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-bold leading-tight line-clamp-2">{item.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{item.creatorName}</p>
                  {item.views && (
                    <p className="text-sp-orange text-xs font-semibold mt-1">{item.views}</p>
                  )}
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
