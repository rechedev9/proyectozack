'use client';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'motion/react';
import { CreatorsSidebar } from './CreatorsSidebar';
import { BrandsSidebar } from './BrandsSidebar';
import { TopWinners } from './TopWinners';
import { RecentWinners } from './RecentWinners';
import { GiveawayHubCard } from './GiveawayHubCard';
import { CodeCard } from './CodeCard';
import type { GiveawayWithTalent, CreatorCodeWithTalent, GiveawayWinnerWithGiveaway, Talent } from '@/types';

type GiveawaysHubProps = {
  active: GiveawayWithTalent[];
  finished: GiveawayWithTalent[];
  codes: CreatorCodeWithTalent[];
  creators: (Talent & { giveawayCount: number })[];
  brands: { name: string; logo: string | null }[];
  topWinners: { winnerName: string; winnerAvatar: string | null; wins: number }[];
  recentWinners: GiveawayWinnerWithGiveaway[];
};

const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function GiveawaysHub({ active, finished, codes, creators, brands, topWinners, recentWinners }: GiveawaysHubProps) {
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [tab, setTab] = useState<'codes' | 'giveaways'>('codes');

  const filteredActive = useMemo(
    () => selectedCreator ? active.filter((g) => g.talentId === selectedCreator) : active,
    [active, selectedCreator],
  );
  const filteredFinished = useMemo(
    () => selectedCreator ? finished.filter((g) => g.talentId === selectedCreator) : finished,
    [finished, selectedCreator],
  );
  const filteredCodes = useMemo(
    () => selectedCreator ? codes.filter((c) => c.talentId === selectedCreator) : codes,
    [codes, selectedCreator],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left sidebar */}
        <CreatorsSidebar creators={creators} selected={selectedCreator} onSelect={setSelectedCreator} />

        {/* Center */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04] w-fit">
            <button
              onClick={() => setTab('codes')}
              className={`px-5 py-2 rounded-lg text-[12px] font-black uppercase tracking-[0.15em] transition-all ${
                tab === 'codes' ? 'bg-sp-grad text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Códigos
            </button>
            <button
              onClick={() => setTab('giveaways')}
              className={`px-5 py-2 rounded-lg text-[12px] font-black uppercase tracking-[0.15em] transition-all ${
                tab === 'giveaways' ? 'bg-sp-grad text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Sorteos
            </button>
          </div>

          {/* Giveaways tab */}
          {tab === 'giveaways' && (
            <>
              {filteredActive.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white/60 gw-section-title mb-5">
                    Sorteos Activos
                  </h2>
                  <motion.div
                    variants={gridContainer}
                    initial="hidden"
                    animate="show"
                    key={`active-${selectedCreator}`}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {filteredActive.map((g) => (
                      <motion.div key={g.id} variants={gridItem}>
                        <GiveawayHubCard giveaway={g} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}

              {filteredFinished.length > 0 && (
                <section>
                  <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white/60 gw-section-title mb-5">
                    Finalizados
                  </h2>
                  <motion.div
                    variants={gridContainer}
                    initial="hidden"
                    animate="show"
                    key={`finished-${selectedCreator}`}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {filteredFinished.map((g) => (
                      <motion.div key={g.id} variants={gridItem}>
                        <GiveawayHubCard giveaway={g} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}

              {filteredActive.length === 0 && filteredFinished.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-lg font-bold uppercase tracking-wider text-white/20">
                    No hay sorteos {selectedCreator ? 'para este creador' : ''}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Codes tab */}
          {tab === 'codes' && (
            <>
              {filteredCodes.length > 0 ? (
                <motion.div
                  variants={gridContainer}
                  initial="hidden"
                  animate="show"
                  key={`codes-${selectedCreator}`}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {filteredCodes.map((c) => (
                    <motion.div key={c.id} variants={gridItem}>
                      <CodeCard code={c} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg font-bold uppercase tracking-wider text-white/20">
                    No hay códigos {selectedCreator ? 'para este creador' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-48 shrink-0 space-y-0">
          <BrandsSidebar brands={brands} />
          <TopWinners winners={topWinners} />
          <RecentWinners winners={recentWinners} />
        </div>
      </div>
    </div>
  );
}
