'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { TalentWithRelations } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { gradientStyle } from '@/lib/gradient';

interface TalentModalProps {
  talent: TalentWithRelations;
  onClose: () => void;
}

export function TalentModal({ talent, onClose }: TalentModalProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const grad = gradientStyle(talent.gradientC1, talent.gradientC2);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56" style={{ background: grad }}>
          {talent.photoUrl && (
            <Image
              src={talent.photoUrl}
              alt={talent.name}
              fill
              className="object-cover object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-4 flex items-end gap-3">
            <div>
              <h2 className="font-display text-3xl font-black uppercase text-white leading-none">
                {talent.name}
              </h2>
              <p className="text-white/80 text-sm">{talent.role}</p>
            </div>
            <StatusBadge status={talent.status} className="mb-0.5" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Bio */}
          <p className="text-sp-muted text-sm leading-relaxed">{talent.bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {talent.stats.map((stat) => (
              <div
                key={stat.id}
                className="rounded-xl border border-sp-border bg-sp-off p-3 text-center"
              >
                <div className="text-lg font-bold text-sp-dark">{stat.value}</div>
                <div className="text-xs text-sp-muted leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {talent.tags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-3 py-1 rounded-full bg-sp-bg2 text-sp-muted font-medium"
              >
                {t.tag}
              </span>
            ))}
          </div>

          {/* Socials */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-sp-muted">Redes sociales</h3>
            {talent.socials.map((s) => (
              <a
                key={s.id}
                href={s.profileUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl bg-sp-off px-4 py-3 hover:bg-sp-bg2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${s.hexColor}20` }}
                  >
                    <SocialIcon type={s.platform} color={s.hexColor} size={16} />
                  </div>
                  <span className="text-sm font-semibold text-sp-dark">{s.handle}</span>
                </div>
                <span className="text-sm font-bold text-sp-dark">{s.followersDisplay}</span>
              </a>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#contacto"
            onClick={onClose}
            className="block text-center w-full py-3.5 rounded-full font-bold text-white text-sm"
            style={{ background: grad }}
          >
            Contactar para colaboración
          </a>
        </div>
      </div>
    </div>
  );
}
