'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as m from 'motion/react-client';
import type { CaseStudyWithRelations } from '@/types';

interface CaseCardProps {
  caseStudy: CaseStudyWithRelations;
}

export function CaseCard({ caseStudy }: CaseCardProps) {
  return (
    <Link href={`/casos/${caseStudy.slug}`} className="block">
      <m.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-2xl border border-sp-border bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
      >
        {/* Colored header strip */}
        <div className="h-16 flex items-center justify-between px-5 bg-sp-dark">
          {/* Brand logo or name */}
          <div className="flex items-center gap-3">
            {caseStudy.logoUrl ? (
              <Image
                src={caseStudy.logoUrl}
                alt={caseStudy.brandName}
                width={80}
                height={32}
                className="object-contain max-h-8 brightness-0 invert"
              />
            ) : (
              <span className="font-display text-xl font-black text-white">{caseStudy.brandName}</span>
            )}
          </div>
          {/* × SocialPro */}
          <span className="font-display text-sm font-black text-white/50">× SocialPro</span>
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1">
          {/* BRAND + SOCIALPRO label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-sp-orange mb-2">
            {caseStudy.brandName} + SocialPro
          </p>

          <h3 className="font-display text-lg font-black uppercase text-sp-dark leading-snug mb-3 line-clamp-2">
            {caseStudy.title}
          </h3>

          {/* Body preview */}
          {caseStudy.body[0] && (
            <p className="text-sm text-sp-muted leading-relaxed mb-4 line-clamp-3">
              {caseStudy.body[0].paragraph}
            </p>
          )}

          {/* Stats row from tags (first 3) */}
          {caseStudy.tags.length > 0 && (
            <div className="flex gap-3 flex-wrap mb-4">
              {caseStudy.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="text-[10px] px-2 py-1 rounded-full bg-sp-off text-sp-muted font-semibold uppercase tracking-wide"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <span className="text-xs font-semibold text-sp-orange hover:underline">
              Leer más &rarr;
            </span>
          </div>
        </div>
      </m.div>
    </Link>
  );
}
