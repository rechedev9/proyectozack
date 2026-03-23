'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import type { CreatorCodeWithTalent } from '@/types';

type CodeCardProps = {
  code: CreatorCodeWithTalent;
}

export function CodeCard({ code }: CodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="gw-sp-card overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e0e]/90 p-4 space-y-3">
      {/* Creator + Brand */}
      <div className="flex items-center gap-2">
        {code.talent.photoUrl && (
          <Image src={code.talent.photoUrl} alt={code.talent.name} width={20} height={20} className="rounded-full object-cover" />
        )}
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">{code.talent.name}</span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wider">{code.brandName}</span>
      </div>

      {/* Code */}
      <div className="flex items-center gap-2">
        <a
          href={code.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] font-mono text-sm text-sp-orange font-bold tracking-wider transition-colors hover:border-sp-orange/50 hover:bg-white/[0.06]"
          aria-label={`Abrir enlace de ${code.brandName} para ${code.code}`}
        >
          {code.code}
        </a>
        <motion.button
          onClick={handleCopy}
          className="px-4 py-2.5 rounded-lg bg-sp-grad text-white text-[11px] font-black uppercase tracking-wider shrink-0"
          whileTap={{ scale: 0.95 }}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </motion.button>
      </div>

      {/* Description */}
      {code.description && (
        <p className="text-[11px] text-white/30">{code.description}</p>
      )}

      {/* Link */}
      <a
        href={code.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-lg border border-sp-orange/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-sp-orange/70 transition-colors hover:border-sp-orange/50 hover:text-sp-orange"
      >
        Abrir enlace de {code.brandName} →
      </a>
    </div>
  );
}
