'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { CaseStudyWithRelations } from '@/types';

interface CaseModalProps {
  caseStudy: CaseStudyWithRelations;
  onClose: () => void;
}

export function CaseModal({ caseStudy, onClose }: CaseModalProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-sp-black border border-white/10 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              {caseStudy.logoUrl ? (
                <Image
                  src={caseStudy.logoUrl}
                  alt={caseStudy.brandName}
                  width={80}
                  height={40}
                  className="object-contain max-h-10 brightness-0 invert mb-3"
                />
              ) : (
                <div className="font-display text-3xl font-black gradient-text mb-3">
                  {caseStudy.brandName}
                </div>
              )}
              <h2 className="font-bold text-lg leading-snug">{caseStudy.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors ml-4"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Creators */}
          {caseStudy.creators.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
                Creadores participantes
              </h3>
              <div className="flex flex-wrap gap-2">
                {caseStudy.creators.map((c) => (
                  <span
                    key={c.id}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80"
                  >
                    {c.creatorName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="space-y-4 text-sm text-white/70 leading-relaxed mb-6">
            {caseStudy.body.map((p) => (
              <p key={p.id}>{p.paragraph}</p>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {caseStudy.tags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60"
              >
                {t.tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
