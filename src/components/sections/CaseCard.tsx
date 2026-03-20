'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as m from 'motion/react-client';
import type { CaseStudyWithRelations } from '@/types';

type CaseCardProps = {
  caseStudy: CaseStudyWithRelations;
}

// Map brandName → brand logo path for cases without a dedicated logoUrl
const BRAND_LOGO_MAP: Record<string, string> = {
  'RAZER': '/images/brands/razer.png',
  '1WIN': '/images/brands/1win.png',
};

export function CaseCard({ caseStudy }: CaseCardProps) {
  const logoSrc = caseStudy.logoUrl || BRAND_LOGO_MAP[caseStudy.brandName] || null;

  // Build metrics from DB fields
  const metrics = [
    caseStudy.reach ? { value: caseStudy.reach, label: 'Alcance' } : null,
    caseStudy.engagementRate ? { value: caseStudy.engagementRate, label: 'Engagement' } : null,
    caseStudy.conversions ? { value: caseStudy.conversions, label: 'Conversiones' } : null,
    caseStudy.roiMultiplier ? { value: caseStudy.roiMultiplier, label: 'ROI' } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <Link href={`/casos/${caseStudy.slug}`} className="block">
      <m.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-2xl border border-white/10 bg-sp-dark overflow-hidden hover:border-white/20 transition-colors flex flex-col h-full"
      >
        {/* Header with brand logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={caseStudy.brandName}
                width={100}
                height={36}
                className="object-contain max-h-8"
              />
            ) : (
              <span className="font-display text-xl font-black text-white">{caseStudy.brandName}</span>
            )}
          </div>
          <span className="font-display text-sm font-black text-white/40">×</span>
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Brand label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-sp-orange mb-2">
            {caseStudy.brandName} + SocialPro
          </p>

          <h3 className="font-display text-lg font-black uppercase text-white leading-snug mb-3 line-clamp-2">
            {caseStudy.title}
          </h3>

          {/* Body preview */}
          {caseStudy.body[0] && (
            <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-3">
              {caseStudy.body[0].paragraph}
            </p>
          )}

          {/* Metrics row */}
          {metrics.length > 0 && (
            <div className="flex gap-4 mb-4">
              {metrics.slice(0, 3).map((m) => (
                <div key={m.label} className="text-center">
                  <div className="font-display text-xl font-black text-white leading-none">{m.value}</div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-white/40 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {caseStudy.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {caseStudy.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 font-semibold uppercase tracking-wide border border-white/10"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <span className="text-xs font-semibold text-sp-orange">
              Leer más &rarr;
            </span>
          </div>
        </div>
      </m.div>
    </Link>
  );
}
