'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CaseStudyWithRelations } from '@/types';
import { CaseModal } from './CaseModal';

interface CaseCardProps {
  caseStudy: CaseStudyWithRelations;
}

export function CaseCard({ caseStudy }: CaseCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group text-left w-full rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-sp-orange/30 hover:bg-white/10 transition-all focus:outline-none"
      >
        {/* Logo */}
        <div className="h-12 mb-5 flex items-center">
          {caseStudy.logoUrl ? (
            <Image
              src={caseStudy.logoUrl}
              alt={caseStudy.brandName}
              width={80}
              height={40}
              className="object-contain max-h-10 brightness-0 invert"
            />
          ) : (
            <span className="font-display text-2xl font-black text-white">{caseStudy.brandName}</span>
          )}
        </div>

        <h3 className="font-bold text-white text-sm leading-snug mb-3 line-clamp-2">
          {caseStudy.title}
        </h3>

        {/* Tags preview */}
        <div className="flex flex-wrap gap-1.5">
          {caseStudy.tags.slice(0, 3).map((t) => (
            <span
              key={t.id}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70"
            >
              {t.tag}
            </span>
          ))}
        </div>

        <div className="mt-4 text-xs font-semibold text-sp-orange group-hover:underline">
          Ver caso completo →
        </div>
      </button>

      {open && <CaseModal caseStudy={caseStudy} onClose={() => setOpen(false)} />}
    </>
  );
}
