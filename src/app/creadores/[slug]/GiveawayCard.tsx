'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { CountdownTimer } from './CountdownTimer';
import type { Giveaway } from '@/types';

interface GiveawayCardProps {
  giveaway: Giveaway;
}

export function GiveawayCard({ giveaway }: GiveawayCardProps) {
  const [expired, setExpired] = useState(false);
  const isFinished = expired || new Date(giveaway.endsAt) <= new Date();

  const handleExpired = useCallback(() => setExpired(true), []);

  return (
    <motion.a
      href={isFinished ? undefined : giveaway.redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border overflow-hidden transition-colors ${
        isFinished
          ? 'border-white/5 bg-[#0b0c0e]/50 grayscale pointer-events-none'
          : 'border-[#1a1b1e] bg-[#0b0c0e] hover:border-[#C3FC00]/40'
      }`}
      whileHover={isFinished ? undefined : { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      {/* Brand bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#050607] border-b border-[#1a1b1e]">
        {giveaway.brandLogo && (
          <Image
            src={giveaway.brandLogo}
            alt={giveaway.brandName}
            width={20}
            height={20}
            className="rounded-sm object-contain"
          />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-white/60">
          {giveaway.brandName}
        </span>
      </div>

      {/* Prize image */}
      <div className="relative aspect-[4/3] bg-[#050607] overflow-hidden">
        {giveaway.imageUrl ? (
          <Image
            src={giveaway.imageUrl}
            alt={giveaway.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black">
            ?
          </div>
        )}
        {!isFinished && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[#C3FC00]/5" />
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-black text-sm uppercase tracking-wide text-white leading-tight">
            {giveaway.title}
          </h3>
          {giveaway.value && (
            <p className="text-lg font-black text-[#C3FC00] mt-1" style={{ textShadow: '0 0 12px rgba(195,252,0,0.4)' }}>
              {giveaway.value}
            </p>
          )}
        </div>

        {/* Countdown or Finished badge */}
        <div className="flex justify-center">
          {isFinished ? (
            <div className="inline-flex px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm font-bold uppercase tracking-wider text-white/50">Finalizado</span>
            </div>
          ) : (
            <CountdownTimer endsAt={giveaway.endsAt.toISOString()} onExpired={handleExpired} />
          )}
        </div>

        {/* CTA Button */}
        {!isFinished && (
          <div className="pt-1">
            <div className="w-full py-2.5 rounded-lg bg-[#C3FC00] text-black text-center text-sm font-black uppercase tracking-wider transition-shadow group-hover:shadow-[0_0_20px_rgba(195,252,0,0.3)] giveaway-btn-glow">
              Participar
            </div>
          </div>
        )}
      </div>
    </motion.a>
  );
}
