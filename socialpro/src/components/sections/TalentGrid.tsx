'use client';

import { useState } from 'react';
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
        {visible.map((talent) => (
          <TalentCard
            key={talent.id}
            talent={talent}
            onOpen={() => setSelected(talent)}
          />
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <TalentModal talent={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
