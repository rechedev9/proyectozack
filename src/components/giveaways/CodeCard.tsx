'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import type { CreatorCodeWithTalent } from '@/types';

type CodeCardProps = {
  readonly code: CreatorCodeWithTalent;
};

export function CodeCard({ code }: CodeCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code.code]);

  const offer = code.description?.trim() || `Beneficios exclusivos con ${code.brandName}`;

  return (
    <motion.div
      className="gw-sp-card group relative rounded-2xl border border-white/[0.06] bg-[#0e0e0e]/95 overflow-hidden transition-all duration-300 hover:border-sp-orange/30 hover:shadow-[0_0_30px_rgba(245,99,42,0.08)]"
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
    >
      {/* Brand hero — logo protagonista */}
      <div className="relative h-28 flex items-center justify-center bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/[0.04] overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              'radial-gradient(80% 60% at 50% 40%, rgba(245,99,42,0.18) 0%, rgba(224,48,112,0.12) 40%, transparent 75%)',
          }}
          aria-hidden
        />
        {code.brandLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={code.brandLogo}
            alt={code.brandName}
            className="relative z-10 max-h-14 max-w-[60%] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="relative z-10 font-display text-3xl font-black uppercase tracking-[0.15em] text-white/80">
            {code.brandName}
          </span>
        )}
      </div>

      {/* Offer / description — la oferta clara */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sp-orange/80 mb-1.5">
          {code.brandName}
        </p>
        <p className="text-sm font-bold text-white leading-snug line-clamp-2">
          {offer}
        </p>
      </div>

      {/* Code + CTA */}
      <div className="px-5 pb-4 space-y-2.5">
        <div className="flex items-stretch gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-dashed border-white/15">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 shrink-0">
              Code
            </span>
            <span className="flex-1 font-mono text-sm font-black text-sp-orange tracking-[0.15em] truncate">
              {code.code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copiar código ${code.code}`}
            className="px-3 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-black uppercase tracking-wider text-white/70 hover:border-sp-orange/40 hover:text-sp-orange transition-colors shrink-0"
          >
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <a
          href={code.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-sp-grad text-white text-[12px] font-black uppercase tracking-[0.15em] gw-sp-btn-glow transition-all group-hover:tracking-[0.2em]"
        >
          Usar código en {code.brandName}
          <span aria-hidden>→</span>
        </a>
      </div>

      {/* Creator badge */}
      <div className="flex items-center gap-2.5 px-5 py-3 bg-white/[0.02] border-t border-white/[0.04]">
        {code.talent.photoUrl ? (
          <Image
            src={code.talent.photoUrl}
            alt={code.talent.name}
            width={28}
            height={28}
            className="rounded-full object-cover border border-white/10"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white/80 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${code.talent.gradientC1}, ${code.talent.gradientC2})`,
            }}
          >
            {code.talent.initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 leading-none">
            Código de
          </p>
          <p className="text-[12px] font-bold text-white/90 truncate leading-tight mt-0.5">
            {code.talent.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
