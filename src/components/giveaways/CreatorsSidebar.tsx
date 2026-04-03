'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { Talent } from '@/types';

type CreatorsSidebarProps = {
  creators: (Talent & { giveawayCount: number })[];
  selected: number | null;
  onSelect: (id: number | null) => void;
};

export function CreatorsSidebar({ creators, selected, onSelect }: CreatorsSidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="font-display text-sm font-black uppercase tracking-[0.15em] text-white/50 mb-4 px-2">
        Creadores
      </h2>
      <div className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-semibold ${
            selected === null
              ? 'gw-creator-active text-white'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-sp-grad flex items-center justify-center text-white text-[10px] font-black shrink-0">
            ALL
          </div>
          <span>Todos</span>
        </button>

        {creators.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              selected === c.id
                ? 'gw-creator-active text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
            }`}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
              {c.photoUrl ? (
                <Image src={c.photoUrl} alt={c.name} fill sizes="32px" className="object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/60"
                  style={{ background: `linear-gradient(135deg, ${c.gradientC1}, ${c.gradientC2})` }}
                >
                  {c.initials}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide truncate">{c.name}</p>
              <p className="text-[10px] text-white/30">{c.giveawayCount} sorteos</p>
            </div>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
