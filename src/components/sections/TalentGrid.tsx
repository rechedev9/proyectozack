'use client';

import { useState } from 'react';
import * as m from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import type { TalentWithRelations } from '@/types';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { TalentCard } from './TalentCard';
import { TalentModal } from './TalentModal';

interface TalentGridProps {
  talents: TalentWithRelations[];
}

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'twitch', label: 'Twitch' },
  { key: 'youtube', label: 'YouTube' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export function TalentGrid({ talents }: TalentGridProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<TalentWithRelations | null>(null);

  const visible =
    filter === 'all' ? talents : talents.filter((t) => t.platform === filter);

  return (
    <>
      <FilterTabs tabs={FILTERS} active={filter} onChange={setFilter} />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((talent) => (
            <m.div
              key={talent.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <TalentCard
                talent={talent}
                onOpen={() => setSelected(talent)}
              />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      {selected && (
        <TalentModal talent={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
